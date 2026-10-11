import os
import re
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv, find_dotenv
import motor.motor_asyncio
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

load_dotenv(find_dotenv())

logger = logging.getLogger("claimguard.db")

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "claimguard").strip()

client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
db = None
is_mongodb_connected = False
connection_error_message = ""

_mem_claims: List[Dict[str, Any]] = []
_mem_audit_logs: List[Dict[str, Any]] = []
_mem_settings: Dict[str, Any] = {
    "groqApiKey": os.getenv("GROQ_API_KEY", ""),
    "groqModel": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
    "categoryLimits": {
        "meals": 5000,
        "travel": 35000,
        "accommodation": 8000,
        "office_supplies": 10000,
        "software": 25000,
        "training": 25000,
        "client_entertainment": 10000,
        "communication": 2500,
        "other": 3000
    }
}


async def init_db(uri: Optional[str] = None):
    global client, db, is_mongodb_connected, connection_error_message, MONGODB_URI

    target_uri = uri if uri is not None else MONGODB_URI
    if not target_uri or "<username>" in target_uri or target_uri.startswith("mongodb://placeholder"):
        is_mongodb_connected = False
        connection_error_message = "MongoDB Atlas URI not configured."
        return False

    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(
            target_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        await client.admin.command('ping')
        db = client[MONGODB_DB_NAME]
        is_mongodb_connected = True
        connection_error_message = ""
        MONGODB_URI = target_uri
        return True
    except Exception as e:
        is_mongodb_connected = False
        connection_error_message = str(e)
        logger.warning(f"MongoDB connection failed: {e}")
        return False


def get_db_status() -> Dict[str, Any]:
    display_uri = ""
    if MONGODB_URI:
        display_uri = re.sub(r":([^@]+)@", ":****@", MONGODB_URI)
        display_uri = display_uri[:50] + ("..." if len(display_uri) > 50 else "")

    return {
        "connected": is_mongodb_connected,
        "mode": "mongodb_atlas" if is_mongodb_connected else "in_memory",
        "databaseName": MONGODB_DB_NAME if is_mongodb_connected else "in_memory",
        "maskedUri": display_uri if display_uri else "Not configured",
        "errorMessage": connection_error_message,
        "claimsCount": len(_mem_claims) if not is_mongodb_connected else None
    }


def _clean_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc:
        del doc["_id"]
    return doc


async def get_all_claims(status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    if is_mongodb_connected and db is not None:
        try:
            query = {}
            if status and status != "all":
                query["status"] = status
            if search:
                regex = {"$regex": search, "$options": "i"}
                query["$or"] = [
                    {"id": regex},
                    {"claimant": regex},
                    {"description": regex},
                    {"category": regex},
                    {"department": regex}
                ]
            cursor = db.claims.find(query).sort("submittedAt", -1)
            docs = await cursor.to_list(length=1000)
            return [_clean_doc(d) for d in docs]
        except Exception as e:
            logger.error(f"Error querying claims from MongoDB: {e}")

    results = list(_mem_claims)
    if status and status != "all":
        results = [c for c in results if c.get("status") == status]
    if search:
        s = search.lower()
        results = [
            c for c in results
            if s in str(c.get("id", "")).lower()
            or s in str(c.get("claimant", "")).lower()
            or s in str(c.get("description", "")).lower()
            or s in str(c.get("category", "")).lower()
            or s in str(c.get("department", "")).lower()
        ]
    return sorted(results, key=lambda x: x.get("submittedAt", ""), reverse=True)


async def get_claim_by_id(claim_id: str) -> Optional[Dict[str, Any]]:
    if is_mongodb_connected and db is not None:
        try:
            doc = await db.claims.find_one({"id": claim_id})
            return _clean_doc(doc)
        except Exception as e:
            logger.error(f"Error querying claim {claim_id}: {e}")

    for c in _mem_claims:
        if c.get("id") == claim_id:
            return dict(c)
    return None


async def save_claim(claim_data: Dict[str, Any]) -> Dict[str, Any]:
    global _mem_claims
    claim_id = claim_data.get("id")

    if is_mongodb_connected and db is not None:
        try:
            await db.claims.replace_one(
                {"id": claim_id},
                claim_data,
                upsert=True
            )
            return claim_data
        except Exception as e:
            logger.error(f"Error saving claim {claim_id} to MongoDB: {e}")

    for idx, c in enumerate(_mem_claims):
        if c.get("id") == claim_id:
            _mem_claims[idx] = dict(claim_data)
            return claim_data

    _mem_claims.insert(0, dict(claim_data))
    return claim_data


async def clear_all_claims():
    global _mem_claims, _mem_audit_logs
    if is_mongodb_connected and db is not None:
        try:
            await db.claims.delete_many({})
            await db.audit_logs.delete_many({})
            return True
        except Exception as e:
            logger.error(f"Error clearing collections in MongoDB: {e}")

    _mem_claims = []
    _mem_audit_logs = []
    return True


async def bulk_save_claims(claims_list: List[Dict[str, Any]]):
    for c in claims_list:
        await save_claim(c)


async def add_audit_log(entry: Dict[str, Any]) -> Dict[str, Any]:
    global _mem_audit_logs
    if "timestamp" not in entry:
        entry["timestamp"] = datetime.utcnow().isoformat()

    if is_mongodb_connected and db is not None:
        try:
            await db.audit_logs.insert_one(dict(entry))
            return _clean_doc(entry)
        except Exception as e:
            logger.error(f"Error saving audit log to MongoDB: {e}")

    _mem_audit_logs.insert(0, dict(entry))
    return entry


async def get_all_audit_logs() -> List[Dict[str, Any]]:
    if is_mongodb_connected and db is not None:
        try:
            cursor = db.audit_logs.find({}).sort("timestamp", -1)
            docs = await cursor.to_list(length=1000)
            return [_clean_doc(d) for d in docs]
        except Exception as e:
            logger.error(f"Error fetching audit logs: {e}")

    return list(_mem_audit_logs)


async def get_settings() -> Dict[str, Any]:
    if is_mongodb_connected and db is not None:
        try:
            doc = await db.settings.find_one({"key": "app_settings"})
            if doc:
                return _clean_doc(doc.get("settings", _mem_settings))
        except Exception as e:
            logger.error(f"Error fetching settings: {e}")

    return dict(_mem_settings)


async def save_settings(settings_data: Dict[str, Any]) -> Dict[str, Any]:
    global _mem_settings
    _mem_settings.update(settings_data)

    if is_mongodb_connected and db is not None:
        try:
            await db.settings.update_one(
                {"key": "app_settings"},
                {"$set": {"key": "app_settings", "settings": _mem_settings, "updatedAt": datetime.utcnow().isoformat()}},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error saving settings to MongoDB: {e}")

    return dict(_mem_settings)
