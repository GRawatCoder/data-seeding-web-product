# Data Seeding Web Product – Master Plan

## 1. Purpose of This Document

This document is the **single source of truth** for all requirements, decisions, constraints, and future directions discussed so far for the **Salesforce Sandbox-to-Sandbox Data Seeding Web Product**.

It will evolve over time as we build the product feature-by-feature.

---

## 2. Product Vision

Build a **secure, modern, user-friendly web product** that allows controlled and trusted **data seeding from one Salesforce sandbox to another** using Salesforce-recommended OAuth authentication.

The product should feel:

* Enterprise-grade
* Clean and intuitive
* Safe and transparent

---

## 3. Core Constraints & Assumptions

### 3.1 Salesforce-Specific Constraints

* All source and destination systems are **Salesforce sandboxes**
* **One Connected App per sandbox** (mandatory Salesforce security model)
* Connected Apps **must be created before OAuth implementation**
* OAuth must follow **Salesforce Web Server OAuth Flow**
* Cross-org OAuth shortcuts are **not supported** by Salesforce

### 3.1 Salesforce-Specific Constraints

* All source and destination systems are **Salesforce sandboxes**
* **One Connected App per sandbox** (mandatory Salesforce security model)
* OAuth must follow **Salesforce Web Server OAuth Flow**
* Cross-org OAuth shortcuts are **not supported** by Salesforce

### 3.2 Technical Constraints (Current Phase)

* ❌ **No database will be used initially**
* ✅ Configuration will be:

  * In-memory
  * File-based (JSON / ENV) where needed
* ✅ Persistence layer will be added later

### 3.3 Development Constraints

* IDE: **VS Code**
* Frontend language: **JavaScript (not TypeScript)**
* Clean separation of frontend and backend

---

## 4. High-Level Architecture

### 4.1 Logical Layers

```
Browser (Frontend UI)
   ↓
Web Product Backend (API + OAuth + Token Manager)
   ↓
Salesforce Sandbox A  →  Salesforce Sandbox B
```

### 4.2 Responsibility Split

#### Frontend

* UI rendering
* User interactions
* OAuth initiation (redirects only)
* Displaying health & trust indicators

#### Backend

* OAuth flow handling
* Token exchange & refresh
* Token encryption
* Salesforce API communication
* Health checks

---

## 5. Frontend Requirements

### 5.1 UX Principles (Mind-Blowing UI)

The UI must feel premium, confident, and effortless.

Core principles:

* ✔ Zero clutter (only what the user needs, when they need it)
* ✔ Visual feedback everywhere (hover, click, load, success, error)
* ✔ Clear progress states (connecting, validating, ready)
* ✔ Smooth, purposeful animations (never distracting)
* ✔ Confident success confirmation (clear, reassuring, celebratory)
* ✔ Dark + Light mode support
* ✔ Mobile-first responsive design

---

### 5.2 Frontend Tech Stack (Confirmed)

* **React (JavaScript)** – Component-driven UI
* **Tailwind CSS** – Utility-first, consistent design system
* **Framer Motion** – Smooth animations & transitions
* **Lucide Icons** – Clean, modern iconography
* **React Query** – Server state, caching, loading & error states

Design goals:

* Admin-dashboard quality UX
* Fast interactions
* Easy theming
* Highly maintainable component structure

### 5.1 General UX Guidelines

* Light theme by default
* Optional dark theme
* Responsive (desktop-first, mobile-safe)
* Modern, clean, minimal UI
* Salesforce-inspired but not Salesforce-cloned

### 5.2 Pages

#### 5.2.1 Web Product Login Page

* Login to the web product (not Salesforce)
* Initial phase: simple admin access

#### 5.2.2 Admin – Sandbox Setup Page

Admin can:

* Add a Salesforce sandbox
* Provide:

  * Friendly sandbox name
  * Sandbox type (Dev / QA / UAT etc.)
  * Salesforce login URL (MyDomain / test.salesforce.com)
* Initiate OAuth connection
* View sandbox connection status

Visual indicators:

* Connected
* Token valid
* Token expired
* Disconnected

#### 5.2.3 Sandbox Selection Page (User View)

* Select **Source Sandbox**
* Select **Destination Sandbox**
* Only healthy & validated sandboxes are shown

#### 5.2.4 Health & Trust Dashboard

* OAuth connection status
* Last successful Salesforce API call
* Token expiry countdown
* Manual disconnect option

---

## 6. Backend Requirements

### 6.1 Core Services

| Service          | Responsibility                   |
| ---------------- | -------------------------------- |
| Auth Service     | Web product authentication       |
| OAuth Service    | Salesforce OAuth Web Server Flow |
| Token Manager    | Secure token storage & refresh   |
| Salesforce Proxy | All Salesforce API calls         |
| Health Monitor   | Connection validation            |

### 6.2 OAuth Requirements

* OAuth Web Server Flow only
* Authorization Code grant
* Refresh token support
* Secure redirect URI handling

### 6.3 Security Requirements

* Encrypt refresh tokens (AES-256 or equivalent)
* Never expose tokens to frontend
* Auto-refresh access tokens
* Allow revocation from Salesforce

---

## 7. Token Storage Strategy (Phase 1 – No DB)

* In-memory storage for runtime
* Optional encrypted JSON file for persistence (local dev only)
* Environment variables for secrets

> ⚠️ This will be replaced by a database-backed strategy later

---

## 8. Health Monitoring & Trust Signals

The product must clearly communicate trust:

* OAuth success confirmation
* Secure connection messaging
* Token validity indicators
* Non-alarming error handling

Users must always know:

* Which sandbox is connected
* Whether it is safe to proceed

---

## 9. Platform & Tech Stack Decision

### 9.1 Frontend Platform

**Decision:**

* Plain **JavaScript-based modern web framework**
* SPA-style UI

**Candidates (to finalize before coding):**

* Vite + Vanilla JS
* React (JavaScript only)

Criteria:

* Fast iteration
* Clean component model
* Easy theming

### 9.2 Backend Platform

**Decision:**

* Node.js-based backend

**Candidates:**

* Express.js
* Fastify

Responsibilities:

* OAuth handling
* Secure API layer
* Salesforce REST API proxy

---

## 10. Development Phases

### Phase 0 – Salesforce Connected App Setup (Mandatory)

* Create **one Connected App per Salesforce sandbox**
* Configure OAuth Web Server Flow
* Define localhost callback URL(s)
* Select minimal required OAuth scopes
* Store Client ID & Client Secret securely (ENV only)
* Validate login manually before coding OAuth

> ⚠️ OAuth development must NOT start until this phase is completed

---

### Phase 1 – Foundation (Current Focus)

* Web product shell
* Admin sandbox setup UI
* OAuth per sandbox
* Token handling (without DB)
* Health check

### Phase 1 – Foundation (Current Focus)

* Web product shell
* Admin sandbox setup UI
* OAuth per sandbox
* Token handling
* Health check

### Phase 2 – Data Awareness

* Object discovery
* Record count preview
* Read-only validation

### Phase 3 – Data Seeding Engine

* Field mapping
* Dependency resolution
* Transaction safety
* Rollback strategy

---

## 11. Non-Goals (For Now)

* ❌ Production org support
* ❌ Bulk data migration at scale
* ❌ Database persistence
* ❌ Field-level transformations

---

## 12. Guiding Principles

* **Follow industry and Salesforce best practices at every layer**

  * Secure-by-default design
  * Least-privilege access
  * Clear separation of concerns
  * Readable, maintainable code
  * Defensive error handling
  * Explicit logging (no silent failures)

* Small steps, production-grade quality

* Salesforce security first

* UX clarity over feature overload

* Build like a real SaaS product

* Small steps, production-grade quality

* Salesforce security first

* UX clarity over feature overload

* Build like a real SaaS product

---

## 13. Next Step

**Finalize platform choice (frontend + backend)** and then:

➡️ Design **Admin Sandbox Setup Page** (UI + API contract)
