# Margdarshi — Spring Boot 3 + MySQL Backend

Official campus recruitment drive tracking backend for Anurag University.

## Technology Stack
- **Framework**: Spring Boot 3.2.5 (Java 17)
- **Database**: MySQL 8.0+ via `mysql-connector-j` and `spring-boot-starter-data-jpa`
- **Security**: Spring Security 6 with BCrypt password hashing & JJWT Bearer tokens
- **Validation**: Jakarta Validation with custom roll number (`YYEGCCCSNN`) & domain rules

## Entity Architecture & Constraints
1. **User** (`users`): Authentication credentials, BCrypt hash, Role (`STUDENT` or `COORDINATOR`).
2. **Student** (`students`): OneToOne with User (`ON DELETE CASCADE`), verified roll number, CGPA, backlogs, branch.
3. **Company** (`companies`): Recruiter profiles and tier categorization.
4. **PlacementDrive** (`placement_drives`): ManyToOne with Company (`ON DELETE CASCADE`).
5. **EligibilityCriteria** (`eligibility_criteria`): OneToOne with Drive (`ON DELETE CASCADE`). Authoritative source of truth for student qualification.
6. **RecruitmentStage** (`recruitment_stages`): ManyToOne with Drive (`ON DELETE CASCADE`).
7. **Application** (`applications`):
   - **Composite Unique Constraint**: `(student_id, drive_id)` prevents duplicate applications.
   - Foreign key cascade: `ON DELETE CASCADE`.
8. **StageProgress** (`stage_progress`):
   - **Composite Unique Constraint**: `(application_id, stage_id)`.
   - Distinguishes self-reported vs coordinator-verified progress.
9. **PlacementResult** (`placement_results`):
   - **Unique Constraint**: `(student_id, drive_id)`.
   - Definitive result (`SELECTED` or `REJECTED`), eliminating ambiguous intermediate "offered" states.

## Quick Start (Local Setup)

### 1. Prerequisites
- Java 17+ (`openjdk-17-jdk`)
- Maven 3.8+
- MySQL Server 8.0+

### 2. Configure Database
Create database in MySQL:
```sql
CREATE DATABASE margdarshi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Optionally set environment variables (or edit `src/main/resources/application.yml`):
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/margdarshi?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"
export JWT_SECRET="your_secure_256bit_jwt_secret_key"
```

### 3. Build & Run
```bash
cd backend
mvn clean spring-boot:run
```
The server starts on `http://localhost:8080`.

### 4. Seed Accounts
| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Placement Coordinator** | `coordinator@anurag.edu.in` | `Coordinator@2025` | `COORDINATOR` |
| **Enrolled Student** | `kaushik@anurag.edu.in` | `123123123` | `STUDENT` |
| **Enrolled Student** | `ananya@anurag.edu.in` | `123123123` | `STUDENT` |

## REST API Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signin` | Public | Email + password sign in, returns JWT & user profile |
| `POST` | `/api/auth/register` | Public | Student self-registration (validates `@anurag.edu.in` & roll number) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve currently authenticated user & student |
| `GET` | `/api/drives` | Public | List active drives with criteria, stages & candidate counts |
| `POST` | `/api/drives` | Coordinator | Create a new campus placement drive with criteria & stages |
| `DELETE`| `/api/drives/{id}` | Coordinator | Delete drive (cascades stages, applications, results) |
| `GET` | `/api/applications` | Authenticated | View applications (students see own; coordinators see all) |
| `POST` | `/api/applications` | Student | Submit application with server-side authoritative eligibility check |
| `GET` | `/api/results` | Public | View verified placement selections |
| `POST` | `/api/results` | Coordinator | Publish official placement result (`SELECTED` / `REJECTED`) |
| `GET` | `/api/stats` | Public | Live trace-verified metrics (active drives, placed students, top CTC) |
