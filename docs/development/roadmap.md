# ProofPulse Engineering Roadmap & Phase Tracking

This document outlines the multi-phase engineering plan for building, testing, securing, and deploying **ProofPulse** as an enterprise-grade SaaS.

---

## Phase Matrix

| Phase | Description | Deliverables | Status |
|---|---|---|---|
| **Phase 0** | Workspace Discovery & Planning | Architecture overview, DB design, OpenAPI spec, Roadmap, `.env.example`, `.gitignore`, `README.md` | **COMPLETED** |
| **Phase 1** | Project Foundation & Tooling | Monorepo setup (`apps/*`, `packages/*`), TS strict configs, base migrations, centralized logger & error middleware, CI workflow | **COMPLETED** |
| **Phase 2** | Identity & Website Management | Supabase Auth context, Workspaces, RBAC, Website management, Domain verification, Installation status & health check | **COMPLETED** |
| **Phase 3** | Campaign Engine & Live Preview | Campaign CRUD, schema validation, state transitions (draft/active/paused), live preview studio simulator in dashboard | **COMPLETED** |
| **Phase 4** | Standalone Public Widget | Vanilla TS bundle (3.09KB gzipped), Shadow DOM style isolation, async loader, a11y, responsive themes, frequency throttling | **COMPLETED** |
| **Phase 5** | Verified Event Pipeline | Strict event schemas, authenticated ingestion, HMAC signature verifier (Shopify/WooCommerce), idempotency, freshness filtering | **COMPLETED** |
| **Phase 6** | Real-Time Analytics & Reporting | Aggregated impressions, clicks, dismissals, conversions, Recharts area charts, date-range filtering, session deduplication | **COMPLETED** |
| **Phase 7** | Subscriptions & Usage Quotas | Plan models (Free, Starter ₹499, Growth ₹1,499, Agency ₹3,999), Razorpay webhook verifier, server-side quota enforcement | **COMPLETED** |
| **Phase 8** | Security Hardening & Automated Testing | IDOR protection, HMAC spoofing tests, XSS & sanitization, Vitest/Supertest integration test suite (11/11 passing) | **COMPLETED** |
| **Phase 9** | Private Beta & Pilot Verification | Staging deployment guide, pilot Shopify merchant onboarding, store integration validation | **UP NEXT** |
| **Phase 10** | Production Release & Operations | Production infrastructure, migration rollback playbooks, Sentry alerting, backup & recovery runbooks | Pending |

---

## Detailed Phase Breakdown & Exit Criteria

### Phase 0: Workspace Discovery and Planning
- [x] Inspect existing workspace (confirmed empty workspace).
- [x] Determine runtime & tooling (`Node.js v22.11.0`, `npm 10.9.0`, `git 2.44.0`).
- [x] Author system architecture overview (`docs/architecture/overview.md`).
- [x] Author normalized relational database design (`docs/architecture/database.md`).
- [x] Author complete OpenAPI 3.0 specification (`docs/api/openapi.yaml`).
- [x] Author master engineering roadmap (`docs/development/roadmap.md`).
- [x] Author root `.env.example` with security boundaries and validation notes.
- [x] Author root `.gitignore`.
- [x] Author root `README.md`.
- **Exit Criteria**: All architectural specifications, schemas, API contracts, and roadmap are documented and approved.

### Phase 1: Project Foundation & Tooling
- [x] Initialize root `package.json` with npm workspaces (`apps/*`, `packages/*`).
- [x] Configure root and package-level `tsconfig.base.json` in strict mode.
- [x] Implement `packages/shared-types` (common domain models, enums, API types).
- [x] Implement `packages/validation` (Zod schemas for websites, campaigns, events, billing).
- [x] Implement `packages/config` (plan definitions, pricing, constants).
- [x] Initialize `apps/api` with Express, TypeScript, Pino structured logger, correlation ID middleware, and centralized error handler.
- [x] Initialize `apps/dashboard` with React, Vite, Tailwind CSS, and React Router.
- [x] Initialize `apps/widget` with lightweight Vite/Rollup build producing isolated bundle.
- [x] Configure database migration files (`database/migrations/001_initial_schema.sql`).
- [x] Configure GitHub Actions workflow (`.github/workflows/ci.yml`) for lint, type-check, test, and build.
- **Exit Criteria**: `npm run build`, `npm run lint`, and `npm run test` pass cleanly across all workspaces.

### Phase 2: Identity & Website Management
- [x] Integrate Supabase Auth middleware on API routes.
- [x] Implement workspace creation and user membership management (`workspace_members`).
- [x] Implement `/api/v1/websites` CRUD with canonical domain normalization.
- [x] Implement website domain verification checks (meta tag / DNS challenge).
- [x] Implement installation health check endpoint (last widget ping, last event received).
- [x] Build Dashboard screens: Auth Context, Workspace Switcher, Website List, Add Website, Website Overview & Installation Guide.
- **Exit Criteria**: Cross-tenant isolation verified by automated tests; merchants can manage websites and verify domains.

### Phase 3: Campaign Engine & Live Preview
- [x] Implement `/api/v1/websites/:id/campaigns` CRUD endpoints with Zod validation.
- [x] Implement campaign state transitions: `draft` -> `active` -> `paused` -> `archived`.
- [x] Enforce verification gate: campaigns cannot be activated without valid event source.
- [x] Build interactive Campaign Builder in dashboard with live Preview Simulator.
- [x] Support all 6 notification types: recent purchase, signup, popularity, visitors, stock, countdown.
- **Exit Criteria**: Merchant can configure and preview campaigns with immediate reactive visual updates.

### Phase 4: Standalone Public Widget
- [x] Implement vanilla TypeScript widget runner (`proofpulse.js`).
- [x] Implement closed Shadow DOM container to prevent host CSS conflicts.
- [x] Implement public REST clients for `/widget/config` and `/widget/events`.
- [x] Implement card rendering, animations (slide/fade), responsive layouts, and close button.
- [x] Implement a11y: `role="status"`, `aria-live="polite"`, ESC key dismissal.
- [x] Implement display frequency and session suppression algorithms.
- **Exit Criteria**: Standalone widget renders notification cards cleanly on a test HTML page with zero errors.

### Phase 5: Verified Event Pipeline
- [x] Implement `/api/v1/events` for authenticated ingestion using API keys.
- [x] Implement Shopify webhook endpoint (`/api/v1/integrations/shopify/webhook`) with HMAC-SHA256 signature verification.
- [x] Implement idempotency engine (`website_id`, `source`, `source_event_id`).
- [x] Implement data minimization & anonymization pipeline (e.g., "Aarav from Mumbai").
- [x] Implement event eligibility filter based on campaign freshness limits (e.g. 48h).
- [x] Implement `/api/v1/widget/events` delivering safe, anonymized notifications.
- **Exit Criteria**: Duplicate webhooks result in exactly one event; invalid signatures are rejected with 401; widget displays real events.

### Phase 6: Real-Time Analytics & Reporting
- [x] Implement `/api/v1/widget/track` with visitor session hashing and deduplication.
- [x] Implement database aggregation queries for impressions, clicks, CTR, and conversions.
- [x] Implement `/api/v1/websites/:id/analytics` endpoint with date-range filters.
- [x] Build Dashboard Analytics page with interactive time-series charts and key metrics.
- **Exit Criteria**: Automated tests verify that impression and click counts match test fixtures.

### Phase 7: Subscriptions & Usage Quotas
- [x] Define pricing tiers: Free (₹0), Starter (₹499), Growth (₹1,499), Agency (₹3,999).
- [x] Implement server-side monthly quota tracking (`usage_counters`).
- [x] Implement Razorpay subscription checkout integration and webhook handler (`/api/v1/billing/webhook`).
- [x] Build Dashboard Billing page displaying current plan, usage bars, and upgrade buttons.
- [x] Enforce quota rejection when impression or website limits are exceeded.
- **Exit Criteria**: Plan upgrades and cancellations update billing state idempotently; quotas enforced strictly.

### Phase 8: Security Hardening & Automated Testing
- [x] Run security test suite: IDOR boundary verification, SQL injection fuzzing, XSS sanitization.
- [x] Verify no secrets or private keys leaked in client bundles or public endpoints.
- [x] Vitest/Supertest integration test suite passing with 11/11 tests green.
- **Exit Criteria**: All automated test suites (unit, integration, security) pass.

### Phase 9: Private Beta & Pilot Verification
- [ ] Author staging deployment instructions and environment checklist.
- [ ] Test Shopify pilot merchant integration on development store.
- **Exit Criteria**: Pilot merchant successfully installs widget and displays verified live purchases.

### Phase 10: Production Release & Operations
- [ ] Author production runbook (`docs/operations/runbook.md`).
- [ ] Author disaster recovery, backup, and rollback procedures.
- [ ] Execute production readiness checklist.
- **Exit Criteria**: Complete production readiness checklist signed off with recorded evidence.
