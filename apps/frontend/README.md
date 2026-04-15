# Obligence: AI-Powered Contract Intelligence Platform
![Obligence](/apps/frontend/public/landing.png)
> Seamlessly extract, analyze, and gain insights from contracts using Portia AI.  
> **Monorepo: Next.js 15.5 (Frontend) & FastAPI + Portia SDK (Backend)**  
>  
> _Built during AgentHack 2025!_

---

## 🚀 Features

- **Automated Legal Document Extraction:**  
  Upload PDF contracts and agreements; extract parties, obligations, dates, and critical clauses in seconds.
- **Hybrid AI + Human-in-the-Loop Review:**  
  Portia agent flags ambiguities and routes them to you — ensuring high-confidence results.
- **Real-Time Risk Analysis:**  
  Instantly identifies missing or risky clauses so you can act before it’s too late.
- **Interactive Insights Dashboard:**  
  Visualize, export, and search structured contract data, deadlines, and risk metrics.
- **Seamless Collaboration:**  
  Multi-user access, notifications, and rapid feedback cycles for audit-ready workflows.

---

## 🧠 Technical Process Overview

### 1. Contract Upload & Ingestion

*Users upload a PDF through the Next.js frontend.*  
- React dropzone for upload
- Immediate feedback on format, size, duplicates

### 2. AI Extraction (Backend/Portia SDK)

*FastAPI backend manages async document processing:*
- Saves incoming file & metadata
- Kicks off Portia agent with `PDFReader` and legal extraction plan
- Portia parses text, runs custom clause prompts, structures results:
    - **Extracted:** `parties`, `dates`, `obligations`, `clauses`, risk triggers    
    
- **If ambiguity:**  
  - Portia’s planners flag for human input, pausing flow until legal review/response is given (stored to DB, resumes on resolve)
- Stores final structured data + trace for full auditability

### 3. Results Presentation & Dashboard (Frontend)

- Fetches extraction summaries and traces via REST API
- Dynamic table and PDF viewer with highlight overlays
- Real-time updates via long-poll for background jobs
- User can review, submit clarifications and download data as PDF or JSON

---

## 🖼️ Architecture & Demo
- Core Architecture workflow: -
![Architecture Flowchart](apps/frontend/public/Flowchart.png)

- Portia Plan builder workflow: -
![Portia Plan Builder Flowchart](apps/frontend/public/portia.png)

## 🌟 User Flow

1. **Sign Up / Log In**  
   Fast, secure onboarding with multiple account linking  .
2. **Document Upload**  
   Drag-and-drop or browse, status bar feedback.
3. **Background Extraction**  
   Automatic queueing; jobs start instantly.
4. **Review Results**  
   Explore extracted data; flagged sections if review needed.
5. **Action & Collaboration**  
   Mark issues resolved, or comment for later review.
6. **Export & Analyze**  
   Download structured data or view reports in dashboard.

---

## 🛠️ Installation & Local Development

### Prerequisites

- Node.js (v18+)
- Python 3.10+
- Docker Compose (for databases/cache)
- Portia API SDK key (sign up at [Portia Labs](https://portialabs.ai))

### 1. Clone the Monorepo
```git clone https://github.com/yourusername/obligence.git
cd obligence```

### 2. Set Up Infrastructure
```docker-compose up -d```

### 3. Backend (FastAPI + Portia)
```
cd packages/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Fill PORTIA & DB keys
alembic upgrade head # Migrate DB
uvicorn app.main:app --reload
```

### 4. Frontend (Next.js)
```
cd packages/frontend
pnpm install
cp .env.local.example .env.local # Set NEXT_PUBLIC_API_URL
pnpm dev

```
- Access the frontend at [localhost:3000](http://localhost:3000)
- API is served at [localhost:8000](http://localhost:8000)

---

## 📦 Repo Structure

obligence/
├── apps/
│ ├── backend/ # FastAPI + Portia SDK agent logic & API
│ └── frontend/ # Next.js 14, React, all UI/UX assets
├── infrastructure/ # Docker, scripts, infra-as-code
└── README.md

Made by Ishaan and Pranav Tripathi during AgentHack 2025