from datetime import datetime, date
from typing import List, Dict, Any, Optional

EXPENSE_POLICY = {
    "version": "2.1",
    "effectiveDate": "2026-01-01",
    "sections": [
        {
            "id": "general",
            "title": "General Principles",
            "icon": "📋",
            "color": "#6366f1",
            "content": (
                "All expense claims must be submitted within 30 days of the expense being incurred. "
                "Claims submitted after 30 days will require manager approval with a written explanation. "
                "All expenses must be for legitimate business purposes and must represent value for money. "
                "Employees must not claim expenses for personal items, entertainment of a personal nature, "
                "or any expense that has already been reimbursed through another route."
            ),
            "rules": [
                "Submit claims within 30 days of expense date",
                "All expenses require a clear business justification",
                "Receipts required for all expenses over ₹500",
                "Claims must be approved by line manager before Finance",
                "No reimbursement for expenses already covered by company card",
                "Expenses incurred more than 90 days ago are not eligible"
            ]
        },
        {
            "id": "meals",
            "title": "Meals & Entertainment",
            "icon": "🍽️",
            "color": "#f97316",
            "limits": {"perMeal": 2500, "dailyTotal": 5000, "internationalPerDiem": 10000},
            "content": (
                "Meal expenses are reimbursable when incurred during business travel or working meetings. "
                "The per-meal limit is ₹2,500 per person for domestic travel. Alcohol is not reimbursable unless "
                "it is a client entertainment event pre-approved by a VP or above."
            ),
            "rules": [
                "Per-meal limit: ₹2,500/person (domestic), ₹5,000/person (international)",
                "Daily meal total cap: ₹5,000 (domestic), ₹10,000 (international)",
                "Business purpose must be stated (who, what, why)",
                "Alcohol not reimbursable except pre-approved client events",
                "Receipts required; credit card statements alone insufficient",
                "Team meals over ₹10,000 require VP approval"
            ]
        },
        {
            "id": "travel",
            "title": "Travel & Transportation",
            "icon": "✈️",
            "color": "#3b82f6",
            "limits": {"airfare": 35000, "trainPerTrip": 10000, "taxi": 1500, "mileage": 15},
            "content": (
                "All business travel must be booked through the company travel portal where possible. "
                "Economy class is required for flights under 6 hours. Business class requires VP approval. "
                "Mileage for personal vehicle use is reimbursed at ₹15/km."
            ),
            "rules": [
                "All flights must be booked via company travel portal",
                "Economy class for domestic / flights under 6 hours",
                "Business class requires VP pre-approval",
                "Airfare cap per trip: ₹35,000 (domestic), ₹1,00,000 (international)",
                "Ground transport: Uber/Ola/metro allowed; no luxury vehicles",
                "Taxi per trip cap: ₹1,500 (waived for airport transfers)",
                "Mileage rate: ₹15/km; odometer readings required",
                "Tolls and parking reimbursable with receipts",
                "Personal car rental requires advance approval"
            ]
        },
        {
            "id": "accommodation",
            "title": "Accommodation",
            "icon": "🏨",
            "color": "#14b8a6",
            "limits": {"perNightDomestic": 8000, "perNightInternational": 20000},
            "content": (
                "Hotel accommodation is reimbursable for overnight business trips. "
                "Standard rooms only — suites or upgrades require manager approval. "
                "Incidental charges (mini-bar, room service beyond ₹2,000/day) are personal expenses."
            ),
            "rules": [
                "Hotel limit: ₹8,000/night (domestic), ₹20,000/night (international)",
                "Standard room only; suites require Director+ approval",
                "Incidentals cap: ₹2,000/day (room service, internet, etc.)",
                "Mini-bar, laundry, gym fees: personal expense",
                "Airbnb allowed with prior approval",
                "Early check-in / late check-out fees reimbursable if business necessity"
            ]
        },
        {
            "id": "office_supplies",
            "title": "Office Supplies",
            "icon": "📎",
            "color": "#22c55e",
            "limits": {"perItem": 3000, "monthly": 10000},
            "content": (
                "Office supplies needed for day-to-day work are reimbursable up to ₹3,000 per item. "
                "Large equipment purchases (monitors, ergonomic chairs, etc.) require IT and Finance approval before purchase."
            ),
            "rules": [
                "Per-item limit: ₹3,000 without prior approval",
                "Monthly office supply cap: ₹10,000 per employee",
                "Equipment over ₹5,000: requires manager + IT approval",
                "Standard office supplies only (pens, paper, binders, etc.)",
                "Personal use items not reimbursable",
                "Always purchase from preferred vendors when available"
            ]
        },
        {
            "id": "software",
            "title": "Software & Subscriptions",
            "icon": "💻",
            "color": "#a855f7",
            "limits": {"monthly": 2500, "annual": 25000},
            "content": (
                "Software tools and SaaS subscriptions directly required for job performance may be expensed. "
                "All software must be approved by IT Security before purchase to ensure compliance and licensing."
            ),
            "rules": [
                "Must have IT Security approval before purchase",
                "Monthly subscription cap: ₹2,500/month without approval",
                "Annual software cap: ₹25,000/year without Director approval",
                "Software must not duplicate existing company tools",
                "Licenses must be for business use only",
                "Free trial upgrades require advance approval"
            ]
        },
        {
            "id": "training",
            "title": "Training & Education",
            "icon": "🎓",
            "color": "#f59e0b",
            "limits": {"course": 25000, "annualBudget": 60000},
            "content": (
                "Professional development expenses are strongly encouraged. "
                "Employees have an annual training budget of ₹60,000. Courses over ₹25,000 require manager pre-approval. "
                "Conference attendance requires advance booking and manager sign-off."
            ),
            "rules": [
                "Annual training budget: ₹60,000 per employee",
                "Individual course cap: ₹25,000 without approval",
                "Courses over ₹25,000 require manager + HR approval",
                "Conferences require advance booking and manager approval",
                "Training must be relevant to current role or career path",
                "Books and online learning subscriptions included in budget",
                "Conference travel expenses claimed separately"
            ]
        },
        {
            "id": "client_entertainment",
            "title": "Client Entertainment",
            "icon": "🤝",
            "color": "#ec4899",
            "limits": {"perEvent": 10000, "perPersonLimit": 5000},
            "content": (
                "Client entertainment must have a clear business development purpose. "
                "All client entertainment over ₹10,000 per event requires VP approval. "
                "A client entertainment form must be submitted with attendee names and business purpose."
            ),
            "rules": [
                "Must include names of all attendees (internal and external)",
                "Clear business purpose required",
                "Per-event cap: ₹10,000 (VP approval required above this)",
                "Per-person cap: ₹5,000",
                "Alcohol included only if part of a meal event",
                "Gifts to clients: max ₹2,500/person/year, must be pre-approved",
                "Anti-bribery policy must be adhered to at all times"
            ]
        },
        {
            "id": "communication",
            "title": "Communication",
            "icon": "📱",
            "color": "#06b6d4",
            "limits": {"mobileMonthly": 2000, "internetMonthly": 2500},
            "content": (
                "Work-related phone and internet expenses can be reimbursed on a partial basis. "
                "Employees using personal devices for work can claim up to 50% of their monthly bill, capped at the limits below."
            ),
            "rules": [
                "Mobile phone: up to ₹2,000/month (50% of bill, whichever lower)",
                "Home internet: up to ₹2,500/month for remote workers",
                "Company-issued phones: accessories only (max ₹1,000)",
                "International roaming: pre-approval required",
                "Personal calls on company accounts must be reimbursed to company"
            ]
        },
        {
            "id": "other",
            "title": "Other Expenses",
            "icon": "📦",
            "color": "#8b92a8",
            "limits": {"perItem": 3000},
            "content": (
                "Miscellaneous business expenses not covered by other categories may be claimed "
                "with a clear business justification. Claims over ₹3,000 require manager approval."
            ),
            "rules": [
                "Clear business justification required for all other claims",
                "Per-item cap: ₹3,000 without manager approval",
                "Manager must approve with a comment for claims in this category",
                "Finance may reclassify claims to appropriate categories",
                "Repeated 'Other' claims may trigger a policy review"
            ]
        }
    ]
}

CATEGORY_LIMITS = {
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

CATEGORY_LABELS = {
    "meals": "Meals & Entertainment",
    "travel": "Travel & Transportation",
    "accommodation": "Accommodation",
    "office_supplies": "Office Supplies",
    "software": "Software & Subscriptions",
    "training": "Training & Education",
    "client_entertainment": "Client Entertainment",
    "communication": "Communication",
    "other": "Other"
}


def days_between(d1: str, d2: str) -> int:
    try:
        t1 = datetime.strptime(d1.split("T")[0], "%Y-%m-%d").date()
        t2 = datetime.strptime(d2.split("T")[0], "%Y-%m-%d").date()
        return abs((t2 - t1).days)
    except Exception:
        return 0


def validate_claim(claim: Dict[str, Any], existing_claims: List[Dict[str, Any]], limits: Optional[Dict[str, float]] = None) -> List[Dict[str, Any]]:
    issues = []
    effective_limits = limits if limits is not None else CATEGORY_LIMITS
    today_str = date.today().isoformat()
    claim_date_str = claim.get("date", "")

    if not claim_date_str:
        issues.append({"type": "error", "title": "Missing Date", "description": "Expense date is required."})
    else:
        try:
            claim_dt = datetime.strptime(claim_date_str.split("T")[0], "%Y-%m-%d").date()
            today_dt = date.today()
            if claim_dt > today_dt:
                issues.append({"type": "error", "title": "Future Date", "description": "Expense date cannot be in the future."})
            else:
                days_old = (today_dt - claim_dt).days
                if days_old > 90:
                    issues.append({"type": "error", "title": "Expired Claim", "description": f"This expense is {days_old} days old. Claims older than 90 days are not eligible."})
                elif days_old > 30:
                    issues.append({"type": "warning", "title": "Late Submission", "description": f"This expense is {days_old} days old. Claims over 30 days require manager approval with explanation."})
        except ValueError:
            issues.append({"type": "error", "title": "Invalid Date", "description": "Date must be YYYY-MM-DD."})

    amount = float(claim.get("amount", 0) or 0)
    receipt = str(claim.get("receipt", "")).lower()

    if receipt == "no" and amount > 500:
        issues.append({
            "type": "warning",
            "title": "Missing Receipt",
            "description": f"Receipt required for expenses over ₹500. Amount claimed: ₹{amount:,.2f}"
        })

    cat = claim.get("category", "")
    cat_limit = effective_limits.get(cat)
    if cat_limit is not None and amount > cat_limit:
        cat_name = CATEGORY_LABELS.get(cat, cat)
        issues.append({
            "type": "warning",
            "title": "Exceeds Category Limit",
            "description": f"{cat_name} limit is ₹{cat_limit:,.2f}. Claimed: ₹{amount:,.2f}. Manager approval required."
        })

    claim_id = claim.get("id")
    claimant = str(claim.get("claimant", "")).strip().lower()
    for existing in existing_claims:
        if existing.get("id") == claim_id:
            continue
        if (
            str(existing.get("claimant", "")).strip().lower() == claimant
            and existing.get("date") == claim.get("date")
            and existing.get("category") == cat
            and abs(float(existing.get("amount", 0)) - amount) < 0.01
        ):
            issues.append({
                "type": "error",
                "title": "Potential Duplicate",
                "description": f"This looks identical to claim {existing.get('id')} submitted by the same person for the same date, category, and amount.",
                "relatedId": existing.get("id")
            })
            break

    desc = str(claim.get("description", "")).strip()
    if len(desc) < 10:
        issues.append({"type": "error", "title": "Insufficient Description", "description": "Description must be at least 10 characters."})

    if len(claimant) < 2:
        issues.append({"type": "error", "title": "Missing Claimant", "description": "Claimant name is required."})

    return issues
