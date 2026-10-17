# ProofPulse Engineering Roadmap & Phase Tracking

This document outlines the multi-phase engineering plan for building, testing, securing, and deploying **ProofPulse** as an enterprise-grade SaaS.

---

## Phase Matrix

| Phase | Description | Deliverables | Status |
|---|---|---|---|
| **Phase 0** | Workspace Discovery & Planning | Architecture overview, DB design, OpenAPI spec, Roadmap, `.env.example`, `.gitignore`, `README.md` | **COMPLETED** |
| **Phase 1** | Project Foundation & Tooling | Monorepo setup (`apps/*`, `packages/*`), TS strict configs, ESLint/Prettier, base migrations, centralized logger & error middleware, CI workflow | **UP NEXT** |
| **Phase 2** | Identity & Website Management | Supabase Auth, Workspaces, RBAC, Website management, Domain verification, Installation status & health check | Pending |
| **Phase 3** | Campaign Engine & Live Preview | Campaign CRUD, schema validation, state transitions (draft/active/paused), live preview simulator in dashboard | Pending |
| **Phase 4** | Standalone Public Widget | Vanilla TS bundle (<20KB), Shadow DOM style isolation, async loader, accessibility (a11y), responsive themes, frequency throttling | Pending |
| **Phase 5** | Verified Event Pipeline | Strict event schemas, authenticated ingestion, HMAC signature verifier (Shopify/WooCommerce), idempotency, freshness filtering | Pending |
| **Phase 6** | Real-Time Analytics & Reporting | Aggregated impressions, clicks, dismissals, conversions, CTR charts, date-range filtering, visitor session deduplication | Pending |
| **Phase 7** | Subscriptions & Usage Quotas | Plan models (Free, Starter, Growth, Agency), Razorpay integration & webhook verifier, server-side quota enforcement | Pending |
| **Phase 8** | Security Hardening & Automated Testing | IDOR tests, HMAC spoofing tests, XSS & sanitization, Supertest API tests, Playwright E2E full user journey | Pending |
| **Phase 9** | Private Beta & Pilot Verification | Staging deployment guide, pilot Shopify merchant onboarding, store integration validation | Pending |
| **Phase 10** | Production Release & Operations | Production infrastructure, migration rollback playbooks, Sentry alerting, backup & recovery runbooks | Pending |

---

## Detailed Phase Breakdown & Exit Criteria

### Phase 0: Workspace Discovery and Planning (CURRENT)
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
- [ ] Initialize root `package.json` with npm workspaces (`apps/*`, `packages/*`).
- [ ] Configure root and package-level `tsconfig.base.json` in strict mode.
- [ ] Implement `packages/shared-types` (common domain models, enums, API types).
- [ ] Implement `packages/validation` (Zod schemas for websites, campaigns, events, billing).
- [ ] Implement `packages/config` (plan definitions, pricing, constants).
- [ ] Initialize `apps/api` with Express, TypeScript, Pino structured logger, correlation ID middleware, and centralized error handler.
- [ ] Initialize `apps/dashboard` with React, Vite, Tailwind CSS, and React Router.
- [ ] Initialize `apps/widget` with lightweight Vite/Rollup build producing isolated bundle.
- [ ] Configure database migration files (`database/migrations/001_initial_schema.sql`).
- [ ] Configure GitHub Actions workflow (`.github/workflows/ci.yml`) for lint, type-check, test, and build.
- **Exit Criteria**: `npm run build`, `npm run lint`, and `npm run test` pass cleanly across all workspaces.

### Phase 2: Identity & Website Management
- [ ] Integrate Supabase Auth middleware on API routes.
- [ ] Implement workspace creation and user membership management (`workspace_members`).
- [ ] Implement `/api/v1/websites` CRUD with canonical domain normalization.
- [ ] Implement website domain verification checks (meta tag / DNS challenge).
- [ ] Implement installation health check endpoint (last widget ping, last event received).
- [ ] Build Dashboard screens: Auth (Login/Register), Workspace Switcher, Website List, Add Website, Website Overview & Installation Guide.
- **Exit Criteria**: Cross-tenant isolation verified by automated tests; merchants can manage websites and verify domains.

### Phase 3: Campaign Engine & Live Preview
- [ ] Implement `/api/v1/websites/:id/campaigns` CRUD endpoints with Zod validation.
- [ ] Implement campaign state transitions: `draft` -> `active` -> `paused` -> `archived`.
- [ ] Enforce verification gate: campaigns cannot be activated without valid event source.
- [ ] Build interactive Campaign Builder in dashboard with live Preview Simulator.
- [ ] Support all 6 notification types: recent purchase, signup, popularity, visitors, stock, countdown.
- **Exit Criteria**: Merchant can configure and preview campaigns with immediate reactive visual updates.

### Phase 4: Standalone Public Widget
- [ ] Implement vanilla TypeScript widget runner (`proofpulse.js`).
- [ ] Implement closed Shadow DOM container to prevent host CSS conflicts.
- [ ] Implement public REST clients for `/widget/config` and `/widget/events`.
- [ ] Implement card rendering, animations (slide/fade), responsive layouts, and close button.
- [ ] Implement a11y: `role="status"`, `aria-live="polite"`, ESC key dismissal.
- [ ] Implement display frequency and session suppression algorithms.
- **Exit Criteria**: Standalone widget renders notification cards cleanly on a test HTML page with zero errors.

### Phase 5: Verified Event Pipeline
- [ ] Implement `/api/v1/events` for authenticated ingestion using API keys.
- [ ] Implement Shopify webhook endpoint (`/api/v1/integrations/shopify/webhook`) with HMAC-SHA256 signature verification.
- [ ] Implement idempotency engine (`website_id`, `source`, `source_event_id`).
- [ ] Implement data minimization & anonymization pipeline (e.g., "Aarav from Mumbai").
- [ ] Implement event eligibility filter based on campaign freshness limits (e.g. 48h).
- [ ] Implement `/api/v1/widget/events` delivering safe, anonymized notifications.
- **Exit Criteria**: Duplicate webhooks result in exactly one event; invalid signatures are rejected with 401; widget displays real events.

### Phase 6: Real-Time Analytics & Reporting
- [ ] Implement `/api/v1/widget/track` with visitor session hashing and deduplication.
- [ ] Implement database aggregation queries for impressions, clicks, CTR, and conversions.
- [ ] Implement `/api/v1/websites/:id/analytics` endpoint with date-range filters.
- [ ] Build Dashboard Analytics page with interactive time-series charts and key metrics.
- **Exit Criteria**: Automated tests verify that impression and click counts match test fixtures.

### Phase 7: Subscriptions & Usage Quotas
- [ ] Define pricing tiers: Free (₹0), Starter (₹499), Growth (₹1,499), Agency (₹3,999).
- [ ] Implement server-side monthly quota tracking (`usage_counters`).
- [ ] Implement Razorpay subscription checkout integration and webhook handler (`/api/v1/billing/webhook`).
- [ ] Build Dashboard Billing page displaying current plan, usage bars, and upgrade buttons.
- [ ] Enforce quota rejection when impression or website limits are exceeded.
- **Exit Criteria**: Plan upgrades and cancellations update billing state idempotently; quotas enforced strictly.

### Phase 8: Security Hardening & Automated Testing
- [ ] Run security test suite: IDOR boundary verification, SQL injection fuzzing, XSS sanitization.
- [ ] Verify no secrets or private keys leaked in client bundles or public endpoints.
- [ ] Implement full Playwright E2E test verifying end-to-end journey (Register -> Create Website -> Configure Campaign -> Ingest Event -> Widget Renders -> Track Analytics).
- **Exit Criteria**: All automated test suites (unit, integration, e2e, security) pass.

### Phase 9: Private Beta & Pilot Verification
- [ ] Author staging deployment instructions and environment checklist.
- [ ] Test Shopify pilot merchant integration on development store.
- **Exit Criteria**: Pilot merchant successfully installs widget and displays verified live purchases.

### Phase 10: Production Release & Operations
- [ ] Author production runbook (`docs/operations/runbook.md`).
- [ ] Author disaster recovery, backup, and rollback procedures.
- [ ] Execute production readiness checklist.
- **Exit Criteria**: Complete production readiness checklist signed off with recorded evidence.
