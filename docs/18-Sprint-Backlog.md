# Sprint Backlog

Status: Active

Owner: Scrum Master
Last updated: 2026-07-06
Sprint: Doctor Note MVP (2-week sprint)
Duration: Day 1 - Day 14

---

## Definition of Done

- [ ] Code complete
- [ ] Code reviewed (no Critical/High findings)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] QA validated
- [ ] Acceptance criteria met

## Sprint Backlog

| ID | Title | Priority | Estimate | Status | Dependencies |
|---|---|---|---|---|---|
| US-001 | Authentication (Login/Signup) | Must | 2 days | Pending | None |
| US-002 | Role-based Access Control | Must | 2 days | Pending | US-001 |
| US-003 | Doctor Management | Must | 2 days | Pending | US-002 |
| US-004 | Patient Management | Must | 3 days | Pending | US-002 |
| US-005 | Patient Profile | Should | 2 days | Pending | US-004 |
| US-006 | Consultation Notes | Must | 2 days | Pending | US-004, US-003 |
| US-007 | Patient History | Should | 1 day | Pending | US-006 |
| US-008 | Dashboard | Should | 2 days | Pending | US-004, US-006 |
| US-009 | Search | Could | 1 day | Pending | US-004 |
| US-010 | PDF Export | Could | 1 day | Pending | US-006, US-007 |

## Task Breakdown

### TASK-001: Setup Supabase Project

- **Story:** US-001
- **Estimate:** 0.5 days
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Create Supabase project via dashboard
- [ ] Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Initialize Supabase client library in the application
- [ ] Set up database schema for users table
- [ ] Configure Row Level Security (RLS) policies for users

### TASK-002: Create Auth Pages (Login/Signup)

- **Story:** US-001
- **Estimate:** 1 day
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Create login page with email/password form
- [ ] Create signup page with registration form (name, email, password, role selection)
- [ ] Implement form validation and error handling
- [ ] Style pages consistent with design system
- [ ] Add loading states and success/error feedback

### TASK-003: Implement Middleware for Route Protection

- **Story:** US-001
- **Estimate:** 0.5 days
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Create Next.js middleware to check authentication status
- [ ] Redirect unauthenticated users to /login
- [ ] Redirect authenticated users away from /login and /signup
- [ ] Configure protected route patterns

### TASK-004: Add Session Management

- **Story:** US-001
- **Estimate:** 0.5 days
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Implement session refresh logic using Supabase auth helpers
- [ ] Create server-side session verification utility
- [ ] Add logout functionality with session cleanup
- [ ] Handle token expiration gracefully

### TASK-005: Create Patient List Page

- **Story:** US-004
- **Estimate:** 1 day
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Build patient list page with data table component
- [ ] Display patient name, phone, email, last visit date
- [ ] Add pagination for large datasets
- [ ] Add "Add Patient" button (visible to Admin and Receptionist roles)
- [ ] Implement row click navigation to patient detail page

### TASK-006: Create Patient Form

- **Story:** US-004
- **Estimate:** 1 day
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Build patient registration/edit form with fields: full name, date of birth, gender, phone, email, address, emergency contact, blood group, allergies
- [ ] Implement client-side form validation
- [ ] Add form state management (create vs. edit mode)
- [ ] Style form with consistent UI components

### TASK-007: Implement Patient CRUD Server Actions

- **Story:** US-004
- **Estimate:** 0.5 days
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Create server action to create patient record
- [ ] Create server action to read patient (single and list)
- [ ] Create server action to update patient record
- [ ] Create server action to delete patient record
- [ ] Add error handling and input sanitization

### TASK-008: Add Patient Search

- **Story:** US-009
- **Estimate:** 0.5 days
- **Assignee:** Developer
- **Status:** Pending

**Subtasks:**
- [ ] Build search input component on patient list page
- [ ] Implement server-side search query (name, phone, email)
- [ ] Add debounced search for performance
- [ ] Display "no results" state when search yields nothing

## Daily Plan

### Day 1-2: Setup + Authentication

| Task | Owner | Status | Blockers |
|---|---|---|---|
| Project scaffolding (Next.js + Supabase) | Developer | Pending | None |
| TASK-001 Setup Supabase project | Developer | Pending | None |
| TASK-002 Create auth pages | Developer | Pending | TASK-001 |
| TASK-003 Implement route protection middleware | Developer | Pending | TASK-002 |
| TASK-004 Add session management | Developer | Pending | TASK-002 |

### Day 3-4: RBAC + Doctor Management

| Task | Owner | Status | Blockers |
|---|---|---|---|
| US-002 Implement role-based access control | Developer | Pending | US-001 |
| Create roles table and seed Admin/Doctor/Receptionist | Developer | Pending | US-002 |
| US-003 Doctor management CRUD pages | Developer | Pending | US-002 |
| Doctor list, form, and server actions | Developer | Pending | US-003 |

### Day 5-7: Patient Management + Profile

| Task | Owner | Status | Blockers |
|---|---|---|---|
| TASK-005 Create patient list page | Developer | Pending | US-002 |
| TASK-006 Create patient form | Developer | Pending | TASK-005 |
| TASK-007 Implement patient CRUD server actions | Developer | Pending | TASK-006 |
| TASK-008 Add patient search | Developer | Pending | TASK-005 |
| US-005 Patient profile detail page | Developer | Pending | US-004 |

### Day 8-9: Consultation Notes

| Task | Owner | Status | Blockers |
|---|---|---|---|
| US-006 Consultation notes form and list | Developer | Pending | US-004, US-003 |
| Consultation server actions (create, read, update) | Developer | Pending | US-006 |
| Link consultations to patient and doctor | Developer | Pending | US-006 |

### Day 10: Patient History + Dashboard

| Task | Owner | Status | Blockers |
|---|---|---|---|
| US-007 Patient history timeline view | Developer | Pending | US-006 |
| US-008 Dashboard stats and summary cards | Developer | Pending | US-004, US-006 |
| Dashboard charts (appointments, patients) | Developer | Pending | US-008 |

### Day 11: Search + PDF Export

| Task | Owner | Status | Blockers |
|---|---|---|---|
| US-009 Global search functionality | Developer | Pending | US-004 |
| US-010 PDF export for consultation notes | Developer | Pending | US-006, US-007 |
| PDF styling and layout | Developer | Pending | US-010 |

### Day 12: Review + QA

| Task | Owner | Status | Blockers |
|---|---|---|---|
| Code review for all completed stories | Developer | Pending | All stories |
| QA validation against acceptance criteria | QA | Pending | Code review |
| Security review (RLS, auth, input validation) | Developer | Pending | QA |

### Day 13: Bug Fixes

| Task | Owner | Status | Blockers |
|---|---|---|---|
| Fix Critical/High defects from QA | Developer | Pending | QA report |
| Regression testing | QA | Pending | Bug fixes |
| Documentation updates | Developer | Pending | Bug fixes |

### Day 14: Release

| Task | Owner | Status | Blockers |
|---|---|---|---|
| Final release checklist review | Release Manager | Pending | Regression pass |
| Production deployment | DevOps | Pending | Release GO |
| Post-deployment smoke test | QA | Pending | Deployment |

## Demo Plan

| Feature | Demo Script | Status |
|---|---|---|
| Authentication | User signs up as Receptionist, logs in, session persists across page refreshes | Pending |
| Patient Registration | Receptionist creates a new patient with full details (name, DOB, contact, medical info) | Pending |
| Consultation Creation | Doctor opens a patient record, creates a consultation note with diagnosis, prescription, and notes | Pending |
| Patient History | Doctor views the patient's full consultation history in chronological order | Pending |
| PDF Export | Doctor exports a patient's consultation summary as a formatted PDF document | Pending |
| Role-based Access | Demonstrate that Receptionist cannot access doctor-only features and Doctor cannot modify system settings | Pending |
| Search | Receptionist searches for a patient by name and finds the record instantly | Pending |
| Dashboard | Admin views dashboard with patient count, recent consultations, and activity summary | Pending |
