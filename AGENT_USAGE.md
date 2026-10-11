# AGENT_USAGE — AI Assistance & Development Workflow

This document details the AI tools, prompts, delegated work, corrections, and verification methods used during the development of **ClaimGuard — Expense Claim Policy Review Assistant**.

---

## 1. Tools Used

- **AI Assistants**: Antigravity IDE Pair Programming Assistant, Groq LLM API (`openai/gpt-oss-120b`).
- **Backend Stack**: Python 3.11, FastAPI, Uvicorn, Motor (Async MongoDB), Pydantic, Certifi.
- **Frontend Stack**: React 19, Vite 8, Tailwind CSS, Lucide Icons.
- **Infrastructure & Deployment**: MongoDB Atlas, Vercel, Git/GitHub.

---

## 2. Representative Prompts

Below are key prompts illustrating how work was directed throughout the development cycle:

### Policy Calibration & Localization
> *"Remove all settings UI because API keys and database URIs must be sourced from the .env file. Use INR (₹) instead of dollars everywhere for the claim amounts and update policy category limits accordingly. Set the claimant placeholder to 'e.g. Sarthak Jain'."*

### Deployment Configuration
> *"I want to deploy the application. Configure the frontend and backend to communicate via environment variables for deployment, handling CORS and API URLs cleanly."*

### Vercel Deployment Troubleshooting
> *"Vercel is giving me this error: 'Remove the public framework prefix to keep this value private. Public prefixes expose values to the browser. If that’s safe, change the variable to Config.' How do I resolve this?"*

---

## 3. Delegated Work

### Delegated to AI:
- **FastAPI Endpoint Implementation**: REST endpoints for `/api/status`, `/api/policy`, `/api/claims`, `/api/dashboard/stats`, and `/api/audit-logs`.
- **Deterministic Rule Engine**: Calculation of claim aging (30-day flag, 90-day expiry), duplicate submission checks, and spending cap validations.
- **Frontend Component Scaffolding**: React components including Sidebar, Dashboard metrics, Review action modal, and Toast notifications.
- **Unit Test Suite**: Creating `backend/test_policy.py` covering edge cases for receipts, category thresholds, late dates, and duplicate detection.
- **Build & CORS Configuration**: Dynamic origin whitelisting in FastAPI and environment directory fallback in Vite.

### Human Decisions & Oversight:
- **Product Scope & Constraints**: Requiring INR (`₹`) currency, specifying category spending limits, and enforcing human review before approving claims.
- **Security Decisions**: Insisting that database URIs and Groq keys live exclusively in server-side environment variables without user-facing settings inputs.
- **Error Triage & Deployment**: Setting up Vercel hosting, configuring MongoDB Atlas Network Access rules, and validating production deployment.

---

## 4. Important Agent Mistakes & Rejected Suggestions

1. **Initial Currency Defaulted to USD ($)**:
   - *Mistake*: The initial scaffold used USD (`$`) amounts and dollar-based limits.
   - *Correction*: The developer instructed the agent to strictly standardize on Indian Rupees (`₹`), updating frontend currency formatting (`en-IN`), database defaults, and realistic corporate INR limits (e.g. ₹5,000 for meals, ₹35,000 for travel).

2. **In-App API Key Configuration Screen**:
   - *Mistake*: The agent proposed a Settings page where users could enter their Groq API Key and MongoDB URI in the browser.
   - *Correction*: Rejected for security reasons. All sensitive configuration was moved strictly into root `.env` variables and backend server-side handling.

3. **Vercel Framework Prefix Conflict (`VITE_API_BASE_URL`)**:
   - *Mistake*: Vite environment variables require the `VITE_` prefix to be exposed to client code, but Vercel marks new variables as "Secret" by default and throws a public prefix validation error.
   - *Correction*: The developer and agent resolved this by identifying Vercel's "Config" type option and adding fallback support for `BACKEND_URL` in `vite.config.js`.

4. **MongoDB Atlas TLS Handshake Error on Serverless**:
   - *Mistake*: The cloud backend deployed on Vercel fell back to in-memory mode due to `SSL: TLSV1_ALERT_INTERNAL_ERROR`.
   - *Correction*: Identified that MongoDB Atlas Network Access needed `0.0.0.0/0` (Allow Access from Anywhere) for Vercel dynamic IPs, and updated the Motor client initialization to include `certifi` CA certificates (`tlsCAFile=certifi.where()`).

---

## 5. How Outputs Were Verified

- **Automated Unit Testing**: Executed `python -m unittest test_policy.py` in the backend virtual environment to verify all deterministic validation rules.
- **Live API Health Probing**: Verified backend status, database connection, and CORS headers via PowerShell `Invoke-RestMethod` on both local (`http://127.0.0.1:8000/api/status`) and production endpoints.
- **Frontend Production Bundling**: Ran `npm run build` with Vite to ensure zero compilation or bundling warnings/errors.
- **Interactive UI Testing**: Tested end-to-end workflows (submitting claims, reviewing flagged items, approving/rejecting claims, inspecting audit logs) directly on the live deployed Vercel application.
