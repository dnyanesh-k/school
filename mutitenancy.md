# Multi-Tenancy Design — VidyaTrack

> **Interview reference doc.**  
> Covers the design decisions, implementation, and trade-offs for the multi-tenant architecture of VidyaTrack — a school ERP SaaS where each institute is an isolated tenant.

---

## 1. What is multi-tenancy?

A **multi-tenant** system serves multiple independent customers (tenants) from a **single deployed application and database**. Tenants share infrastructure but their data is completely isolated — one tenant must never be able to read, write, or infer data belonging to another.

In VidyaTrack, each **institute** (school or coaching center) is a tenant. Institute A's students, fees, attendance, and test scores are never visible to Institute B — even though they share the same Postgres database and the same FastAPI server.

---

## 2. The three standard models (trade-offs)

| Model | Isolation mechanism | Pros | Cons | Used by |
|-------|---------------------|------|------|---------|
| **Separate database per tenant** | Different DB connection per request | Strongest isolation, easy backup per tenant | Complex provisioning, expensive at scale | Legacy enterprise apps |
| **Separate schema per tenant** | PostgreSQL schema per tenant, shared DB | Strong isolation, easy per-tenant migration | Schema explosion, complex connection pooling | Mid-tier SaaS (e.g. early Salesforce) |
| **Shared tables + `tenant_id` column** | Every row filtered by a `tenant_id` FK | Simple, scales to millions of tenants, cheap | Isolation fully depends on application code | **VidyaTrack**, Stripe, Notion, GitHub |

**VidyaTrack uses shared tables with `institute_id` as the tenant discriminator.**

**Why:** For an early-stage SaaS with hundreds to thousands of tenants, shared tables are the industry standard. Separate schemas add operational overhead (migrations × N tenants, connection pool complexity) that is not justified until you have strict compliance requirements (HIPAA, banking).

---

## 3. Data model — how `institute_id` flows

Every tenant-owned entity either carries `institute_id` **directly** or is reachable from one that does.

```
┌──────────────┐
│  institutes  │  ← tenant root
│  id, status  │
└──────┬───────┘
       │
       ├── users          (institute_id)
       ├── classes        (institute_id)
       ├── holidays       (institute_id)
       ├── tests          (institute_id)
       │
       └── students       (institute_id)
              │
              ├── fee_plans      (student_id → student.institute_id)
              ├── installments   (fee_plan_id → fee_plan → student)
              ├── attendance     (student_id → student.institute_id)
              └── admissions     (student_id → student.institute_id)
                     │
                     └── test_scores  (test_id → test.institute_id)
```

**Direct isolation** — `institute_id` column on the table itself (classes, students, tests, holidays).  
**Indirect isolation** — no `institute_id` column, but always accessed via a join through a directly-isolated parent (fee_plans → students → institute_id).

---

## 4. Defense-in-depth: four isolation layers

Tenant isolation is never a single check. VidyaTrack enforces it at **four independent layers** — a bug in one layer doesn't expose data.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  Layer 1 — Authentication (JWT)                      │
│  • Decode Bearer token → { user_id, institute_id,   │
│    role } all cryptographically signed               │
│  • Load user from DB, check is_active                │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2 — Route Guard (RBAC + Institute status)     │
│  • require_institute_user():                         │
│    - Rejects wrong roles (platform admin blocked)    │
│    - Rejects pending / suspended / rejected inst.   │
│  • Applied at router level → no endpoint can forget  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Layer 3 — Service (cross-resource ownership check)  │
│  • verify_class(class_id, institute_id)              │
│  • verify_student(student_id, institute_id)          │
│  • verify_test(test_id, institute_id)                │
│  • institute_id ALWAYS from JWT, never from client   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Layer 4 — Repository (scoped SQL)                   │
│  • Every SELECT: WHERE institute_id = ?              │
│  • get_by_id(id, institute_id) — ID alone is not     │
│    enough; must belong to the right tenant           │
└─────────────────────────────────────────────────────┘
```

---

## 5. The golden rule — tenant_id from token, never from client

This is the most common multi-tenancy bug. Accepting `institute_id` from the request body or query param lets an attacker supply any tenant ID.

```python
# ❌ WRONG — attacker sends ?institute_id=2 to access another school
@router.get("/students")
async def list_students(institute_id: int = Query(...)):
    return await student_service.list(institute_id)

# ✅ CORRECT — institute_id extracted from the verified JWT
@router.get("/students")
async def list_students(current_user: User = Depends(require_institute_user)):
    institute_id = institute_id_of(current_user)   # tamper-proof
    return await student_service.list(institute_id)
```

`institute_id_of(user)` in `app/core/tenant.py` raises `ForbiddenError` if `institute_id` is null — no silent failures.

---

## 6. End-to-end data flow: `GET /students`

```
Client: GET /api/v1/students
        Authorization: Bearer eyJ...

1. JWT decoded  →  { user_id: 42, institute_id: 7, role: "institute_admin" }
2. User 42 loaded from DB → is_active = true ✓
3. require_institute_user:
     - role = institute_admin ✓
     - institute 7 status = active ✓
4. institute_id_of(current_user) → 7
5. StudentService.list(institute_id=7)
6. StudentRepository._base_stmt(institute_id=7):
     SELECT students.*
     FROM   students
     WHERE  students.institute_id = 7   ← hard filter
     AND    students.is_deleted   = false
7. Response: only institute 7's students

Institute 5 with a valid token cannot receive institute 7's data.
Even brute-forcing student IDs fails — get_by_id(999, institute_id=5) returns null.
```

---

## 7. Threat model — what attacks are blocked

| Attack vector | Exactly what blocks it |
|--------------|------------------------|
| Guess another tenant's row ID (`GET /students/999`) | `get_by_id(999, institute_id=7)` → null → 404; ID alone is never sufficient |
| Pass `institute_id=2` in request body | Request body `institute_id` is ignored; service always uses `institute_id_of(current_user)` |
| Replay a valid token from Institute A for Institute B's data | JWT carries `institute_id=A`; all queries hard-filter on A |
| Tamper JWT to change `institute_id` claim | JWT signed with `SECRET_KEY`; any modification invalidates HMAC signature → 401 |
| Access fees of another school | Fee repo joins `FeePlan → Student.institute_id`; cross-tenant join returns empty |
| Platform admin reads student data | `require_institute_user()` explicitly rejects `PLATFORM_ADMIN` role with 403 |
| Use expired token | `python-jose` validates `exp` claim; expired token → 401 |

---

## 8. Platform admin — isolated super-role

The platform admin manages the SaaS itself (approve/suspend institutes) but has **zero access to any institute's operational data**.

```python
# app/core/auth.py
async def require_institute_user(current_user: User, ...) -> User:
    if current_user.role == Role.PLATFORM_ADMIN.value:
        raise ForbiddenError("Platform admin cannot access institute data here")
    ...
```

- `institute_id = null` in DB and JWT
- Can only reach `/admin/*` routes, which return institute metadata (name, status, created_at) — not students, fees, or scores
- Even if the platform admin token were stolen, no student or fee data is accessible

---

## 9. Soft deletes + isolation

Records are never hard-deleted. Instead `is_deleted = true` is set. Every query in every repository enforces both filters:

```sql
WHERE institute_id = :iid
AND   is_deleted   = false
```

Consequence:
- Soft-deleted records from Institute A → invisible to Institute A (`is_deleted = true`)
- Same records → invisible to Institute B (`institute_id` mismatch)
- Data recovery is possible by toggling the flag; no accidental permanent loss

---

## 10. Trade-offs and what we consciously skipped

| Approach | Decision | Reason |
|----------|----------|--------|
| **PostgreSQL Row-Level Security (RLS)** | Not used | RLS enforces isolation at DB driver level — stronger guarantee. Skipped because it requires session variables per request, adds complexity to async SQLAlchemy, and service-layer enforcement is sufficient for this scale and threat model. Would revisit for healthcare/banking compliance. |
| **Separate schema per tenant** | Not used | Schema-per-tenant requires running migrations N times, blows up connection pool management, and complicates cross-tenant analytics. Not worth it below ~10k tenants. |
| **Database per tenant** | Not used | Highest operational cost — provisioning, backups, migration scripts all multiplied by tenant count. Reserved for enterprises with strict data residency requirements. |
| **Encrypted per-tenant data** | Not used | Application-level encryption per tenant is overkill for this threat model. Connection-level TLS (Supabase default) is the appropriate boundary. |

---

## 11. Scaling this design

This model scales comfortably to **tens of thousands of tenants** without schema changes:

- Add **Postgres indexes** on `(institute_id, ...)` composite keys — queries remain fast as row count grows
- Add **read replicas** behind the ORM — tenant scoping works identically on replicas
- Add **caching** (Redis) keyed by `institute_id:<resource>` — naturally isolated by key
- **Connection pooling** (Pgbouncer / Supabase pooler) — shared across all tenants, works transparently

Only migrate to schema-per-tenant or DB-per-tenant if you win enterprise contracts with contractual data residency requirements.

---

## 12. Adding a new feature — checklist

When building any new table or endpoint, follow this checklist to maintain isolation:

- [ ] New model: add `institute_id` FK column (or document which parent provides it)
- [ ] New repository `get_by_id`: signature must be `(id, institute_id)` — never `(id)` alone
- [ ] New repository list method: always `WHERE institute_id = ?`
- [ ] New service method: call `verify_*` helper before trusting any cross-resource ID
- [ ] New route: use `Depends(require_institute_user)` or covered by router-level dependency
- [ ] **Never** expose or accept `institute_id` from request body / query param
- [ ] Write a test: call the endpoint with a valid token from Tenant A requesting Tenant B's data → assert 404, not 200

---

## 13. Key files quick reference

| File | Responsibility |
|------|---------------|
| `app/core/auth.py` | JWT decode, `get_current_user`, RBAC guards, institute status check |
| `app/core/tenant.py` | `institute_id_of()`, cross-resource ownership helpers (`verify_class`, `verify_student`, `verify_test`, `verify_subject`) |
| `app/api/v1/router.py` | Applies auth dependencies at router level — no endpoint can forget auth |
| `app/repositories/*` | All queries scoped by `institute_id`; `get_by_id` always takes `(id, institute_id)` |
| `app/core/soft_delete.py` | Consistent `is_deleted = true` pattern |

---

## Common interview questions — short answers

**Q: How do you prevent one tenant from seeing another's data?**  
A: Four layers — JWT-bound `institute_id`, route-level RBAC, service-level ownership verification, and repository-level `WHERE institute_id = ?` on every query. Tenant ID is always extracted from the signed JWT, never from client input.

**Q: Why not use Postgres Row-Level Security?**  
A: It's a stronger guarantee but adds complexity with async ORMs (requires setting session-level variables per request). Our service + repository layering achieves equivalent isolation for this threat model. We'd add RLS for regulated industries.

**Q: What if an engineer forgets to add `institute_id` to a new query?**  
A: Router-level auth still blocks unauthenticated access. The gap would be cross-tenant access, not public access. We mitigate this with: (1) the `verify_*` helper pattern in services, (2) the checklist above, and (3) integration tests that assert cross-tenant 404 responses.

**Q: How does the platform admin not see institute data?**  
A: `require_institute_user()` explicitly rejects the `PLATFORM_ADMIN` role. The admin's JWT has `institute_id = null`. Even the DB queries in admin routes only return aggregate metadata, not student/fee rows.

**Q: How would you migrate this to schema-per-tenant?**  
A: Extract `institute_id` filters from repositories into a middleware that sets `search_path` per request. Requires DB provisioning per tenant on registration and running Alembic per schema on each migration. Only justified at enterprise scale with data residency requirements.
