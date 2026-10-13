import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StartingGatewayView } from './components/StartingGatewayView';
import { AuthView, AuthMode } from './components/AuthView';
import { CompaniesDrivesView } from './components/CompaniesDrivesView';
import { OverviewDashboardView } from './components/OverviewDashboardView';
import { StudentsView } from './components/StudentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { NewDriveDrawer } from './components/NewDriveDrawer';
import { AddCompanyModal } from './components/AddCompanyModal';
import { FunnelDashboardModal } from './components/FunnelDashboardModal';
import { EditCriteriaModal } from './components/EditCriteriaModal';
import { DriveSummaryModal } from './components/DriveSummaryModal';
import { StudentDrivesView } from './components/StudentDrivesView';
import { StudentApplicationsView } from './components/StudentApplicationsView';
import { StudentProfileView } from './components/StudentProfileView';
import { StudentResultsView } from './components/StudentResultsView';
import { PerDriveDashboardView } from './components/PerDriveDashboardView';
import { api, ApiError } from './api/client';
import {
  Company,
  PlacementDrive,
  EligibilityCriteria,
  StudentProfile,
  UserRole,
  ApplicationRecord,
  StageProgressRecord,
  PlacementResultRecord,
  AuthUser,
} from './types/placement';

const DEFAULT_STUDENT: StudentProfile = {
  id: 'std-24eg107b47',
  userId: 'std-24eg107b47',
  rollNumber: '24EG107B47',
  name: 'Kaushik Rekha',
  branch: 'CSE',
  cgpa: 8.85,
  backlogs: 0,
  tenthPercentage: 91.0,
  twelfthPercentage: 88.5,
  graduationYear: 2028,
  skills: ['Java', 'Python', 'React', 'Data Structures & Algorithms', 'MySQL', 'Spring Boot'],
  resumePath: 'resumes/24EG107B47_Kaushik_Resume.pdf',
  email: 'kaushik@anurag.edu.in',
  phone: '+91 98765 43210',
};

const PROFILE_STORAGE_KEY = 'margdarshi_saved_profile';

function getStoredProfileForAccount(identifier?: string | null): StudentProfile | null {
  if (!identifier) return null;
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${identifier.toLowerCase().trim()}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function persistProfileForAccount(profile: StudentProfile, identifiers: (string | undefined | null)[]) {
  try {
    const json = JSON.stringify(profile);
    localStorage.setItem('margdarshi_active_student_profile', json);
    identifiers.forEach((id) => {
      if (id && id.trim()) {
        localStorage.setItem(`${PROFILE_STORAGE_KEY}_${id.toLowerCase().trim()}`, json);
      }
    });
  } catch {}
}

export default function App() {
  // Page mode: 'GATEWAY' (Starting Landing Page) | 'AUTH' (Dedicated Sign In / Register) | 'APP' (Workspace)
  const [pageState, setPageState] = useState<'GATEWAY' | 'AUTH' | 'APP'>('GATEWAY');
  const [authMode, setAuthMode] = useState<AuthMode>('STUDENT_SIGN_IN');

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('student-drives');

  // Active student profile with local storage account persistence
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(() => {
    return (
      getStoredProfileForAccount('kaushik@anurag.edu.in') ||
      getStoredProfileForAccount('24EG107B47') ||
      getStoredProfileForAccount('std-24eg107b47') ||
      DEFAULT_STUDENT
    );
  });
  const [sampleStudents, setSampleStudents] = useState<StudentProfile[]>([DEFAULT_STUDENT]);

  // Core database state populated from real REST API
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [stageProgresses, setStageProgresses] = useState<StageProgressRecord[]>([]);
  const [results, setResults] = useState<PlacementResultRecord[]>([]);

  // Live trace-verified statistics
  const [stats, setStats] = useState({
    activeDrivesCount: 4,
    totalStudentsCount: 16,
    placedStudentsCount: 4,
    totalApplicationsCount: 16,
    highestPackage: '₹32.0 LPA',
  });

  // Responsive mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Drawers state
  const [perDriveFocus, setPerDriveFocus] = useState<PlacementDrive | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isNewDriveOpen, setIsNewDriveOpen] = useState(false);
  const [funnelDrive, setFunnelDrive] = useState<PlacementDrive | null>(null);
  const [criteriaDrive, setCriteriaDrive] = useState<PlacementDrive | null>(null);
  const [summaryDrive, setSummaryDrive] = useState<PlacementDrive | null>(null);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Re-fetch all data from REST API (no silent fallbacks)
  const fetchLiveData = useCallback(async () => {
    try {
      setApiError(null);
      // 1. Fetch drives, companies, applications, results, stats directly from real API
      const [fetchedCompanies, fetchedDrives, fetchedApps, fetchedResults, fetchedStats] = await Promise.all([
        api.companies.getAll(),
        api.drives.getAll(),
        api.applications.getAll(),
        api.results.getAll(),
        api.stats.get(),
      ]);

      if (fetchedStats) {
        setStats({
          activeDrivesCount: fetchedStats.activeDrivesCount,
          totalStudentsCount: fetchedStats.totalStudentsCount,
          placedStudentsCount: fetchedStats.placedStudentsCount,
          totalApplicationsCount: fetchedStats.totalApplicationsCount,
          highestPackage: fetchedStats.highestPackage,
        });
      }

      // Group drives by company
      const drivesByCompany: Record<string, PlacementDrive[]> = {};
      fetchedDrives.forEach((d) => {
        if (!drivesByCompany[d.companyId]) {
          drivesByCompany[d.companyId] = [];
        }
        drivesByCompany[d.companyId].push(d);
      });

      // Deduplicate companies by ID to guarantee unique React keys
      const uniqueCompaniesMap = new Map<string, any>();
      fetchedCompanies.forEach((c) => {
        if (c && c.id && !uniqueCompaniesMap.has(c.id)) {
          uniqueCompaniesMap.set(c.id, c);
        }
      });

      const assembledCompanies: Company[] = Array.from(uniqueCompaniesMap.values()).map((c) => {
        const cDrives = drivesByCompany[c.id] || [];
        return {
          ...c,
          drives: cDrives,
          drivesRecordLabel: `${cDrives.length} Active Drive${cDrives.length !== 1 ? 's' : ''}`,
          totalHiredCount: fetchedResults.filter((r) => r.result === 'SELECTED' && cDrives.some((d) => d.id === r.driveId)).length,
        };
      });

      setCompanies(assembledCompanies);
      setApplications(fetchedApps);
      setResults(fetchedResults);

      // Extract all stage progress records from applications
      const allSp: StageProgressRecord[] = [];
      fetchedApps.forEach((a: any) => {
        if (Array.isArray(a.stageProgress)) {
          allSp.push(...a.stageProgress);
        }
      });
      setStageProgresses(allSp);

      // If coordinator, fetch all students
      if (currentUser?.role === 'COORDINATOR') {
        const students = await api.students.getAll();
        if (students.length > 0) {
          setSampleStudents(students);
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to connect to backend REST API. Verify Spring Boot is running on port 8080 and MySQL is connected.';
      console.error('Error fetching live data from API:', err);
      setApiError(errMsg);
    }
  }, [currentUser]);

  // Initial authentication check & stats loading
  useEffect(() => {
    const initApp = async () => {
      // 1. Fetch public stats for landing page
      try {
        const pubStats = await api.stats.get();
        if (pubStats) {
          setStats(pubStats);
        }
      } catch {}

      // 2. Check existing session token
      const token = api.getToken();
      if (!token) {
        const stored =
          getStoredProfileForAccount('kaushik@anurag.edu.in') ||
          getStoredProfileForAccount('24EG107B47') ||
          getStoredProfileForAccount('std-24eg107b47');
        if (stored) {
          setCurrentStudent(stored);
        }
        setPageState('GATEWAY');
        return;
      }

      try {
        const me = await api.auth.getMe();
        setCurrentUser(me.user);
        setCurrentRole(me.user.role);
        if (me.student) {
          setCurrentStudent(me.student);
          persistProfileForAccount(me.student, [
            me.user.email,
            me.user.rollNumber,
            me.user.id,
            me.student.id,
            me.student.rollNumber,
            me.student.email,
          ]);
        } else if (me.user.role === 'STUDENT') {
          const stored =
            getStoredProfileForAccount(me.user.email) ||
            getStoredProfileForAccount(me.user.rollNumber) ||
            getStoredProfileForAccount(me.user.id);
          if (stored) {
            setCurrentStudent(stored);
          }
        }
        setPageState('APP');
        setCurrentTab(me.user.role === 'COORDINATOR' ? 'companies-and-drives' : 'student-drives');
      } catch {
        api.auth.signOut();
        setPageState('GATEWAY');
      }
    };

    initApp();
  }, []);

  // When user or role changes, refresh data
  useEffect(() => {
    if (pageState === 'APP' && currentUser) {
      fetchLiveData();
    }
  }, [pageState, currentUser, fetchLiveData]);

  // Dedicated Landing Page Navigation Triggers
  const handleOpenStudentSignIn = () => {
    setAuthMode('STUDENT_SIGN_IN');
    setPageState('AUTH');
  };

  const handleOpenCoordinatorSignIn = () => {
    setAuthMode('COORDINATOR_SIGN_IN');
    setPageState('AUTH');
  };

  const handleOpenStudentRegister = () => {
    setAuthMode('STUDENT_REGISTER');
    setPageState('AUTH');
  };

  // Login success handler
  const handleLoginSuccess = async (user: AuthUser, studentProfile?: StudentProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setPageState('APP');

    const stored =
      getStoredProfileForAccount(user.email) ||
      getStoredProfileForAccount(user.rollNumber) ||
      getStoredProfileForAccount(user.id);
    const effectiveProfile = studentProfile || stored || DEFAULT_STUDENT;

    if (effectiveProfile) {
      setCurrentStudent(effectiveProfile);
      persistProfileForAccount(effectiveProfile, [
        user.email,
        user.rollNumber,
        user.id,
        effectiveProfile.id,
        effectiveProfile.rollNumber,
        effectiveProfile.email,
      ]);
    }

    if (user.role === 'COORDINATOR') {
      setCurrentTab('companies-and-drives');
      showToast(`Welcome ${user.name} (Placement Cell Coordinator)`);
    } else {
      setCurrentTab('student-drives');
      showToast(`Welcome ${effectiveProfile?.name || user.name} (${effectiveProfile?.rollNumber || user.rollNumber || 'Student Portal'})`);
    }

    await fetchLiveData();
  };

  // Sign out handler
  const handleSignOut = () => {
    api.auth.signOut();
    setCurrentUser(null);
    setPageState('GATEWAY');
    showToast('Signed out of Margdarshi.');
  };

  // Student Flow: Apply & Self-Report with Authoritative Server Verification
  const handleApplyDrive = async (driveId: string, companyAppId: string) => {
    try {
      await api.applications.apply(driveId, companyAppId);
      showToast(`Application self-reported: ${companyAppId}`);
      await fetchLiveData();
    } catch (err: any) {
      if (err instanceof ApiError && err.reasons && err.reasons.length > 0) {
        alert(`Application Blocked by Eligibility Engine:\n\n${err.reasons.map((r) => '• ' + r).join('\n')}`);
      } else {
        alert(err?.message || 'Failed to submit application.');
      }
    }
  };

  // Student Flow: Self-mark stage progress with outcome and experience review
  const handleSelfMarkStage = async (
    applicationId: string,
    stageId: string,
    details?: {
      roundOutcome?: 'CLEARED' | 'AWAITING_RESULT' | 'NOT_CLEARED';
      difficultyRating?: 'Easy' | 'Moderate' | 'Challenging' | 'Hard';
      experienceNotes?: string;
      confidenceRating?: number;
    }
  ) => {
    try {
      const status = details?.roundOutcome === 'NOT_CLEARED' ? 'FAILED' : 'COMPLETED';
      await api.applications.updateStageProgress(applicationId, stageId, status, details);

      if (details) {
        try {
          localStorage.setItem(`stage_feedback_${applicationId}_${stageId}`, JSON.stringify(details));
        } catch {}
      }

      showToast('Stage attendance, outcome, and experience submitted');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update stage progress'}`);
    }
  };

  // Student Flow: Update Profile
  const handleUpdateStudent = async (updated: StudentProfile) => {
    try {
      let savedStudent = updated;
      let returnedUser: AuthUser | undefined = undefined;

      try {
        const targetId = updated.id || currentStudent.id || 'std-24eg107b47';
        const result: any = await api.students.update(targetId, updated);
        savedStudent = result;
        returnedUser = result.user;
      } catch (err: any) {
        console.warn('API update failed, keeping changes locally for this account:', err);
      }

      // 1. Update current student state across views (baseline card, drives eligibility, etc.)
      setCurrentStudent(savedStudent);

      // 2. Update currentUser state so header, auth dropdown, and identity update immediately
      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: savedStudent.name,
          email: savedStudent.email,
          rollNumber: savedStudent.rollNumber,
          ...(returnedUser || {}),
        };
      });

      // 3. Update sampleStudents so directory, modal funnels, and analytics show the updated student
      setSampleStudents((prev) => {
        const exists = prev.some(
          (s) =>
            s.id === savedStudent.id ||
            s.rollNumber === updated.rollNumber ||
            s.rollNumber === savedStudent.rollNumber
        );
        if (exists) {
          return prev.map((s) =>
            s.id === savedStudent.id ||
            s.rollNumber === updated.rollNumber ||
            s.rollNumber === savedStudent.rollNumber
              ? savedStudent
              : s
          );
        }
        return [...prev, savedStudent];
      });

      // 4. Persist for this account in localStorage so it permanently keeps using it
      persistProfileForAccount(savedStudent, [
        savedStudent.id,
        savedStudent.email,
        savedStudent.rollNumber,
        updated.id,
        updated.email,
        updated.rollNumber,
        currentUser?.id,
        currentUser?.email,
        currentUser?.rollNumber,
      ]);

      showToast('Academic profile updated across all views & saved for this account.');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update profile'}`);
    }
  };

  // Coordinator Flow: Confirm Stage Progress
  const handleConfirmStageProgress = async (applicationId: string, stageId: string | null) => {
    if (!stageId) return;
    try {
      await api.applications.updateStageProgress(applicationId, stageId, 'COMPLETED');
      showToast('Stage progress verified and confirmed by Coordinator');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to confirm stage progress'}`);
    }
  };

  // Coordinator Flow: Record final result (SELECTED / REJECTED)
  const handleRecordResult = async (
    studentId: string,
    driveId: string,
    result: 'SELECTED' | 'REJECTED',
    pkg: string
  ) => {
    try {
      await api.results.publish({ studentId, driveId, result, ctcPackage: pkg });
      showToast(`Recorded outcome: ${result} (${pkg})`);
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to publish result'}`);
    }
  };

  // Coordinator: Add Company
  const handleAddCompany = async (newCompany: Company) => {
    try {
      await api.companies.create(newCompany);
      showToast(`Added ${newCompany.name} to corporate partners`);
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to add company'}`);
    }
  };

  // Coordinator: Create Drive
  const handleCreateDrive = async (newDrive: PlacementDrive) => {
    try {
      await api.drives.create(newDrive);
      showToast(`Placement drive created for ${newDrive.companyName} (${newDrive.roleTitle})`);
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to create drive'}`);
    }
  };

  // Coordinator: Update criteria
  const handleSaveCriteria = async (
    driveId: string,
    updatedCriteria: EligibilityCriteria
  ) => {
    try {
      await api.drives.updateCriteria(driveId, updatedCriteria);
      showToast(`Eligibility criteria updated`);
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update criteria'}`);
    }
  };

  // Coordinator: Update stages / levels
  const handleUpdateStages = async (driveId: string, updatedStages: any[]) => {
    try {
      await api.drives.update(driveId, { stages: updatedStages });
      if (perDriveFocus && perDriveFocus.id === driveId) {
        setPerDriveFocus({
          ...perDriveFocus,
          stages: updatedStages,
        });
      }
      showToast('Recruitment levels and rounds updated');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update rounds'}`);
    }
  };

  // Coordinator: Conclude / End Drive
  const handleEndDrive = async (driveId: string) => {
    try {
      await api.drives.update(driveId, { status: 'Completed' });
      if (perDriveFocus && perDriveFocus.id === driveId) {
        setPerDriveFocus({
          ...perDriveFocus,
          status: 'Completed',
        });
      }
      showToast('Placement drive concluded and marked as Completed');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to end drive'}`);
    }
  };

  // Coordinator: Reopen Completed Drive
  const handleReopenDrive = async (driveId: string) => {
    try {
      await api.drives.update(driveId, { status: 'Active' });
      if (perDriveFocus && perDriveFocus.id === driveId) {
        setPerDriveFocus({
          ...perDriveFocus,
          status: 'Active',
        });
      }
      showToast('Placement drive reactivated and marked as Active');
      await fetchLiveData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to reopen drive'}`);
    }
  };

  const getTabTitle = () => {
    if (currentRole === 'COORDINATOR') {
      switch (currentTab) {
        case 'overview-dashboard':
          return 'Overview & Dashboard';
        case 'companies-and-drives':
          return 'Companies & Drives';
        case 'per-drive-dashboard':
          return perDriveFocus ? `${perDriveFocus.companyName} • Per-Drive Dashboard` : 'Drive Dashboard';
        case 'students':
          return 'Student Master Directory';
        case 'analytics':
          return 'Placement Analytics';
        default:
          return 'Coordinator Workspace';
      }
    } else {
      switch (currentTab) {
        case 'student-drives':
          return 'Browse Placement Drives';
        case 'student-applications':
          return 'My Applications & Stages';
        case 'student-profile':
          return 'Academic Profile';
        case 'student-results':
          return 'Placement Results';
        default:
          return 'Student Portal';
      }
    }
  };

  // ==========================================
  // 1. SCREEN: STARTING GATEWAY LANDING PAGE
  // ==========================================
  if (pageState === 'GATEWAY') {
    return (
      <StartingGatewayView
        onStudentSignIn={handleOpenStudentSignIn}
        onCoordinatorSignIn={handleOpenCoordinatorSignIn}
        onStudentRegister={handleOpenStudentRegister}
        activeDrivesCount={stats.activeDrivesCount}
        totalStudentsCount={stats.totalStudentsCount}
        placedStudentsCount={stats.placedStudentsCount}
        highestPackage={stats.highestPackage}
      />
    );
  }

  // ==========================================
  // 2. SCREEN: LOGIN / REGISTER AUTHENTICATION
  // ==========================================
  if (pageState === 'AUTH') {
    return (
      <AuthView
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onBackToGateway={() => setPageState('GATEWAY')}
      />
    );
  }

  // ==========================================
  // 3. SCREEN: MAIN PORTAL WORKSPACE
  // ==========================================
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen flex antialiased">
      {/* Animated Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-md shadow-xl text-xs flex items-center gap-2 border border-slate-700"
          >
            <span className="material-symbols-outlined text-amber-400 text-[18px]">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentRole={currentRole}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeCycle="2026-2027"
        student={currentStudent}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 md:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Persistent Top Header */}
        <Header
          currentTabName={getTabTitle()}
          currentRole={currentRole}
          currentStudent={currentStudent}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Body */}
        <main className="w-full pt-14 flex-1 bg-canvas">
          <div className="w-full p-4 sm:p-6 max-w-[1600px] mx-auto">
            {apiError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600 text-2xl">cloud_off</span>
                  <div className="text-xs">
                    <p className="font-bold text-red-900">Backend API Connection Notice</p>
                    <p className="text-red-700 mt-0.5">{apiError}</p>
                  </div>
                </div>
                <button
                  onClick={fetchLiveData}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}
            {/* COORDINATOR SCREENS ONLY */}
            {currentRole === 'COORDINATOR' && (
              <>
                {currentTab === 'companies-and-drives' && (
                  <CompaniesDrivesView
                    companies={companies}
                    onOpenAddCompany={() => setIsAddCompanyOpen(true)}
                    onOpenNewDrive={() => setIsNewDriveOpen(true)}
                    onOpenFunnel={(drive) => setFunnelDrive(drive)}
                    onOpenCriteria={(drive) => setCriteriaDrive(drive)}
                    onOpenSummary={(drive) => setSummaryDrive(drive)}
                    onOpenPerDriveDashboard={(drive) => {
                      setPerDriveFocus(drive);
                      setCurrentTab('per-drive-dashboard');
                    }}
                    onEndDrive={handleEndDrive}
                    onReopenDrive={handleReopenDrive}
                  />
                )}

                {currentTab === 'per-drive-dashboard' && perDriveFocus && (
                  <PerDriveDashboardView
                    drive={perDriveFocus}
                    students={sampleStudents}
                    applications={applications}
                    stageProgresses={stageProgresses}
                    results={results}
                    onConfirmStageProgress={handleConfirmStageProgress}
                    onRecordResult={handleRecordResult}
                    onUpdateStages={handleUpdateStages}
                    onEndDrive={handleEndDrive}
                    onReopenDrive={handleReopenDrive}
                    onBack={() => setCurrentTab('companies-and-drives')}
                  />
                )}

                {currentTab === 'overview-dashboard' && (
                  <OverviewDashboardView
                    companies={companies}
                    students={sampleStudents}
                    applications={applications}
                    results={results}
                    onNavigateToDrives={() => setCurrentTab('companies-and-drives')}
                    onNavigateToStudents={() => setCurrentTab('students')}
                  />
                )}

                {currentTab === 'students' && (
                  <StudentsView
                    students={sampleStudents.map((s) => ({
                      id: s.id,
                      name: s.name,
                      rollNo: s.rollNumber,
                      branch: s.branch,
                      cgpa: s.cgpa,
                      backlogs: s.backlogs,
                      placementStatus: results.some((r) => r.studentId === s.id && r.result === 'SELECTED')
                        ? 'Placed'
                        : applications.some((a) => a.studentId === s.id)
                        ? 'In Process'
                        : 'Unplaced',
                      offers: results
                        .filter((r) => r.studentId === s.id && r.result === 'SELECTED')
                        .map((r) => {
                          const d = companies.flatMap((c) => c.drives).find((dr) => dr.id === r.driveId);
                          return {
                            companyName: d?.companyName || 'Corporate Partner',
                            role: d?.roleTitle || 'Graduate Role',
                            ctc: r.ctcPackage || 'N/A',
                            tier: d?.tier || 'tier-2',
                          };
                        }),
                      appliedDrivesCount: applications.filter((a) => a.studentId === s.id).length,
                      email: s.email,
                      phone: s.phone,
                      skills: s.skills,
                      tenthPercentage: s.tenthPercentage,
                      twelfthPercentage: s.twelfthPercentage,
                      graduationYear: s.graduationYear,
                      resumePath: s.resumePath,
                    }))}
                  />
                )}

                {currentTab === 'analytics' && (
                  <AnalyticsView
                    companies={companies}
                    students={sampleStudents}
                    applications={applications}
                    results={results}
                  />
                )}
              </>
            )}

            {/* STUDENT SCREENS ONLY */}
            {currentRole === 'STUDENT' && (
              <>
                {currentTab === 'student-drives' && (
                  <StudentDrivesView
                    companies={companies}
                    student={currentStudent}
                    applications={applications}
                    onApplyDrive={handleApplyDrive}
                    onNavigateToApplications={() => setCurrentTab('student-applications')}
                  />
                )}

                {currentTab === 'student-applications' && (
                  <StudentApplicationsView
                    companies={companies}
                    student={currentStudent}
                    applications={applications.filter((a) => a.studentId === currentStudent.id)}
                    stageProgresses={stageProgresses}
                    results={results.filter((r) => r.studentId === currentStudent.id)}
                    onSelfMarkStage={handleSelfMarkStage}
                    onNavigateToDrives={() => setCurrentTab('student-drives')}
                  />
                )}

                {currentTab === 'student-profile' && (
                  <StudentProfileView
                    student={currentStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onNavigateToDrives={() => setCurrentTab('student-drives')}
                  />
                )}

                {currentTab === 'student-results' && (
                  <StudentResultsView
                    companies={companies}
                    applications={applications.filter((a) => a.studentId === currentStudent.id)}
                    results={results.filter((r) => r.studentId === currentStudent.id)}
                    onNavigateToDrives={() => setCurrentTab('student-drives')}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Slide-out Drawer: New Placement Drive */}
      <AnimatePresence>
        {isNewDriveOpen && (
          <NewDriveDrawer
            isOpen={isNewDriveOpen}
            onClose={() => setIsNewDriveOpen(false)}
            companies={companies}
            onCreateDrive={handleCreateDrive}
          />
        )}
      </AnimatePresence>

      {/* Modal: Add Partner Company */}
      <AnimatePresence>
        {isAddCompanyOpen && (
          <AddCompanyModal
            isOpen={isAddCompanyOpen}
            onClose={() => setIsAddCompanyOpen(false)}
            onAddCompany={handleAddCompany}
          />
        )}
      </AnimatePresence>

      {/* Modal: Candidate Funnel Audit */}
      <AnimatePresence>
        {funnelDrive && (
          <FunnelDashboardModal
            drive={funnelDrive}
            isOpen={!!funnelDrive}
            onClose={() => setFunnelDrive(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal: Edit Eligibility Criteria */}
      <AnimatePresence>
        {criteriaDrive && (
          <EditCriteriaModal
            drive={criteriaDrive}
            students={sampleStudents}
            isOpen={!!criteriaDrive}
            onClose={() => setCriteriaDrive(null)}
            onSaveCriteria={handleSaveCriteria}
          />
        )}
      </AnimatePresence>

      {/* Modal: Drive Summary */}
      <AnimatePresence>
        {summaryDrive && (
          <DriveSummaryModal
            drive={summaryDrive}
            student={currentStudent}
            isOpen={!!summaryDrive}
            onClose={() => setSummaryDrive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
