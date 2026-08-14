# SECURITY.md — Production Hardening Plan

This document is the **production-hardening & compliance blueprint** for the project.
It translates the security wishlist into concrete, actionable engineering
controls. This landing page is static and CDN-only today; the controls below are
the roadmap that applies **once a backend/API layer is added** (auth, sessions,
rate limiting) and to the **deployment/CI pipeline** regardless.

> Status legend: ✅ = implemented now · 🟡 = planned/roadmap · 🔴 = required
> before production traffic with real user data.

---

## 1. Input sanitization & injection prevention

- ✅ All UI text is rendered via React (auto-escapes HTML). No `dangerouslySetInnerHTML` used.
- ✅ CDN assets are pinned to immutable, integrity-checked URLs where available.
- 🔴 **Backend (when added):** never concatenate user input into SQL/shell/URLs. Use
  parameterized queries (or an ORM), allow-list validation via **zod** schemas on every
  API route, and output-encode responses. Reject unknown fields.
- 🟡 Add `Content-Security-Policy` header once serving from our own origin.

## 2. Authentication, authorization, roles & permissions

- 🔴 **When backend is added:** implement authentication with a proven library
  (e.g. Auth.js / NextAuth, Lucia, or a managed IdP like Clerk/Auth0). Never roll
  your own crypto.
- 🔴 Roles: `viewer`, `editor`, `admin`; enforce via middleware on every protected
  route + server-side checks (never trust the client).
- 🟡 Principle of least privilege; separate read vs. write vs. admin tokens.

## 3. Session management & token expiry

- 🔴 HttpOnly, Secure, SameSite cookies for browser sessions. Short access-token TTL
  (e.g. 15 min) + rotating refresh tokens.
- 🟡 Absolute session expiry + inactivity timeout; session revocation on logout/password change.
- 🟡 Reject token reuse; bind tokens to device/IP fingerprint.

## 4. Secrets management

- ✅ API keys are **never** in client bundles. (In the companion AI assistant, keys live
  only in a server route reading `process.env`, with an offline mock fallback.)
- 🔴 Store all secrets in the platform secret store (Vercel env vars / a vault). Never
  commit `.env` (`.gitignore` already excludes it).
- 🟡 Rotate keys quarterly; audit key usage; use scoped/short-lived credentials.

## 5. HTTPS, TLS, certificate rotation

- ✅ Vercel serves HTTPS automatically with managed certificates + auto-renewal.
- 🟡 Force HTTPS redirect; add HSTS; keep TLS 1.2+; disable weak ciphers.
- 🟡 Add cert-expiry monitoring alerts.

## 6. Rate limiting & abuse prevention

- 🔴 **When backend is added:** rate-limit every endpoint (e.g. per-IP + per-user) using
  a proven limiter (Upstash, Redis, or platform middleware). Especially auth + AI endpoints.
- 🔴 Cap AI-provider spend; queue/long-run jobs to avoid request storms.
- 🟡 Add bot detection + CAPTCHA on public forms; blocklist abusive IPs.

## 7. Dependency scanning & vulnerability patching

- ✅ Pinned Next.js to a **patched ≥15.5.x** line (15.3.x has a known CVE that blocks deploy).
- 🔴 Run `npm audit` in CI and **fail the build on high/critical** vulnerabilities.
- 🟡 Add Dependabot/Renovate for automated PRs; weekly dependency review.

## 8. Multi-tenancy & data isolation

- 🟡 If multi-user: scope every query by tenant/owner ID; never allow cross-tenant reads.
- 🔴 Add row-level security / owner checks in every data-access path.
- 🟡 Tenant isolation tests in CI.

## 9. PII handling, data retention & deletion

- 🔴 Enumerate PII fields; encrypt at rest; minimize collection to what's needed.
- 🔴 Define retention windows and automated deletion; support user "delete my data".
- 🟡 Anonymize/pseudonymize analytics.

## 10. Regulatory compliance (GDPR, HIPAA)

- 🟡 If EU users or health data: appoint DPIA; document lawful basis; add consent
  management; for HIPAA add BAA, access logs, and encryption at rest/in transit.
- 🟡 Maintain a data-processing register and a breach-notification runbook.

## 11. Audit trails & tamper-evident logging

- 🔴 Structured, centralized logs (request id, actor, action, timestamp, outcome).
- 🟡 Append-only / hashed-chain audit log for privileged actions; alert on anomalies.
- 🟡 Log access to PII and admin actions specifically.

## 12–17. Testing

- ✅ `npm run typecheck` (tsc --noEmit) gated in the build.
- 🔴 **Unit tests** (Jest/Vitest) for core logic: parsing, scoring, search, sanitization.
- 🔴 **Integration tests** for API routes (supertest / MSW).
- 🔴 **E2E tests** (Playwright) for the critical user journeys.
- 🔴 **Regression suite** — re-run on every merge.
- 🟡 **Load/stress tests** (k6) to find the breaking point and set autoscaling.
- 🟡 **Chaos engineering / resilience tests** — inject latency, outages, and verify
  graceful degradation + circuit breakers.
- 🔴 **Coverage thresholds enforced in CI** (e.g. ≥80% lines on critical modules).

## 18. Code review & standards

- 🔴 Branch protection: require reviews, pass CI, no direct pushes to `main`.
- 🔴 Lint + format + typecheck in pre-commit hooks and CI.
- 🟡 PR checklist + security-focused review for auth/data/parsing changes.

## 19. Error handling & graceful degradation

- ✅ The AI assistant uses an offline mock fallback when no API key is set — the UI
  never breaks, it degrades gracefully.
- 🔴 Central error boundary (React error boundary + API error wrapper); never leak
  stack traces to clients.
- 🔴 User-friendly error states + retry affordances.

## 20. Retry logic with backoff & idempotency

- 🔴 Retry transient failures with exponential backoff + jitter.
- 🔴 Idempotency keys on mutation endpoints so retries don't duplicate effects.

## 21. Circuit breakers & fallback behavior

- 🟡 Wrap external/AI calls in circuit breakers; fail fast to cached/mock fallback
  when upstream is down.
- 🟡 Feature flags to disable dependent features independently.

## 22. Concurrency & race-condition prevention

- 🔴 Atomic updates / transactions for any write path.
- 🟡 Detect and resolve race conditions; add stress concurrency tests.

## 23. Caching strategy & invalidation

- ✅ Static assets cache aggressively; SSG pages are immutable by default.
- 🟡 For dynamic data: cache with explicit TTL + invalidation on write (cache-aside
  with a library like `swr`/`react-query` or a CDN purger).

## 24–25. RTO / RPO & disaster recovery

- 🔴 Define **RTO** (recovery time objective) and **RPO** (recovery point objective).
  Start with e.g. RTO ≤ 4h, RPO ≤ 5 min for data.
- 🟡 Automated backups + restore drills; multi-region failover for critical services.
- 🟡 Documented DR runbook with tested runbooks quarterly.

## 26. Accessibility

- ✅ Semantic HTML; prefers-reduced-motion honored (all animation disabled when set).
- 🟡 Full WCAG 2.1 AA pass: keyboard nav, focus states, contrast, alt text, ARIA.
- 🟡 Automated a11y tests (axe) in CI + manual screen-reader review.

## 27. Architecture diagrams & ADRs

- 🟡 Maintain a lightweight ADR log (`docs/adr/0001-*.md`) capturing the *why* behind
  each significant decision (stack choice, data model, search approach, deploy target).
- 🟡 Keep an up-to-date architecture diagram (C4-style) in `docs/`.

---

## Priority order (recommended execution)

1. **Foundations:** secrets management, dependency scanning in CI, HTTPS, error handling, tests.
2. **When user data arrives:** auth + roles, session management, rate limiting, PII/retention, audit logs.
3. **Hardening:** multi-tenancy, circuit breakers, caching, DR, accessibility, ADRs.

*Nothing in this list is boilerplate — each item maps to a real control in the code,
pipeline, or runbook. Ship foundations first; never add user data without §2–§9.*
