import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, StudentProfile } from '../types/placement';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeCycle?: string;
  student: StudentProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  activeCycle = '2026-2027',
  student,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const coordinatorNavItems = [
    {
      id: 'companies-and-drives',
      label: 'Companies & Drives',
      icon: 'business_center',
    },
    {
      id: 'overview-dashboard',
      label: 'Overview / Dashboard',
      icon: 'dashboard',
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: 'group',
    },
    {
      id: 'analytics',
      label: 'Placement Analytics',
      icon: 'monitoring',
    },
  ];

  const studentNavItems = [
    {
      id: 'student-drives',
      label: 'Browse Placement Drives',
      icon: 'business_center',
    },
    {
      id: 'student-applications',
      label: 'My Applications & Stages',
      icon: 'timeline',
    },
    {
      id: 'student-profile',
      label: 'My Academic Profile',
      icon: 'badge',
    },
    {
      id: 'student-results',
      label: 'Placement Results',
      icon: 'verified',
    },
  ];

  const navItems = currentRole === 'COORDINATOR' ? coordinatorNavItems : studentNavItems;

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col justify-between select-none transition-transform duration-250 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 px-4 border-b border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-xs bg-slate-900 text-amber-400 border border-slate-800">
                <span className="material-symbols-outlined text-[17px]">
                  account_balance
                </span>
              </div>
              <span className="font-bold text-base tracking-tight text-slate-950 truncate font-display">
                Margdarshi
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 font-mono tracking-wider shrink-0 uppercase">
                {currentRole === 'COORDINATOR' ? 'ADMIN' : 'STUDENT'}
              </span>
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Section Label */}
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase font-mono">
              {currentRole === 'COORDINATOR' ? 'COORDINATOR WORKSPACE' : 'STUDENT PORTAL'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 px-2.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'text-slate-950 bg-slate-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-700 rounded-r"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span
                    className={`material-symbols-outlined text-[19px] shrink-0 transition-colors ${
                      isActive ? 'text-amber-800' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Placement Cycle</span>
              <span className="font-mono font-semibold text-slate-900">{activeCycle}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
              <span>Anurag University</span>
              <span className="text-emerald-700 font-medium">● System Live</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
