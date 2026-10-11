# Margdarshi

Anurag University's placement journey, tracked in one place.

Margdarshi is a tracking layer for campus placement seasons — not a replacement for company recruitment platforms. Students browse verified drives, apply externally, self-report their application, and track every stage through to a final verified result. Coordinators manage companies, drives, eligibility criteria, and outcomes from one dashboard.

## Why

Placement season information is usually scattered — spreadsheets, WhatsApp forwards, emails. Margdarshi gives students one place to see what they're eligible for and where their applications stand, and gives the placement coordinator one place to track outcomes across every active drive, with every number traceable back to a real record.

## Features

- **Role-based accounts** — separate student and coordinator sign-in, no shared logins or demo shortcuts
- **Live eligibility checks** — a student's CGPA, backlogs, and branch are checked against each drive's criteria in real time
- **Self-reported applications** — students apply on the company's own portal, then record their application reference here
- **Per-drive recruitment stages** — coordinators define each drive's own stage sequence (a company's process might be OA → Technical → HR, another's might be just one interview round) — stages aren't a fixed shared template
- **Stage tracking** — students self-report progress through each stage; coordinators confirm or override
- **Verified results** — binary, definitive outcomes (Selected with confirmed CTC, or Rejected), recorded by the coordinator only
- **Placement analytics** — applied / selected / rejected counts and stage funnels, computed from real application and result records

## Tech stack

**Frontend** — `frontend/`
- React + TypeScript, Vite
- Tailwind CSS

**Backend** — `backend/`
- Spring Boot (Java 17), Maven
- Spring Security with JWT-based authentication
- Spring Data JPA

**Database**
- MySQL

## Project structure

```
Margdarshi/
├── frontend/     # React app
└── backend/      # Spring Boot API
```

## Getting started

### Prerequisites
- Node.js
- Java 17+
- MySQL running locally
- Maven (or use the Maven Wrapper if present: `./mvnw`)

### Backend

```
cd backend
mvn spring-boot:run
```

Configure your MySQL credentials via environment variables, or edit the defaults in `backend/src/main/resources/application.yml`:

```
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
```

The database and tables are created automatically on first run — no manual schema setup needed.

The backend runs on `http://localhost:8080`.

### Frontend

```
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API calls to the backend.

## Roles

| Role | Access |
|---|---|
| Student | Browse drives, apply, track stages, view results, manage profile |
| Coordinator | Manage companies and drives, define eligibility and stages, confirm stage progress, record results, view analytics |

Student registration requires an Anurag University roll number (`YYEGCCCSNN` format) and a `@anurag.edu.in` email address. Coordinator accounts are provisioned separately.

## License

Not yet licensed for reuse — all rights reserved pending a license decision.
