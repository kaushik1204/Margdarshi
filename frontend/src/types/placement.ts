export type UserRole = 'COORDINATOR' | 'STUDENT';
export type CompensationTier = 'tier-1' | 'tier-2' | 'tier-3';
export type JobType = 'Full Time' | 'Internship';
export type DriveStatus = 'Active' | 'Completed' | 'Draft';
export type SelfReportStatus = 'NOT_REPORTED' | 'SELF_REPORTED';
export type StageProgressStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type ReportedBy = 'STUDENT' | 'COORDINATOR';
export type PlacementResultStatus = 'SELECTED' | 'REJECTED';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  name: string;
  branch: string; // e.g. CSE, IT, ECE, AIML, Mechanical, Civil
  cgpa: number;
  backlogs: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  graduationYear: number;
  skills: string[];
  resumePath?: string;
  email: string;
  phone: string;
}

export interface EligibilityCriteria {
  id?: string;
  driveId?: string;
  minCgpa: number;
  allowedBranches: string[];
  maxBacklogs: number;
  graduationYear?: number;
  min10thPercentage: number;
  min12thPercentage: number;
}

export interface RecruitmentStageItem {
  id: string;
  driveId: string;
  name: string;
  stageOrder: number;
  date?: string;
  platform?: string;
  link?: string;
  candidateCount?: number;
  passingRate?: number;
  actualCount?: number;
  status?: string;
}

export interface DriveCandidate {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  score?: number;
  stageId: string;
  status: 'cleared' | 'pending' | 'rejected' | 'selected';
  email: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  placementStatus: 'Placed' | 'In Process' | 'Unplaced';
  offers: {
    companyName: string;
    role: string;
    ctc: string;
    tier: CompensationTier;
  }[];
  appliedDrivesCount: number;
  email: string;
  phone: string;
  skills?: string[];
  tenthPercentage?: number;
  twelfthPercentage?: number;
  graduationYear?: number;
  resumePath?: string;
}

export interface ApplicationRecord {
  id: string;
  studentId: string;
  driveId: string;
  companyApplicationId: string;
  selfReportStatus: SelfReportStatus;
  eligibleAtApplication: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageProgressRecord {
  id: string;
  applicationId: string;
  stageId: string;
  status: StageProgressStatus;
  completedAt?: string;
  reportedBy: ReportedBy; // STUDENT (self-marked, unverified) vs COORDINATOR (confirmed)
  roundOutcome?: 'CLEARED' | 'AWAITING_RESULT' | 'NOT_CLEARED';
  difficultyRating?: 'Easy' | 'Moderate' | 'Challenging' | 'Hard';
  experienceNotes?: string;
  confidenceRating?: number;
}

export interface PlacementResultRecord {
  id: string;
  studentId: string;
  driveId: string;
  result: PlacementResultStatus;
  ctcPackage: string;
  package?: string;
  updatedAt: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  roleTitle: string;
  jobType: JobType;
  ctc: string; // e.g. "32.0 LPA"
  rawCtcNumber: number;
  tier: CompensationTier;
  location: string;
  deadline: string;
  externalUrl?: string;
  jobDescription?: string;
  eligibleCount: number;
  applicationsCount: number;
  currentStage: string;
  currentStageStatus: 'warning' | 'info' | 'success';
  stages: RecruitmentStageItem[];
  criteria: EligibilityCriteria;
  status: DriveStatus;
  selectedCount?: number;
}

export interface Company {
  id: string;
  name: string;
  logoLetter: string;
  logoColorClass: string;
  industry: string;
  locations: string;
  tier: CompensationTier;
  tierLabel: string;
  status: 'Active' | 'Closed' | 'Draft';
  drivesRecordLabel: string;
  totalHiredCount: number;
  website?: string;
  description?: string;
  drives: PlacementDrive[];
  contactPerson?: string;
  contactEmail?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}
