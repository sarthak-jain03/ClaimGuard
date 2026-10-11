# ClaimGuard — Expense Claim Policy Review Assistant

An enterprise expense claim review application that validates employee expense claims against organizational policy using deterministic rules and compliance analysis, backed by FastAPI, React, and MongoDB Atlas.

---

## Overview

ClaimGuard streamlines the corporate expense review cycle. When employees submit claims, the system evaluates the submission through a two-tier review pipeline:

1. **Deterministic Rule Engine**: Instantly validates submission dates, receipt requirements, duplicate submissions, and category budget ceilings.
2. **Policy Compliance Engine**: Analyzes business justifications against policy clauses, detects red flags, identifies missing information, and cites policy sections for review.

---

## Features

- **Automated Validation**:
  - Receipt verification for expenses exceeding ₹500.
  - Category spending caps (Meals, Travel, Accommodation, Software, Training, Office Supplies, Entertainment, Communication).
  - Claim aging enforcement (flags submissions older than 30 days; rejects claims older than 90 days).
  - Duplicate detection based on claimant, expense date, category, and amount.

- **Auditor Workflow**:
  - Approve or Reject claims with mandatory or optional review notes.
  - Request Clarifications directly back to claimants.
  - Override expense categories with logged justifications.
  - Reopen resolved claims for re-investigation.

- **Tamper-Evident Audit History**:
  - Logs all lifecycle actions (submission, approvals, rejections, category overrides) with timestamps and reviewer identities.

- **Persistence & Cloud Sync**:
  - Native integration with **MongoDB Atlas**.
  - Automatic fallback to in-memory store if the database connection is offline.

---

## Project Structure

```
ClaimGuard/
├── .env                  # Environment configuration (Groq & MongoDB Atlas)
├── .gitignore            # Git exclusion rules
├── README.md             # Project documentation
├── backend/              # Python FastAPI backend
│   ├── ai_service.py     # Policy analysis & verification service
│   ├── database.py       # MongoDB Atlas connection & CRUD operations
│   ├── main.py           # FastAPI REST API endpoints
│   ├── policy.py         # Expense policy rules & deterministic checks
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Python virtual environment
└── frontend/             # React 19 + Vite frontend
    ├── index.html        # HTML entry point
    ├── package.json      # Frontend dependencies & scripts
    ├── vite.config.js    # Vite build configuration
    ├── tailwind.config.js# Tailwind CSS styling configuration
    └── src/
        ├── api.js        # Backend API integration client
        ├── App.jsx       # Root application component
        ├── policyData.js # Client-side policy definitions & formatters
        ├── components/   # Sidebar, Toast, Modal, Loading overlays
        └── views/        # Dashboard, New Claim, Claims Table, Detail, Policy, History
```

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic, Motor (Async MongoDB), Groq SDK
- **Database**: MongoDB Atlas (with in-memory fallback)


---

## Getting Started

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **MongoDB Atlas** cluster URI (optional, in-memory fallback available)
- **Groq API Key** (for policy analysis)

---

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
# Groq AI Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=claimguard
PORT=8000
```

---

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be accessible at:
- **API URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 3. Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be running at [http://localhost:5173](http://localhost:5173).

---

## Policy Categories & Limits (INR)

| Category | Spending Limit | Key Requirement |
| :--- | :--- | :--- |
| **Meals & Entertainment** | ₹5,000 / day | Per-meal limit ₹2,500; itemized receipts required |
| **Travel & Transportation** | ₹35,000 / trip | Economy class for flights <6h; mileage at ₹15/km |
| **Accommodation** | ₹8,000 / night | Standard rooms only; incidentals capped at ₹2,000/day |
| **Office Supplies** | ₹10,000 / month | ₹3,000 per-item cap without prior manager approval |
| **Software & Subscriptions** | ₹25,000 / year | IT Security approval required before purchase |
| **Training & Education** | ₹25,000 / course | Annual training budget of ₹60,000 per employee |
| **Client Entertainment** | ₹10,000 / event | Attendee names and business justification mandatory |
| **Communication** | ₹2,500 / month | Work-related mobile (₹2,000) & internet (₹2,500) |
| **Other Expenses** | ₹3,000 / item | Manager approval required for non-standard claims |

*Note: Receipts are mandatory for all expenses exceeding ₹500.*

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Health check, MongoDB Atlas status, and engine state |
| `GET` | `/api/policy` | Expense policy sections, limits, and rules |
| `GET` | `/api/dashboard/stats` | Aggregated metrics, counts, and category breakdowns |
| `GET` | `/api/claims` | List claims with optional `status` and `search` query filters |
| `GET` | `/api/claims/{id}` | Retrieve claim details by ID |
| `POST` | `/api/claims` | Submit and validate a new expense claim |
| `POST` | `/api/claims/{id}/analyze` | Trigger re-evaluation of a claim against policy |
| `POST` | `/api/claims/{id}/action` | Execute review action (`approve`, `reject`, `clarification`, `override`, `reopen`) |
| `GET` | `/api/audit-logs` | Retrieve chronological audit history records |
| `DELETE`| `/api/claims` | Clear stored claims and audit records |

---

## Completed and Excluded Scope

### Completed Scope
- **Interactive Review Dashboard**: Real-time stats, category spending distribution, pending reviews, and live connection status badges.
- **Two-Tier Review Engine**:
  - Deterministic rules for spending limits, claim age (30-day warning, 90-day expiry), duplicate detection, and receipt requirements.
  - LLM-powered compliance verification analyzing claim justifications against policy clauses.
- **Auditor Workflow & Oversight**: Complete approval lifecycle (Approve, Reject, Request Clarification, Category Override, Reopen) ensuring human oversight over AI recommendations.
- **Audit Trail**: Chronological event logs tracking every reviewer action and claim state transition.
- **Dual Persistence**: MongoDB Atlas cloud database support with automatic, resilient fallback to in-memory storage.
- **Production Deployment**: Hosted live on Vercel with responsive desktop and mobile support.

### Excluded Scope (Intentional Design Decisions)
- **User Authentication / SSO**: Excluded intentionally to allow evaluators and reviewers to test the application instantly without login barriers.
- **Live Multi-Currency FX Converter**: Standardized strictly on Indian Rupees (INR, `₹`) across policy caps, claims, and reporting.
- **Direct OCR Document Scanning**: Receipt attachments are tracked via reference flags and URL links; OCR extraction is planned for future roadmaps.

---

## Automated Tests

ClaimGuard includes a focused unit test suite for the deterministic policy engine, validating core rules and edge cases.

To execute tests:

```bash
cd backend
python -m unittest test_policy.py
```

### Test Coverage:
- `test_valid_claim_passes`: Ensures valid claims within budget ceilings pass with 0 flags.
- `test_missing_receipt_over_threshold`: Verifies receipts are mandatory for claims exceeding ₹500.
- `test_missing_receipt_under_threshold_allowed`: Confirms expenses under ₹500 do not require receipts.
- `test_category_limit_exceeded`: Tests budget limit enforcement across expense categories.
- `test_future_date_fails`: Rejects submissions with dates in the future.
- `test_late_submission_warning`: Flags submissions older than 30 days.
- `test_expired_claim_over_90_days`: Disallows claims older than 90 days.
- `test_duplicate_claim_detected`: Detects identical submissions by claimant, date, category, and amount.

---

## Known Limitations

- **MongoDB Atlas Serverless Dynamic IPs**: When deploying on serverless runtimes (like Vercel), MongoDB Atlas Network Access must allow `0.0.0.0/0` because serverless functions lack static outbound IP addresses.
- **External AI Service Availability**: Policy compliance analysis requires valid Groq API credentials. If rate limits are reached, deterministic rules continue operating unimpeded.
- **In-Memory Volatility**: If MongoDB Atlas is unavailable, the system safely falls back to in-memory mode, which resets upon serverless function cold starts.

---

## Deployment Details

- **Frontend Deployment**: Hosted on Vercel at `https://claim-guard-lac.vercel.app/`
- **Backend Deployment**: Hosted on Vercel at `https://claim-guard-rnm7.vercel.app/`
- **Environment Variables**:
  - Frontend: `VITE_API_BASE_URL` (configured as **Config** in Vercel) or `BACKEND_URL`
  - Backend: `GROQ_API_KEY`, `MONGODB_URI`, `MONGODB_DB_NAME`, `FRONTEND_URL`
- Template environment variables are maintained in `.env.example`.

