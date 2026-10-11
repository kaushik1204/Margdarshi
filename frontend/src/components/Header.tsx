import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, StudentProfile, AuthUser } from '../types/placement';

interface HeaderProps {
  currentTabName: string;
  currentRole: UserRole;
  currentStudent: StudentProfile;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabName,
  currentRole,
  currentStudent,
  currentUser,
  onSignOut,
  onToggleMobileMenu,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isCoordinator = currentRole === 'COORDINATOR';

  const displayName = isCoordinator
    ? (currentUser?.role === 'COORDINATOR' ? currentUser.name : 'Prof. R. Krishna')
    : (currentUser?.role === 'STUDENT' ? currentUser.name : currentStudent.name);

  const displaySubtitle = isCoordinator
    ? 'Placement Officer'
    : (currentUser?.rollNumber || currentStudent.rollNumber);

  const displayEmail = isCoordinator
    ? (currentUser?.role === 'COORDINATOR' ? currentUser.email : 'coordinator@anurag.edu.in')
    : (currentUser?.role === 'STUDENT' ? currentUser.email : currentStudent.email);

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 flex items-center justify-between px-4 sm:px-6 select-none">
      {/* Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        <div className="flex items-center text-slate-500 text-xs font-medium gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-800">
            {isCoordinator ? 'admin_panel_settings' : 'school'}
          </span>
          <span className="text-slate-950 font-bold font-display text-sm">Margdarshi</span>
          <span className="text-slate-300">/</span>
          <span className="hidden sm:inline text-slate-600">
            {isCoordinator ? 'Coordinator' : 'Student'}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 font-medium truncate max-w-[140px] sm:max-w-none">
            {currentTabName}
          </span>
        </div>
      </div>

      {/* Right Controls: Role Indicator & Profile Card */}
      <div className="flex items-center gap-3">
        {/* Unboxed role indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              isCoordinator ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          />
          <span className="text-slate-600 font-mono text-[11px]">
            {isCoordinator ? 'COORDINATOR' : 'STUDENT'}
          </span>
        </div>

        {/* Profile Card & Dropdown */}
        <div className="relative flex items-center">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="flex flex-col text-right">
              <span className="font-semibold text-xs text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {displaySubtitle}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white font-medium text-xs shadow-xs ${
                isCoordinator ? 'bg-slate-900' : 'bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-amber-400">
                {isCoordinator ? 'admin_panel_settings' : 'person'}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px] hover:text-slate-700 transition-colors">
              unfold_more
            </span>
          </motion.div>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-64 bg-white border border-slate-200/90 rounded-lg shadow-lg py-2 z-50 text-xs"
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-900">{displayName}</span>
                  <span className="text-[11px] text-slate-500 font-mono break-all">{displayEmail}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-800 font-medium">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>{isCoordinator ? 'Verified Coordinator' : 'Enrolled Candidate'}</span>
                  </div>
                </div>

                <div className="p-1">
                  {onSignOut && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out from Margdarshi</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
