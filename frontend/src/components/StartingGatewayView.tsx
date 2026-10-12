import React from 'react';
import { motion } from 'motion/react';

interface StartingGatewayViewProps {
  onStudentSignIn: () => void;
  onCoordinatorSignIn: () => void;
  onStudentRegister: () => void;
  activeDrivesCount?: number;
  totalStudentsCount?: number;
  placedStudentsCount?: number;
  highestPackage?: string;
}

export const StartingGatewayView: React.FC<StartingGatewayViewProps> = ({
  onStudentSignIn,
  onCoordinatorSignIn,
  onStudentRegister,
  activeDrivesCount = 4,
  totalStudentsCount = 16,
  placedStudentsCount = 4,
  highestPackage = '₹32.0 LPA',
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900 relative">
      {/* Subtle institutional parchment header bar */}
      <header className="h-20 px-6 sm:px-12 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs border border-slate-800">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-950 font-display">
                Margdarshi
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                2026–2027
              </span>
            </div>
            <p className="text-[12px] text-slate-500 font-medium tracking-normal -mt-0.5">
              Anurag University Placement Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCoordinatorSignIn}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          >
            Coordinator Sign In
          </button>
          <button
            onClick={onStudentSignIn}
            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer border border-slate-900"
          >
            Student Sign In
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16 flex flex-col justify-center">
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          {/* Institutional subtitle label without capsule pill */}
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-mono">
            Anurag University · Campus Placement Portal
          </div>

          {/* Name & Tagline */}
          <div className="flex flex-col gap-2.5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-950 tracking-tight font-display leading-[1.08]">
              Margdarshi
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight font-display">
              Anurag University's placement journey, tracked in one place.
            </p>
          </div>

          {/* Core Purpose: Two short sentences */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            Browse active company drives, track your application through every evaluation stage, and see verified results.
            Margdarshi acts as the official tracking layer alongside employers' external portals, not as a replacement for their individual application systems.
          </p>

          {/* Visually Distinct Sign In Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={onStudentSignIn}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <span>Student Sign In</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              onClick={onCoordinatorSignIn}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-amber-50/60 text-amber-900 border border-amber-800/30 font-semibold text-sm rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-800">admin_panel_settings</span>
              <span>Coordinator Sign In</span>
            </button>
          </div>

          {/* Registration Link */}
          <div className="pt-0.5">
            <button
              onClick={onStudentRegister}
              className="text-xs text-slate-600 hover:text-slate-950 font-medium inline-flex items-center gap-1 group cursor-pointer"
            >
              <span>New student?</span>
              <span className="text-amber-800 font-semibold underline underline-offset-4 decoration-amber-800/40 group-hover:decoration-amber-800">
                Register your account here
              </span>
            </button>
          </div>
        </motion.section>

        {/* REAL TRACE-VERIFIED STAT LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-14 py-4 px-5 bg-white border border-slate-200/90 rounded-lg text-xs sm:text-sm text-slate-700 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono"
        >
          <span className="font-semibold text-slate-950">Active Season Summary</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span>{activeDrivesCount} active recruitment drives</span>
          <span className="text-slate-300">·</span>
          <span>{placedStudentsCount} students placed</span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-900 font-semibold">{highestPackage} top package</span>
        </motion.div>

        {/* HOW IT WORKS SECTION (Plain 3-step sequence, no generic feature cards) */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-16 pt-10 border-t border-slate-200"
        >
          <h2 className="text-lg font-bold text-slate-900 font-display mb-6 tracking-tight">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-slate-200/80 rounded-md">
              <span className="text-xs font-mono font-bold text-amber-800">01</span>
              <h3 className="font-semibold text-slate-900">Browse active drives</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Check role requirements, CTC packages, criteria eligibility, and screening schedules published by the placement cell.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-white border border-slate-200/80 rounded-md">
              <span className="text-xs font-mono font-bold text-amber-800">02</span>
              <h3 className="font-semibold text-slate-900">Apply & self-report</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Submit on the company's designated portal, then enter your application identifier here to confirm participation.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-white border border-slate-200/80 rounded-md">
              <span className="text-xs font-mono font-bold text-amber-800">03</span>
              <h3 className="font-semibold text-slate-900">Track & verify</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Follow interview rounds, online challenges, and final coordinator-verified selection results with 100% transparency.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="h-16 px-6 sm:px-12 border-t border-slate-200/80 bg-white/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          Anurag University · Venkatapur, Ghatkesar, Hyderabad
        </div>
        <div className="font-mono text-[11px]">
          Margdarshi v2.0
        </div>
      </footer>
    </div>
  );
};
