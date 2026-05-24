## Detailed Build Steps — Starting From Zero

---

## Before Writing Any Code — One Time Setup (2 hours)

**1. Create GitHub repo**
- One repo for backend: `vidyatrack-backend`
- One repo for frontend: `vidyatrack-frontend`

**2. Backend project init**
```bash
mkdir vidyatrack-backend
cd vidyatrack-backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary python-jose passlib python-dotenv pydantic-settings
```

**3. Frontend project init**
```bash
npx create-next-app@latest vidyatrack-frontend
# choose: TypeScript yes, Tailwind yes, App Router yes
npm install axios @tanstack/react-query
```

**4. Database — Supabase**
- Go to supabase.com, create free project
- Copy connection string to `.env`
- This is your PostgreSQL database

**5. Create `.env` in backend**
```
DATABASE_URL=postgresql://...supabase connection string
SECRET_KEY=your-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

## Step 1 — Database Foundation (3–4 hours)

**1.1 Create `app/core/config.py`**
- Load all env variables using pydantic-settings

**1.2 Create `app/core/database.py`**
- SQLAlchemy engine
- SessionLocal
- Base class for all models

**1.3 Create ALL models first before any migration**

Create in this order:
- `app/models/institute.py` — institute table
- `app/models/user.py` — user table with role and institute_id
- `app/models/academic_year.py`
- `app/models/class_.py`
- `app/models/subject.py`
- `app/models/student.py`
- `app/models/fee.py` — fee_plan and installment together
- `app/models/attendance.py`
- `app/models/holiday.py`
- `app/models/test.py` — test and test_score together

**1.4 Setup Alembic**
```bash
alembic init alembic
# edit alembic.ini and env.py to point to your DATABASE_URL
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

**1.5 Verify on Supabase**
- Open Supabase dashboard
- Table editor should show all your tables
- If tables are there, Step 1 is done

---

## Step 2 — Backend Auth (4–5 hours)

**2.1 Create `app/core/security.py`**
- `hash_password(password)` function
- `verify_password(plain, hashed)` function
- `create_access_token(data)` function
- `decode_token(token)` function

**2.2 Create `app/core/dependencies.py`**
- `get_db()` — yields database session
- `get_current_user(token)` — decodes JWT, returns user with institute_id
- This is injected into every protected route

**2.3 Create `app/schemas/auth.py`**
- `RegisterRequest` — institute name, email, password, phone
- `LoginRequest` — email, password
- `TokenResponse` — access_token, token_type, institute_id, role

**2.4 Create `app/routers/auth.py`**

Four endpoints only:

```
POST /auth/register
- accepts institute name, email, password, phone
- creates institute row
- creates admin user row linked to institute
- returns token

POST /auth/login
- accepts email, password
- verifies password
- returns token with institute_id and role inside payload

GET /auth/me
- protected route
- returns current user + institute details

POST /auth/send-otp (optional for now, add later)
```

**2.5 Create `app/main.py`**
```python
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])
app.include_router(auth_router, prefix="/auth")
```

**2.6 Test in Swagger**
- Run `uvicorn app.main:app --reload`
- Open `http://localhost:8000/docs`
- Test register — check Supabase if institute and user rows created
- Test login — check token returned
- Test /me with token

**Do not move forward until Swagger tests pass.**

---

## Step 3 — Frontend Auth Pages (4–5 hours)

**3.1 Setup API client `lib/api.ts`**
```typescript
// axios instance pointing to localhost:8000
// interceptor that adds Authorization header from localStorage
// interceptor that redirects to /login on 401
```

**3.2 Setup token helpers `lib/auth.ts`**
```typescript
saveToken(token)      // saves to localStorage
getToken()            // retrieves token
removeToken()         // on logout
getInstituteId()      // decode from JWT
getRole()             // decode from JWT
isLoggedIn()          // checks token exists and not expired
```

**3.3 Build Register page `app/(auth)/register/page.tsx`**

Fields:
- Institute name
- Your name (admin)
- Email
- Password
- Phone number
- City
- Register button

On submit:
- Call `POST /auth/register`
- On success save token
- Redirect to `/setup` (institute setup page)

**3.4 Build Login page `app/(auth)/login/page.tsx`**

Fields:
- Email
- Password
- Login button
- Link to register

On submit:
- Call `POST /auth/login`
- On success save token
- Redirect to `/dashboard`

**3.5 Build Auth Guard `app/(dashboard)/layout.tsx`**
```typescript
// on mount check isLoggedIn()
// if not logged in redirect to /login
// if logged in render children
```

**3.6 Build empty Dashboard page**
```typescript
// just shows "Welcome to VidyaTrack"
// confirms auth guard works
```

**3.7 Test end to end on browser**
- Register new institute
- Should redirect to dashboard
- Refresh page — should stay on dashboard (token persists)
- Clear localStorage — should redirect to login
- Login again — should work

**3.8 Test on phone**
- Find laptop IP
- Open on phone browser
- Register and login should work on mobile

**Step 3 done when:** register → dashboard and login → dashboard both work on mobile browser.

---

## Step 4 — Institute Setup + Academic Year (3 hours)

**4.1 Backend — two simple endpoints**
```
GET  /institute/me        — get institute details
PUT  /institute/me        — update institute details
POST /institute/academic-year   — create academic year
GET  /institute/academic-year/current — get current year
```

**4.2 Frontend — Setup page `/setup`**
- Shown only after first registration
- Institute name, address, city, type (school/coaching)
- Confirm button
- Creates current academic year automatically (2025-26)
- Redirects to dashboard after

**4.3 Dashboard shows institute name**
- Fetch `/institute/me` on dashboard load
- Show institute name in header

---

## Step 5 — Classes and Subjects (3 hours)

**5.1 Backend endpoints**
```
GET    /classes               — list all classes for institute
POST   /classes               — create class
DELETE /classes/{id}          — delete class

GET    /classes/{id}/subjects — list subjects for class
POST   /classes/{id}/subjects — add subject
DELETE /subjects/{id}         — delete subject
```

**5.2 Frontend — Classes page `/classes`**
- List all classes as cards
- Add class button → inline form → type name → save
- Each class card expandable → shows subjects
- Add subject inline under each class
- Delete class and subject buttons

**5.3 Test**
- Create "Class 9"
- Add subjects: Maths, Science, English
- Create "Class 10"
- Add its subjects
- Verify in Supabase all rows have correct institute_id

---

## Step 6 — Students (4–5 hours)

**6.1 Backend endpoints**
```
GET    /students              — list, filter by class_id
POST   /students              — add student
GET    /students/{id}         — get single student
PUT    /students/{id}         — update student
DELETE /students/{id}         — deactivate student
```

**6.2 Frontend — Students page `/students`**

List view:
- Class filter tabs at top (All, Class 9, Class 10...)
- Student cards showing name, class, admission date, parent phone
- Add Student button

Add student form (bottom sheet on mobile):
- Name
- Date of birth
- Admission date
- Class (dropdown from your classes)
- Parent name
- Parent phone
- Address

**6.3 Test**
- Add 3-4 students
- Filter by class works
- Verify institute_id on every student row in Supabase

---

## Step 7 — Fees (5–6 hours)

**7.1 Backend endpoints**
```
POST /fees/plan              — create fee plan for student
GET  /fees/plan/{student_id} — get fee plan with installments
PUT  /installments/{id}/pay  — mark installment as paid
GET  /fees/defaulters        — students with overdue installments
```

**7.2 Fee service logic**
```python
# in fee_service.py
def get_defaulters(institute_id, db):
    # fetch all installments where
    # status != paid AND due_date <= today
    # return with student name and parent phone
```

**7.3 WhatsApp service**
```python
def fee_reminder_message(student_name, pending_amount, due_date, phone):
    msg = f"Dear Parent, fees of ₹{pending_amount} for {student_name} was due on {due_date}. Please pay at earliest."
    encoded = urllib.parse.quote(msg)
    return f"https://wa.me/91{phone}?text={encoded}"
```

**7.4 Frontend — Fees page `/fees`**

Two tabs:
- All Students — shows fee status per student
- Defaulters — only overdue students

Defaulter card shows:
- Student name
- Class
- Amount due
- Due date
- WhatsApp button (green, opens wa.me link)

Add fee plan flow:
- From student detail
- Enter total amount
- Add installments (date + amount each)
- Total of installments must equal total amount

**7.5 Test**
- Add fee plan with 3 installments
- Set one installment due date as yesterday
- Check defaulters page — student appears
- Click WhatsApp button — opens WhatsApp with correct message and number

---

## Step 8 — Attendance (5–6 hours)

**8.1 Backend endpoints**
```
POST /holidays               — mark a holiday
GET  /holidays               — list holidays for institute
GET  /attendance/class/{id}  — fetch students for marking (checks holiday)
POST /attendance/mark        — submit attendance for a date
GET  /attendance/absent-streak — students absent N+ days
```

**8.2 Attendance service logic**
```python
def is_holiday(institute_id, date, db):
    # check holiday table
    # return True/False

def get_absent_streak(institute_id, days, db):
    # fetch students absent for last N consecutive days
    # ignore holidays in streak calculation
    # return with parent phone
```

**8.3 Frontend — Attendance page `/attendance`**

Top controls:
- Class selector
- Date picker (defaults today)
- Mark Holiday button for today

Student list:
- Every student shows as Present by default (green chip)
- Tap to toggle Absent (red chip)
- Submit button at bottom

Absent streak section:
- Input: "Show absent for more than X days"
- List appears below with WhatsApp button per student

**8.4 Test**
- Mark 3 students absent for 3 consecutive days
- Check absent streak for 2+ days — they appear
- Mark a holiday — those days excluded from streak
- WhatsApp button shows correct absence message

---

## Step 9 — Tests and Scores (4–5 hours)

**9.1 Backend endpoints**
```
POST /tests               — schedule a test
GET  /tests               — list all tests (upcoming + past)
POST /tests/{id}/scores   — submit scores for all students
GET  /tests/{id}/scores   — get scores with student names
```

**9.2 Frontend — Tests page `/tests`**

Two sections:
- Upcoming tests — scheduled future tests
- Past tests — completed, scores entered

Schedule test form:
- Title
- Subject (dropdown from class subjects)
- Class
- Max marks
- Date

Score entry page `/tests/{id}/scores`:
- List of all students in that class
- Input field per student for marks obtained
- Submit all at once
- WhatsApp button per student after scores saved

**9.3 Test**
- Schedule a test for Class 9 Maths
- Enter scores for all students
- WhatsApp button shows correct score message per student

---

## Step 10 — Dashboard Summary (2 hours)

**10.1 Backend**
```
GET /dashboard/summary
— total students
— fees collected this month
— fees pending total  
— today attendance percentage
— tests scheduled this week
```

**10.2 Frontend — Dashboard home**
- 5 stat cards at top
- Recent defaulters list below
- Today's absent students below that

---

## Step 11 — PWA (2 hours)

```bash
npm install next-pwa
```

- Configure in `next.config.js`
- Create `public/manifest.json` with app name, icons, theme color
- Add meta tags in root layout
- Test install on Android Chrome — "Add to Home Screen" prompt appears

---

## Final Checklist Before First Customer

- All pages work on mobile browser
- WhatsApp buttons tested with real number
- Data isolated — one institute cannot see another's data
- Deployed on Vercel (frontend) and Render (backend)
- Custom domain connected (vidyatrack.in or whatever you pick)

---

**Total steps: 11. Start Step 1 today — database foundation. Want the actual code for `database.py` and first model?**