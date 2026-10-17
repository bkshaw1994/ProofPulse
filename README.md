# ProofPulse

> **Verified Social Proof & Real-Time Ethical Urgency SaaS for Modern E-Commerce**

ProofPulse is an enterprise-ready, multi-tenant social proof platform engineered specifically for e-commerce merchants in India (Shopify, WooCommerce, course creators, D2C brands) and worldwide. It enables merchants to display authenticated customer activity and legitimate urgency notifications that build trust and drive conversions without ever manipulating visitors.

---

## ⚡ The Zero-Fabrication Guarantee

Unlike conventional social proof tools that encourage fake purchase alerts, synthetic visitor counters, and deceptive countdown timers, **ProofPulse enforces cryptographic verification and authoritative provenance**:

1. **Recent Verified Purchases**: Displays real customer purchases backed by signed webhook events from Shopify, WooCommerce, or verified server-to-server APIs.
2. **Recent Verified Signups**: Real-time registration activity from verified platform users.
3. **Product Popularity**: Calculated from actual historical order and cart event volumes.
4. **Live Visitor Counts**: Documented time-windowed presence telemetry (no arbitrary multipliers).
5. **Low-Stock Warnings**: Backed by authoritative real-time inventory snapshots from merchant store catalogs.
6. **Legitimate Countdowns**: Offer timers bound to immutable, server-enforced expiration deadlines.

> **Policy**: If an event source is unverified, stale, or unavailable, ProofPulse immediately suppresses the notification. We never fabricate data.

---

## 🏗️ Repository Architecture

ProofPulse is structured as an independently buildable npm workspaces monorepo:

```
proofpulse/
├── apps/
│   ├── api/                 # Express REST API (/api/v1), Swagger UI, Pino logger
│   ├── dashboard/           # React + Vite + Tailwind CSS Merchant Admin Portal
│   └── widget/              # Standalone TypeScript embed bundle (<20KB, Shadow DOM)
├── packages/
│   ├── shared-types/        # Canonical TypeScript types & interfaces
│   ├── validation/          # Zod validation schemas shared across apps
│   └── config/              # Shared constants, plans, and defaults
├── database/
│   ├── migrations/          # Pure SQL schema migrations (PostgreSQL / Supabase)
│   └── seeds/               # Local test fixtures and deterministic seeds
├── tests/
│   ├── integration/         # Supertest API endpoint test suites
│   ├── e2e/                 # Playwright end-to-end user journey tests
│   ├── security/            # IDOR, HMAC spoofing, and sanitization tests
│   └── load/                # Performance benchmarks
├── docs/
│   ├── architecture/        # System overview, DB design, security architecture
│   ├── api/                 # OpenAPI 3.0 specification (openapi.yaml)
│   ├── development/         # Engineering roadmap and phase tracking
│   └── operations/          # Deployment, backup, rollback runbooks
├── .github/
│   └── workflows/ci.yml     # Automated CI: lint, type-check, test, build
├── .env.example             # Documented environment template with security bounds
└── README.md
```

---

## 🚀 Technology Stack

- **Dashboard**: React 18/19, TypeScript (strict), Vite, Tailwind CSS, React Router v6, Lucide Icons, Recharts.
- **Backend API**: Node.js 22 LTS, Express, TypeScript, Zod, Helmet, Pino, Swagger UI.
- **Data & Auth**: Supabase PostgreSQL 15+, Supabase Auth, Row Level Security (RLS), PgBouncer.
- **Public Widget**: Vanilla TypeScript, W3C Shadow DOM (closed mode), zero framework dependencies, accessible (WCAG 2.1 AA).
- **Payment Gateway**: Razorpay (India INR pricing: Free, ₹499/mo, ₹1,499/mo, ₹3,999/mo).
- **Testing**: Vitest, Supertest, Playwright.

---

## 🛠️ Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x LTS` (Node 22 LTS recommended)
- **npm**: `v10.x` or higher
- **Supabase Account / Local CLI** for PostgreSQL and Authentication

### 2. Environment Configuration
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase URL, keys, and test Razorpay credentials.

### 3. Installation & Build
```bash
# Install all dependencies across monorepo workspaces
npm install

# Build all shared packages and apps
npm run build

# Run unit and integration tests
npm run test

# Start local development servers
npm run dev
```

The apps will be available at:
- **Merchant Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000/api/v1`
- **API Documentation (Swagger)**: `http://localhost:4000/api-docs`
- **Widget Script**: `http://localhost:4000/widget/proofpulse.js`

---

## 🔒 Security & Privacy (DPDP Act Ready)

ProofPulse is engineered with security-first and privacy-by-design standards:
- **Strict Role-Based Multi-Tenancy**: All queries validate workspace membership; cross-workspace IDOR vulnerabilities are prevented at both database (RLS) and API authorization layers.
- **Cryptographic Webhook Verification**: Third-party incoming webhooks (e.g., Shopify `X-Shopify-Hmac-Sha256`) are verified before processing.
- **Data Minimization & Pseudonymization**: Full customer names, phone numbers, and physical street addresses are stripped at the ingestion boundary. Only display names (e.g., `"Priya from Bengaluru"`) are retained.
- **No Client Secrets**: Supabase service-role keys and private API keys are never bundled in client code or widget scripts.

---

## 📖 Documentation Index

- [System Architecture Overview](file:///Users/2327738/Desktop/Study/Start-Up/Plan%20B/docs/architecture/overview.md)
- [Database Schema & ERD](file:///Users/2327738/Desktop/Study/Start-Up/Plan%20B/docs/architecture/database.md)
- [OpenAPI 3.0 Specification](file:///Users/2327738/Desktop/Study/Start-Up/Plan%20B/docs/api/openapi.yaml)
- [Engineering Roadmap](file:///Users/2327738/Desktop/Study/Start-Up/Plan%20B/docs/development/roadmap.md)
