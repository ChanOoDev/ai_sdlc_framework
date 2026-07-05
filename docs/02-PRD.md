# Product Requirements Document

Status: Draft

Owner: Product Manager
Last updated: 2026-07-06

---

## Vision

Doctor Note MVP is a lightweight web application designed for small clinics to manage doctors, patients, consultation notes, and patient history digitally. The long-term goal is to replace paper notes and spreadsheets with a searchable, secure, and role-aware system that improves clinical workflow efficiency and patient care continuity. This MVP establishes the foundation for a platform that may later expand into AI-assisted summaries, appointment scheduling, and multi-clinic support.

## Personas

### Clinic Admin

- **Goals:** Manage the clinic's doctor roster, maintain system configuration, and ensure smooth day-to-day operations. Needs a single place to view clinic activity and manage user access.
- **Pain Points:** Currently tracks doctor information in spreadsheets or paper files. Difficulty onboarding new staff quickly. No centralized view of clinic operations.
- **Proficiency:** Moderate. Comfortable with web applications and basic admin panels. No technical or coding background. Expects intuitive forms and dashboards.

### Doctor

- **Goals:** Quickly create and review consultation notes during or after patient visits. Access full patient history to make informed clinical decisions. Spend minimal time on administrative tasks.
- **Pain Points:** Paper notes are lost or illegible. Searching past consultations requires digging through physical files. No easy way to review a patient's full history before a visit.
- **Proficiency:** Low to moderate. Primarily uses mobile devices and EHR systems in hospital settings. Prefers fast, minimal interfaces. Uncomfortable with complex navigation or multi-step workflows.

### Receptionist

- **Goals:** Register new patients accurately, retrieve patient records quickly upon arrival, and support doctors by keeping patient profiles up to date.
- **Pain Points:** Manually entering patient data into spreadsheets. Difficulty finding records when patients return after a long gap. Duplicate records created when data is re-entered.
- **Proficiency:** Moderate. Familiar with web-based data entry forms and search interfaces. Needs clear navigation and confirmation feedback for actions like creating or updating records.

## User Stories

| ID | User Story |
|---|---|
| US-001 | As a **Clinic Admin**, I want to log in to the application so that I can securely access the system and manage clinic operations. |
| US-002 | As a **Clinic Admin**, I want to assign roles (Admin, Doctor, Receptionist) to users so that each person has the appropriate level of access. |
| US-003 | As a **Clinic Admin**, I want to add, edit, and remove doctors from the system so that the doctor roster stays current. |
| US-004 | As a **Receptionist**, I want to register new patients with their demographic and contact information so that their records are available for consultations. |
| US-005 | As a **Receptionist**, I want to edit existing patient profiles so that information stays accurate when a patient's details change. |
| US-006 | As a **Doctor**, I want to view a patient's profile including demographics, medical history, and past consultations so that I can make informed clinical decisions. |
| US-007 | As a **Doctor**, I want to create a consultation note for a patient visit so that a structured record of the encounter is preserved. |
| US-008 | As a **Doctor**, I want to view a chronological history of all past consultations for a patient so that I can track the progression of their care. |
| US-009 | As a **Clinic Admin** or **Receptionist**, I want to search for patients by name, phone number, or ID so that I can quickly retrieve a patient record. |
| US-010 | As a **Doctor** or **Clinic Admin**, I want to export a consultation note as a PDF so that I can provide a printed copy to the patient or attach it to external records. |

## MVP Scope

### Must Have

- User authentication (sign up, log in, log out) via Supabase Auth
- Role-based access control (Admin, Doctor, Receptionist)
- Doctor management (CRUD operations, Admin only)
- Patient registration and profile management (Receptionist and Admin)
- Patient profile view (demographics, contact, summary)
- Consultation note creation (Doctor only)
- Patient history (chronological consultation list)
- Dashboard with basic clinic activity overview
- Search functionality (patients by name, phone, or ID)
- PDF export of individual consultation notes

### Should Have

- Input validation and error feedback on all forms
- Responsive layout for tablet and desktop use
- Audit trail for record creation and modification timestamps
- Dashboard widgets showing patient count, recent consultations, and active doctors

### Could Have

- AI-generated consultation summary from note text
- Voice dictation for note entry
- Dark mode toggle
- Bulk patient import from CSV
- Notification system for new consultations

### Won't Have (This Release)

- Billing or invoicing
- Appointment scheduling
- Insurance integration
- Pharmacy or prescription management
- Laboratory test integration
- Mobile application (native)
- Multi-clinic support
- Two-factor authentication

## Acceptance Criteria

### US-001: Authentication

```
Given a user on the login page,
When they enter valid email and password and click "Log In",
Then they are redirected to the dashboard and their session is active.

Given a user on the login page,
When they enter invalid credentials,
Then an error message is displayed and they remain on the login page.

Given an authenticated user,
When they click "Log Out",
Then their session is terminated and they are redirected to the login page.
```

### US-002: Role-Based Access

```
Given a logged-in Clinic Admin,
When they access the user management screen,
Then they can assign or change a user's role between Admin, Doctor, and Receptionist.

Given a logged-in Doctor,
When they attempt to access the user management screen,
Then they are denied access and shown an appropriate message.

Given a logged-in Receptionist,
When they attempt to access doctor management,
Then they are denied access and shown an appropriate message.
```

### US-003: Doctor Management

```
Given a logged-in Clinic Admin,
When they navigate to the doctors section and click "Add Doctor",
Then a form is presented with fields for name, email, specialization, and phone.

Given a logged-in Clinic Admin,
When they submit a valid new doctor form,
Then the doctor is created and appears in the doctor list.

Given a logged-in Clinic Admin,
When they select a doctor and click "Edit",
Then they can modify the doctor's details and save the changes.

Given a logged-in Clinic Admin,
When they select a doctor and click "Delete",
Then a confirmation prompt appears, and upon confirmation the doctor is removed.
```

### US-004: Patient Registration

```
Given a logged-in Receptionist,
When they navigate to patient registration and submit a valid form,
Then a new patient record is created with name, date of birth, phone, email, gender, and address.

Given a logged-in Receptionist,
When they submit a registration form with missing required fields,
Then validation errors are displayed for each missing field.
```

### US-005: Patient Profile Editing

```
Given a logged-in Receptionist viewing a patient profile,
When they click "Edit" and modify contact details,
Then the changes are saved and a confirmation message is shown.

Given a logged-in Doctor viewing a patient profile,
When they attempt to edit demographic information,
Then they are shown a read-only view (only Doctors can edit consultation notes).
```

### US-006: Patient Profile View

```
Given a logged-in Doctor,
When they open a patient profile,
Then they see the patient's demographics, contact info, and a summary of recent consultations.

Given a logged-in Doctor viewing a patient profile with no consultations,
When the history section loads,
Then a message indicating "No consultations recorded" is displayed.
```

### US-007: Consultation Note Creation

```
Given a logged-in Doctor viewing a patient profile,
When they click "New Consultation" and fill in the note with a title, symptoms, diagnosis, and notes,
Then the consultation is saved with a timestamp and linked to the patient.

Given a logged-in Doctor,
When they submit a consultation form with an empty title or diagnosis,
Then validation errors are displayed and the form is not submitted.
```

### US-008: Patient History

```
Given a logged-in Doctor viewing a patient profile,
When the patient history section loads,
Then consultations are listed in reverse chronological order with date, title, and diagnosis summary.

Given a logged-in Doctor viewing a patient with 15 consultations,
When they scroll through the history,
Then all 15 entries are visible (via pagination or infinite scroll).
```

### US-009: Search

```
Given a logged-in Receptionist on the search page,
When they type a patient name, phone number, or patient ID into the search field,
Then matching patient records are displayed in a results list.

Given a logged-in Receptionist on the search page,
When they type a query that matches no records,
Then a "No results found" message is displayed.
```

### US-010: PDF Export

```
Given a logged-in Doctor viewing a consultation note,
When they click "Export as PDF",
Then a PDF is generated containing the consultation date, patient name, title, symptoms, diagnosis, and notes.

Given a logged-in Clinic Admin viewing a consultation note,
When they click "Export as PDF",
Then the same PDF is generated and downloaded.
```

## Roadmap

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 1: Product Definition | 2 days | PRD, Personas, User Stories, MVP Scope, Glossary |
| Phase 2: Architecture & Design | 2 days | Technical Design, ERD, API Specification, Database Schema, RLS Policies, Folder Structure |
| Phase 3: Sprint Planning | 1 day | Sprint Backlog, Task Breakdown, Definition of Done |
| Phase 4: Development Sprint 1 | 2 days | Authentication, Role-based access, Doctor CRUD, Patient CRUD |
| Phase 5: Development Sprint 2 | 2 days | Patient profile, Consultation notes, Patient history, Dashboard |
| Phase 6: Development Sprint 3 | 1 day | Search, PDF export, UI polish, Responsive layout |
| Phase 7: Code Review & Security | 1 day | Code Review Report, Security Review, Refactoring Plan |
| Phase 8: QA & Regression | 1 day | Test Plan, Test Cases, Bug Reports, Regression Test Report |
| Phase 9: Release & Deployment | 1 day | Release Notes, Go/No-Go Decision, Deployment, Smoke Tests, Documentation |

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-001 | Supabase service outage during development or deployment | High | Use Supabase local emulator for development; ensure deployment script is idempotent so retries are safe. |
| R-002 | 2-week timeline is too tight for full MVP scope | High | Prioritize Must Have features; defer Could Have features to post-MVP; enforce strict sprint discipline. |
| R-003 | Role-based access control (RLS) misconfiguration leads to data leaks | High | Implement RLS policies early; include RLS validation in the QA test plan; conduct a dedicated security review. |
| R-004 | PDF generation library introduces bundle size or compatibility issues | Medium | Evaluate libraries (e.g., @react-pdf/renderer) early in Phase 2; prototype a PDF export spike before Sprint 3. |
| R-005 | Insufficient user feedback leads to poor adoption | Medium | Include validation messages, loading states, and confirmation dialogs in all user flows; conduct UAT with real clinic users if possible. |
| R-006 | Scope creep from stakeholders requesting features outside MVP | Medium | Document all Out of Scope items in this PRD; require formal approval for any additions; redirect to backlog. |
| R-007 | Vercel deployment configuration issues (environment variables, Supabase URL) | Low | Create an environment checklist document; test deployment on a staging environment before production release. |

## Assumptions

1. Supabase (Auth, Database, and RLS) is available and suitable as the sole backend provider for this MVP.
2. All users access the application through a modern web browser on desktop or tablet (no IE11 support required).
3. Each clinic operates as a single-tenant instance; multi-clinic support is explicitly out of scope.
4. The Clinic Admin is the initial user who creates Doctor and Receptionist accounts; there is no self-service registration for Doctors or Receptionists.
5. Patient data entered during MVP is fictional or test data; no real Protected Health Information (PHI) is stored during the development and testing phases.
6. The two-week timeline assumes full-time dedication from the development team with no major interruptions.
7. Vercel is the deployment target and provides sufficient free-tier capacity for MVP hosting.

## Glossary

| Term | Definition |
|---|---|
| **Clinic** | A small medical practice that the application serves. In this MVP, the system is single-tenant, meaning each deployment corresponds to one clinic. |
| **Consultation** | A clinical encounter between a doctor and a patient. Each consultation is recorded as a note containing symptoms, diagnosis, and clinical observations. |
| **Consultation Note** | A structured digital record of a single consultation, including title, date, symptoms, diagnosis, and free-text clinical notes. |
| **Patient History** | The chronological collection of all consultation notes associated with a single patient, enabling doctors to review the progression of care over time. |
| **Patient Profile** | A patient's demographic and contact information record, including name, date of birth, phone, email, gender, and address. |
| **RBAC (Role-Based Access Control)** | A security model where user permissions are determined by their assigned role (Admin, Doctor, Receptionist). Each role grants access to specific features and data. |
| **RLS (Row-Level Security)** | A PostgreSQL feature enforced by Supabase that restricts which rows a user can read or modify based on their identity and role. Used to ensure data isolation and access control at the database level. |
| **MVP (Minimum Viable Product)** | The smallest version of the product that delivers core value to users and can be released for real-world use. |
