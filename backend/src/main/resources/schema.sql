-- Margdarshi — Anurag University Placement Portal
-- MySQL DDL Schema with Foreign Key Cascades & Composite Unique Constraints

DROP TABLE IF EXISTS stage_progress;
DROP TABLE IF EXISTS placement_results;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS recruitment_stages;
DROP TABLE IF EXISTS eligibility_criteria;
DROP TABLE IF EXISTS placement_drives;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- 1. Users table (Authentication & Roles)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'COORDINATOR' or 'STUDENT'
    roll_number VARCHAR(32) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Students table (OneToOne with User, verified roll numbers)
CREATE TABLE students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    roll_number VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(32) NOT NULL, -- CSE, IT, ECE, AIML, EEE, MECH, CIVIL
    cgpa DECIMAL(4, 2) NOT NULL,
    backlogs INT NOT NULL DEFAULT 0,
    tenth_percentage DECIMAL(5, 2) NOT NULL,
    twelfth_percentage DECIMAL(5, 2) NOT NULL,
    graduation_year INT NOT NULL DEFAULT 2026,
    skills TEXT,
    resume_path VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Companies table
CREATE TABLE companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_letter VARCHAR(8) NOT NULL,
    logo_color_class VARCHAR(64),
    industry VARCHAR(128) NOT NULL,
    locations VARCHAR(255) NOT NULL,
    tier VARCHAR(32) NOT NULL, -- 'tier-1', 'tier-2', 'tier-3'
    tier_label VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    drives_record_label VARCHAR(64) DEFAULT '1 Active Drive',
    total_hired_count INT DEFAULT 0,
    website VARCHAR(255),
    description TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Placement Drives table (ManyToOne with Company)
CREATE TABLE placement_drives (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    job_type VARCHAR(32) NOT NULL DEFAULT 'Full Time',
    ctc VARCHAR(64) NOT NULL,
    raw_ctc_number DECIMAL(6, 2) NOT NULL,
    tier VARCHAR(32) NOT NULL,
    location VARCHAR(255) NOT NULL,
    deadline VARCHAR(64) NOT NULL,
    external_url TEXT,
    job_description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    current_stage VARCHAR(128) NOT NULL,
    current_stage_status VARCHAR(32) NOT NULL DEFAULT 'normal',
    CONSTRAINT fk_drives_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Eligibility Criteria table (OneToOne with PlacementDrive)
CREATE TABLE eligibility_criteria (
    id VARCHAR(64) PRIMARY KEY,
    drive_id VARCHAR(64) NOT NULL UNIQUE,
    min_cgpa DECIMAL(4, 2) NOT NULL,
    allowed_branches VARCHAR(255) NOT NULL, -- comma separated branches e.g. 'CSE,IT,AIML'
    max_backlogs INT NOT NULL DEFAULT 0,
    graduation_year INT DEFAULT 2026,
    min_10th_percentage DECIMAL(5, 2) NOT NULL DEFAULT 60.0,
    min_12th_percentage DECIMAL(5, 2) NOT NULL DEFAULT 60.0,
    CONSTRAINT fk_criteria_drive FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Recruitment Stages table (ManyToOne with PlacementDrive)
CREATE TABLE recruitment_stages (
    id VARCHAR(64) PRIMARY KEY,
    drive_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    stage_order INT NOT NULL,
    stage_date VARCHAR(64),
    platform VARCHAR(128),
    link TEXT,
    status VARCHAR(32) DEFAULT 'Active',
    CONSTRAINT fk_stages_drive FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Applications table (Composite Unique constraint: student_id + drive_id)
CREATE TABLE applications (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    drive_id VARCHAR(64) NOT NULL,
    company_application_id VARCHAR(128) NOT NULL,
    self_report_status VARCHAR(32) NOT NULL DEFAULT 'SELF_REPORTED',
    eligible_at_application BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_drive UNIQUE (student_id, drive_id),
    CONSTRAINT fk_apps_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_apps_drive FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Stage Progress table (Composite Unique constraint: application_id + stage_id)
CREATE TABLE stage_progress (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL,
    stage_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
    completed_at TIMESTAMP NULL,
    reported_by VARCHAR(32) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT' or 'COORDINATOR'
    CONSTRAINT uq_app_stage UNIQUE (application_id, stage_id),
    CONSTRAINT fk_sp_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_stage FOREIGN KEY (stage_id) REFERENCES recruitment_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Placement Results table (Unique: student_id + drive_id)
CREATE TABLE placement_results (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    drive_id VARCHAR(64) NOT NULL,
    result VARCHAR(32) NOT NULL, -- 'SELECTED' or 'REJECTED'
    ctc_package VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_result_student_drive UNIQUE (student_id, drive_id),
    CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_drive FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
