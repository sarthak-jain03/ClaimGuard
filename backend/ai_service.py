import json
import re
import os
import logging
from typing import Dict, Any, Optional
from groq import AsyncGroq
from policy import EXPENSE_POLICY, CATEGORY_LABELS

logger = logging.getLogger("claimguard.ai")


def build_policy_text() -> str:
    sections = []
    for s in EXPENSE_POLICY["sections"]:
        rules_str = "\n".join([f"- {r}" for r in s["rules"]])
        sec_text = f"## {s['title']}\n{s['content']}\nRules:\n{rules_str}"
        sections.append(sec_text)
    return "\n\n".join(sections)


async def analyze_claim_with_groq(
    claim: Dict[str, Any],
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    category_limit: Optional[float] = None
) -> Dict[str, Any]:
    key = (api_key or os.getenv("GROQ_API_KEY", "")).strip()
    if not key:
        raise ValueError("Groq API key is not configured in the environment file.")

    target_model = model or os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    policy_text = build_policy_text()

    category_key = claim.get("category", "")
    category_label = CATEGORY_LABELS.get(category_key, category_key)
    amount = claim.get("amount", 0)
    currency = claim.get("currency", "INR")

    system_prompt = f"""You are ClaimGuard, an expert enterprise expense claim auditor. You review employee expense claims against company policy and provide structured, evidence-based compliance analysis.

COMPANY EXPENSE POLICY:
{policy_text}

Your response must be ONLY a valid JSON object with this exact structure:
{{
  "suggestedCategory": "<category key matching: meals|travel|accommodation|office_supplies|software|training|client_entertainment|communication|other>",
  "categoryConfidence": <number between 0 and 100>,
  "categoryUncertain": <true or false>,
  "complianceStatus": "<compliant|non_compliant|needs_clarification|requires_review>",
  "complianceSummary": "<1-2 sentence executive summary>",
  "policyAnalysis": "<detailed paragraph explaining compliance assessment or issues>",
  "policyCitation": "<exact policy rule or limit being cited>",
  "missingInformation": ["<item1>", "<item2>"],
  "redFlags": ["<issue1>", "<issue2>"],
  "recommendations": "<actionable recommendation for the reviewer>",
  "overLimitAmount": <number or null>,
  "requiresManagerApproval": <true or false>,
  "clarificationQuestions": ["<question1>", "<question2>"]
}}"""

    limit_info = f"₹{category_limit:,.2f}" if category_limit is not None else "No limit configured"

    user_prompt = f"""Analyze this expense claim:

Claimant: {claim.get('claimant', 'Unknown')}
Department: {claim.get('department', 'Not specified')}
Date: {claim.get('date', 'Not specified')}
Category (user-selected): {category_label}
Amount: {currency} {amount}
Currency: {currency}
Receipt Available: {claim.get('receipt', 'no')}
Description: {claim.get('description', 'None')}
Project/Cost Center: {claim.get('project', 'Not specified')}

Configured category limit: {limit_info}

Please analyze this claim for policy compliance, confirm or correct the expense category, identify red flags or missing receipts/items, and cite specific rules."""

    client = AsyncGroq(api_key=key)

    response = await client.chat.completions.create(
        model=target_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        max_tokens=2048
    )

    raw_content = response.choices[0].message.content or ""

    match = re.search(r"\{[\s\S]*\}", raw_content)
    if not match:
        raise ValueError(f"AI response did not contain a valid JSON object: {raw_content[:200]}")

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI JSON response: {e}")
