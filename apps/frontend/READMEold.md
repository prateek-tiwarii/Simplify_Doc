# Technical File Responsibilities & Architecture — Portia Legal Extractor

This document lists each key file in the monorepo (no code, just purpose), explains integration choices (**webhooks + polling**), persistence of clarifications, API endpoint specs with input/output JSON, and UX design for **summarized, understandable extraction results**.

---

## Monorepo file responsibilities

### Root

* **README.md** — project overview, setup instructions.
* **.env.example** — sample environment variables.
* **infra/** — infra configs (docker, deployment).

  * `docker-compose.yml` — orchestrates backend, frontend, MongoDB, Redis, MinIO, Weaviate.
  * `Dockerfile.backend` — backend container definition.
  * `Dockerfile.frontend` — frontend container definition.

### Backend (`apps/backend`)

* **app/main.py** — FastAPI entrypoint, routes, middlewares, auth.
* **app/agent.py** — initializes Portia agent, defines extraction plan logic.
* **app/tools/pdf\_tool.py** — PDF reader tool for ingestion.
* **app/tools/clarifications.py** — helper to manage clarifications (serialize, resolve plan runs).
* **app/db.py** — MongoDB connection setup, collections.
* **app/models.py** — schema definitions (Pydantic models for MongoDB documents).
* **app/schemas.py** — request/response validation for API endpoints.
* **app/worker.py** — worker process (background tasks for running Portia agent, monitoring runs).
* **app/config.py** — environment variable management.
* **requirements.txt** — Python dependencies.

### Frontend (`apps/frontend`)

* **app/page.tsx** — dashboard/home.
* **app/upload.tsx** — contract upload UI.
* **app/review/\[clarificationId].tsx** — legal team review form.
* **app/components/** — shared React components (file uploader, status cards, PDF viewer, clarification form).
* **package.json** — dependencies.

### Infra

* **infra/docker-compose.yml** — local dev services (backend, frontend, mongodb, redis, weaviate, minio).
* \*\*infra/\*\*Dockerfiles — build backend/frontend containers.

### CI/CD

* **.github/workflows/backend-deploy.yml** — CI pipeline for backend.
* **.github/workflows/frontend-deploy.yml** — CI pipeline for frontend.

---

## Clarifications flow with Webhooks + Polling

1. **Clarification raised:**

   * Worker detects `Clarification` in Portia run.
   * Persist in MongoDB `clarifications` collection.
   * Trigger **email notification** and optional **Slack webhook**.

2. **Frontend polling:**

   * Next.js polls `/api/contracts/{id}/clarifications`.
   * Always returns unresolved clarifications from DB.
   * If tab was closed, user sees them when they log back in.

3. **Clarification resolved:**

   * User submits resolution via `/api/clarifications/{id}/resolve`.
   * Backend updates DB and resumes Portia run.

4. **Extraction complete:**

   * Persist structured result in MongoDB `extractions` collection.
   * Send notification to Slack/email.

---

## API endpoint specifications

### 1. Upload Contract

**POST** `/api/contracts/upload`

* **Input (multipart/form-data):**

  ```json
  { "file": <PDF file>, "metadata": {"title": "Contract ABC"} }
  ```
* **Response:**

  ```json
  { "contract_id": "64c0f9...", "status": "processing" }
  ```

### 2. List Clarifications for a Contract

**GET** `/api/contracts/{contract_id}/clarifications`

* **Response:**

  ```json
  [
    {
      "id": "clar123",
      "question": "Which effective date should we use?",
      "options": ["2024-01-01", "2024-02-01"],
      "status": "pending",
      "created_at": "2025-08-20T10:00:00Z"
    }
  ]
  ```

### 3. Resolve Clarification

**POST** `/api/clarifications/{clarification_id}/resolve`

* **Input:**

  ```json
  { "answer": "2024-01-01" }
  ```
* **Response:**

  ```json
  { "id": "clar123", "status": "resolved", "resolved_at": "2025-08-21T12:00:00Z" }
  ```

### 4. Get Extraction Result

**GET** `/api/contracts/{contract_id}/extraction`

* **Response:**

  ```json
  {
    "contract_id": "64c0f9...",
    "status": "completed",
    "summary": "This contract is between ABC Corp and XYZ Ltd, effective 2024-01-01, renewable annually.",
    "parties": ["ABC Corp", "XYZ Ltd"],
    "dates": {"effective_date": "2024-01-01", "termination_date": "2025-01-01"},
    "obligations": [
      {"party": "ABC Corp", "text": "Deliver monthly software updates"},
      {"party": "XYZ Ltd", "text": "Provide payment of $50,000 quarterly"}
    ],
    "clarifications": [ {"id": "clar123", "status": "resolved"} ]
  }
  ```

---

## User experience after extraction

Instead of showing a raw JSON or lengthy contract text, the frontend should provide:

1. **Readable Summary Card:**

   * Key parties
   * Effective and termination dates
   * Overall obligations summary (short sentences)
   * Renewal/termination rules

2. **Highlights with drill-down:**

   * Obligations in bullet points grouped by party.
   * Important clauses (dates, payments, renewal) surfaced first.

3. **Visual indicators:**

   * Status chips (e.g., *Active until Jan 2025*, *Pending Renewal*).
   * Risk flags (if agent marks ambiguous clauses).

4. **Download/export options:**

   * Export summary as PDF.
   * Download full structured JSON for system integration.

This way, the user interacts with a concise, clear overview instead of parsing the entire contract text.

---

## Slack and Email Notifications

* **Slack:** post messages on clarification raised/resolved and extraction complete.
* **Email:** transactional notifications with summary + action links.

---

## MongoDB + Weaviate integration

* **MongoDB** stores contracts, clarifications, extractions.
* **Weaviate** stores clause embeddings for semantic search.
* After extraction, backend populates both.

---

## Summary

* File responsibilities defined.
* Clarification flow uses webhooks (Slack/email) + polling (Next.js).
* API endpoints with input/output JSON defined.
* After extraction, user sees **summarized results** with clear highlights, not raw contracts.
