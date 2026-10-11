import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from policy import EXPENSE_POLICY, CATEGORY_LIMITS, CATEGORY_LABELS, validate_claim
from database import (
    init_db, get_db_status, get_all_claims, get_claim_by_id,
    save_claim, clear_all_claims, bulk_save_claims,
    add_audit_log, get_all_audit_logs, get_settings, save_settings
)
from ai_service import analyze_claim_with_groq


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="ClaimGuard API",
    description="Expense Claim Policy Review Assistant Backend",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimSubmission(BaseModel):
    claimant: str
    department: Optional[str] = ""
    date: str
    category: str
    amount: float
    currency: Optional[str] = "INR"
    receipt: str
    description: str
    project: Optional[str] = ""


class ReviewActionRequest(BaseModel):
    action: str
    reviewer: Optional[str] = "Reviewer"
    note: Optional[str] = ""
    overrideCategory: Optional[str] = None


class SettingsUpdate(BaseModel):
    groqApiKey: Optional[str] = None
    groqModel: Optional[str] = None
    mongodbUri: Optional[str] = None
    categoryLimits: Optional[Dict[str, float]] = None


@app.get("/")
def root():
    return {
        "service": "ClaimGuard Policy Review Assistant API",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "online"
    }


@app.get("/api/status")
async def check_status():
    settings = await get_settings()
    db_status = get_db_status()
    has_groq_key = bool(settings.get("groqApiKey") or os.getenv("GROQ_API_KEY"))

    return {
        "apiOnline": True,
        "database": db_status,
        "ai": {
            "configured": has_groq_key,
            "model": settings.get("groqModel", "openai/gpt-oss-120b"),
            "provider": "Groq"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/policy")
def get_policy():
    return {
        "policy": EXPENSE_POLICY,
        "categoryLimits": CATEGORY_LIMITS,
        "categoryLabels": CATEGORY_LABELS
    }


@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    claims = await get_all_claims()
    total_claims = len(claims)
    pending_count = len([c for c in claims if c.get("status") in ["pending", "flagged"]])
    approved_count = len([c for c in claims if c.get("status") == "approved"])
    rejected_count = len([c for c in claims if c.get("status") == "rejected"])
    total_amount = sum([float(c.get("amount", 0) or 0) for c in claims])
    flags_count = sum([len(c.get("validationIssues", [])) for c in claims])

    category_counts = {}
    for c in claims:
        cat = c.get("category", "other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "totalClaims": total_claims,
        "pendingReview": pending_count,
        "approved": approved_count,
        "rejected": rejected_count,
        "totalAmount": total_amount,
        "totalFlags": flags_count,
        "categoryBreakdown": category_counts,
        "recentClaims": claims[:6]
    }


@app.get("/api/claims")
async def list_claims(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    claims = await get_all_claims(status=status, search=search)
    return {"claims": claims, "count": len(claims)}


@app.get("/api/claims/{claim_id}")
async def get_claim(claim_id: str):
    claim = await get_claim_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found.")
    return claim


@app.post("/api/claims")
async def submit_claim(claim_in: ClaimSubmission):
    existing_claims = await get_all_claims()
    settings = await get_settings()
    limits = settings.get("categoryLimits", CATEGORY_LIMITS)

    claim_id = f"CLM-{uuid.uuid4().hex[:8].upper()}"
    claim_dict = {
        "id": claim_id,
        "claimant": claim_in.claimant.strip(),
        "department": claim_in.department.strip() if claim_in.department else "",
        "date": claim_in.date,
        "category": claim_in.category,
        "amount": claim_in.amount,
        "currency": claim_in.currency or "INR",
        "receipt": claim_in.receipt,
        "description": claim_in.description.strip(),
        "project": claim_in.project.strip() if claim_in.project else "",
        "submittedAt": datetime.utcnow().isoformat(),
        "status": "pending",
        "validationIssues": [],
        "aiAnalysis": None,
        "reviewHistory": [],
        "reviewerOverride": None
    }

    validation_issues = validate_claim(claim_dict, existing_claims, limits)
    claim_dict["validationIssues"] = validation_issues

    groq_key = settings.get("groqApiKey") or os.getenv("GROQ_API_KEY")
    groq_model = settings.get("groqModel") or os.getenv("GROQ_MODEL")

    if groq_key:
        try:
            ai_result = await analyze_claim_with_groq(
                claim_dict,
                api_key=groq_key,
                model=groq_model,
                category_limit=limits.get(claim_dict["category"])
            )
            claim_dict["aiAnalysis"] = ai_result
            if ai_result.get("complianceStatus") == "non_compliant":
                claim_dict["status"] = "flagged"
        except Exception as e:
            claim_dict["aiAnalysis"] = {"error": str(e)}
    else:
        claim_dict["aiAnalysis"] = None

    saved = await save_claim(claim_dict)

    cat_label = CATEGORY_LABELS.get(saved["category"], saved["category"])
    await add_audit_log({
        "action": "Claim Submitted",
        "claimId": saved["id"],
        "claimant": saved["claimant"],
        "detail": f"{cat_label} — ₹{saved['amount']:,.2f}",
        "color": "#6366f1"
    })

    return saved


@app.post("/api/claims/{claim_id}/analyze")
async def rerun_analysis(claim_id: str):
    claim = await get_claim_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    settings = await get_settings()
    groq_key = settings.get("groqApiKey") or os.getenv("GROQ_API_KEY")
    groq_model = settings.get("groqModel") or os.getenv("GROQ_MODEL")
    limits = settings.get("categoryLimits", CATEGORY_LIMITS)

    if not groq_key:
        raise HTTPException(status_code=400, detail="Groq API key is not configured in .env file.")

    try:
        ai_result = await analyze_claim_with_groq(
            claim,
            api_key=groq_key,
            model=groq_model,
            category_limit=limits.get(claim.get("category"))
        )
        claim["aiAnalysis"] = ai_result
        if ai_result.get("complianceStatus") == "non_compliant" and claim.get("status") == "pending":
            claim["status"] = "flagged"

        saved = await save_claim(claim)
        return saved
    except Exception as e:
        claim["aiAnalysis"] = {"error": str(e)}
        await save_claim(claim)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/claims/{claim_id}/action")
async def execute_review_action(claim_id: str, payload: ReviewActionRequest):
    claim = await get_claim_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    action_map = {
        "approve": {"status": "approved", "label": "Approved", "color": "#22c55e"},
        "reject": {"status": "rejected", "label": "Rejected", "color": "#ef4444"},
        "clarification": {"status": "clarification", "label": "Clarification Requested", "color": "#f59e0b"},
        "override": {"status": claim.get("status", "pending"), "label": "Category Overridden", "color": "#a855f7"},
        "reopen": {"status": "pending", "label": "Reopened for Review", "color": "#6366f1"}
    }

    if payload.action not in action_map:
        raise HTTPException(status_code=400, detail=f"Invalid action '{payload.action}'.")

    cfg = action_map[payload.action]
    claim["status"] = cfg["status"]

    if payload.action == "override" and payload.overrideCategory:
        claim["category"] = payload.overrideCategory
        claim["reviewerOverride"] = {
            "category": payload.overrideCategory,
            "reason": payload.note,
            "reviewer": payload.reviewer,
            "timestamp": datetime.utcnow().isoformat()
        }

    history_entry = {
        "action": cfg["label"],
        "note": payload.note or "",
        "reviewer": payload.reviewer or "Reviewer",
        "override": payload.note if payload.action == "override" else None,
        "timestamp": datetime.utcnow().isoformat(),
        "color": cfg["color"]
    }
    if "reviewHistory" not in claim or not isinstance(claim["reviewHistory"], list):
        claim["reviewHistory"] = []
    claim["reviewHistory"].append(history_entry)

    saved = await save_claim(claim)

    await add_audit_log({
        "action": cfg["label"],
        "claimId": claim_id,
        "claimant": claim.get("claimant", ""),
        "detail": payload.note or f"₹{claim.get('amount', 0):,.2f}",
        "color": cfg["color"],
        "reviewer": payload.reviewer
    })

    return saved


@app.delete("/api/claims")
async def clear_data():
    await clear_all_claims()
    return {"message": "All claims and audit logs cleared successfully."}


@app.post("/api/claims/bulk")
async def bulk_import(data: Dict[str, Any] = Body(...)):
    claims = data.get("claims", [])
    audit_logs = data.get("auditLog", [])

    for c in claims:
        await save_claim(c)

    for a in audit_logs:
        await add_audit_log(a)

    return {"message": f"Successfully imported {len(claims)} claims."}


@app.get("/api/audit-logs")
async def list_audit_logs():
    logs = await get_all_audit_logs()
    return {"auditLogs": logs}


@app.get("/api/settings")
async def read_settings():
    settings = await get_settings()
    return settings


@app.post("/api/settings")
async def update_settings(update: SettingsUpdate):
    current = await get_settings()
    patch = {}

    if update.groqApiKey is not None:
        patch["groqApiKey"] = update.groqApiKey.strip()
    if update.groqModel is not None:
        patch["groqModel"] = update.groqModel.strip()
    if update.categoryLimits is not None:
        patch["categoryLimits"] = update.categoryLimits

    if update.mongodbUri is not None and update.mongodbUri.strip():
        await init_db(update.mongodbUri.strip())

    saved = await save_settings(patch)
    return saved
