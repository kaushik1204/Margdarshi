import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, PlacementDrive, CompensationTier } from '../types/placement';

interface CompaniesDrivesViewProps {
  companies: Company[];
  onOpenAddCompany: () => void;
  onOpenNewDrive: () => void;
  onOpenFunnel: (drive: PlacementDrive) => void;
  onOpenCriteria: (drive: PlacementDrive) => void;
  onOpenSummary: (drive: PlacementDrive) => void;
  onOpenPerDriveDashboard?: (drive: PlacementDrive) => void;
  onEndDrive?: (driveId: string) => void;
  onReopenDrive?: (driveId: string) => void;
}

export const CompaniesDrivesView: React.FC<CompaniesDrivesViewProps> = ({
  companies,
  onOpenAddCompany,
  onOpenNewDrive,
  onOpenFunnel,
  onOpenCriteria,
  onOpenSummary,
  onOpenPerDriveDashboard,
  onEndDrive,
  onReopenDrive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026-27');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'drafts'>('all');
  const [driveToEnd, setDriveToEnd] = useState<PlacementDrive | null>(null);

  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({
    google: true,
    microsoft: true,
    cisco: true,
  });

  const toggleAccordion = (id: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalRecruiters = companies.length;
  const activePipelines = companies.reduce(
    (acc, c) => acc + c.drives.filter((d) => d.status === 'Active').length,
    0
  );
  const completedDrives = companies.reduce(
    (acc, c) => acc + c.drives.filter((d) => d.status === 'Completed').length,
    0
  );
  const draftedProfiles = companies.reduce(
    (acc, c) => acc + c.drives.filter((d) => d.status === 'Draft').length,
    0
  );

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.drives.some((d) =>
        d.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ctc.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTier =
      selectedTier === 'all' || company.tier === selectedTier;

    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = company.drives.some((d) => d.status === 'Active');
    } else if (activeTab === 'completed') {
      matchesTab = company.drives.some((d) => d.status === 'Completed');
    } else if (activeTab === 'drafts') {
      matchesTab = company.drives.some((d) => d.status === 'Draft') || company.status === 'Draft';
    }

    return matchesSearch && matchesTier && matchesTab;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Operations & Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Companies & Placement Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage recruiting partners, live campus drive pipelines, and student academic eligibility cutoffs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAddCompany}
            className="h-9 px-4 bg-white text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs border border-slate-200/90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">
              domain_add
            </span>
            <span>+ Add Company</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenNewDrive}
            className="h-9 px-4 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">
              add_circle
            </span>
            <span>+ New Placement Drive</span>
          </motion.button>
        </div>
      </div>

      {/* Operational Stat Rail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200/80"
        >
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
            TOTAL RECRUITERS
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-3xl text-slate-900 font-mono tabular-nums">
              {totalRecruiters}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Verified Partners
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200/80"
        >
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
            ACTIVE PIPELINES
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-3xl text-blue-600 font-mono tabular-nums">
              {activePipelines}
            </span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              Live Rounds
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200/80"
        >
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
            COMPLETED DRIVES
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-3xl text-slate-900 font-mono tabular-nums">
              {completedDrives}
            </span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              100% Audited
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-slate-200/80"
        >
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
            DRAFTED PROFILES
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-3xl text-amber-600 font-mono tabular-nums">
              {draftedProfiles}
            </span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              In Review
            </span>
          </div>
        </motion.div>
      </div>

      {/* Filter & Search Console */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xs border border-slate-200/80">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role title, or compensation..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-medium"
            />
          </div>

          {/* Dropdown Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 mr-2">Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="tier-1">Tier 1 (&gt; 20 LPA)</option>
                <option value="tier-2">Tier 2 (10 - 20 LPA)</option>
                <option value="tier-3">Tier 3 (&lt; 10 LPA)</option>
              </select>
            </div>
            <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
              <span className="text-xs font-medium text-slate-500 mr-2">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="2026-27">2026 - 2027 (Active)</option>
                <option value="2025-26">2025 - 2026 (Archived)</option>
                <option value="2024-25">2024 - 2025 (Archived)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>All Companies</span>
            <span className="font-mono text-[11px] opacity-80">
              ({totalRecruiters})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Active Drives</span>
            <span className="font-mono text-[11px] opacity-80">
              ({activePipelines})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Completed</span>
            <span className="font-mono text-[11px] opacity-80">
              ({completedDrives})
            </span>
          </button>
        </div>
      </div>

      {/* Primary Tabular Accordion Layout */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-slate-200/80">
        {/* Table Meta Heading Row */}
        <div className="grid grid-cols-12 px-5 py-3 bg-slate-50/80 font-semibold text-[11px] text-slate-400 tracking-wider font-mono select-none uppercase border-b border-slate-200/80">
          <div className="col-span-5 md:col-span-4 flex items-center gap-2">
            <span>COMPANY & PROFILE</span>
          </div>
          <div className="col-span-3 md:col-span-2">TIER BRACKET</div>
          <div className="col-span-2 hidden md:block">DRIVES RECORD</div>
          <div className="col-span-2 hidden md:block">PLACED CANDIDATES</div>
          <div className="col-span-4 md:col-span-2 text-right">STATUS / ACTION</div>
        </div>

        {/* Company Accordion Rows */}
        {filteredCompanies.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 text-xs">
            No corporate partners matching the filters.
          </div>
        ) : (
          filteredCompanies.map((company, index) => {
            const isExpanded = !!expandedCompanies[company.id];

            return (
              <div key={`${company.id}-${index}`} className="border-b border-slate-100 last:border-b-0">
                {/* Accordion Row Header */}
                <div
                  onClick={() => toggleAccordion(company.id)}
                  className="grid grid-cols-12 px-5 py-4 bg-white hover:bg-slate-50/60 cursor-pointer items-center transition-colors select-none"
                >
                  <div className="col-span-5 md:col-span-4 flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-sm text-blue-700 shrink-0 shadow-2xs"
                    >
                      {company.logoLetter}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-900 truncate font-display">
                        {company.name}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {company.industry} · {company.locations}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 flex items-center">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {company.tierLabel}
                    </span>
                  </div>

                  <div className="col-span-2 hidden md:flex items-center text-xs text-slate-700 font-medium">
                    {company.drivesRecordLabel}
                  </div>

                  <div className="col-span-2 hidden md:flex items-center text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {company.totalHiredCount} Students
                  </div>

                  <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2.5">
                    <span
                      className={`text-xs font-semibold ${
                        company.status === 'Active'
                          ? 'text-emerald-700'
                          : company.status === 'Closed'
                          ? 'text-slate-500'
                          : 'text-amber-600'
                      }`}
                    >
                      {company.status === 'Active' ? 'Active' : company.status === 'Closed' ? 'Closed' : 'Draft'}
                    </span>
                    <span
                      className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-180'
                      }`}
                    >
                      expand_less
                    </span>
                  </div>
                </div>

                {/* Nested Drives Accordion Body */}
                <AnimatePresence>
                  {isExpanded && company.drives.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col bg-slate-50/70 pl-8 pr-5 py-3 space-y-2.5 border-t border-slate-100 overflow-hidden"
                    >
                      {company.drives.map((drive) => {
                        const isComplete = drive.status === 'Completed';

                        return (
                          <div
                            key={drive.id}
                            className="bg-white rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 shadow-2xs hover:shadow-xs transition-shadow border border-slate-200/80"
                          >
                            <div className="flex items-start md:items-center gap-3.5 min-w-0">
                              <div
                                className={`w-1.5 h-10 rounded-full shrink-0 mt-0.5 md:mt-0 ${
                                  isComplete
                                    ? 'bg-slate-400'
                                    : drive.jobType === 'Internship'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-600'
                                }`}
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900">
                                    {drive.roleTitle}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium">
                                    {drive.jobType}
                                  </span>
                                  <span className="text-xs font-semibold text-blue-700 font-mono tabular-nums">
                                    {drive.ctc}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                                  {isComplete ? (
                                    <>
                                      <span>
                                        Applications: <strong className="text-slate-800 font-mono">{drive.applicationsCount}</strong>
                                      </span>
                                      <span aria-hidden="true">·</span>
                                      <span>
                                        Selected: <strong className="text-emerald-700 font-mono">{drive.selectedCount || 1} Verified</strong>
                                      </span>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-slate-600">Cycle Finalized</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>
                                        Eligible: <strong className="text-slate-800 font-mono">{drive.eligibleCount}</strong>
                                      </span>
                                      <span aria-hidden="true">·</span>
                                      <span>
                                        Applications: <strong className="text-slate-800 font-mono">{drive.applicationsCount}</strong>
                                      </span>
                                      <span aria-hidden="true">·</span>
                                      <span className="flex items-center gap-1">
                                        Current Stage: <strong className="text-slate-800">{drive.currentStage}</strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto flex-wrap justify-end">
                              {!isComplete ? (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onOpenCriteria(drive)}
                                    className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    Edit Criteria
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onOpenFunnel(drive)}
                                    className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[15px] text-blue-600">
                                      query_stats
                                    </span>
                                    <span>Funnel</span>
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      onOpenPerDriveDashboard
                                        ? onOpenPerDriveDashboard(drive)
                                        : onOpenFunnel(drive)
                                    }
                                    className="h-8 px-3.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                                  >
                                    Manage Drive
                                  </motion.button>
                                  {onEndDrive && (
                                    <motion.button
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setDriveToEnd(drive)}
                                      className="h-8 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Conclude recruitment cycle and end this drive"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">flag</span>
                                      <span>End Drive</span>
                                    </motion.button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onOpenSummary(drive)}
                                    className="h-8 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    View Summary
                                  </motion.button>
                                  {onReopenDrive && (
                                    <motion.button
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => onReopenDrive(drive.id)}
                                      className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Reactivate this completed drive"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                                      <span>Reopen</span>
                                    </motion.button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* End Drive Confirmation Modal */}
      <AnimatePresence>
        {driveToEnd && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">flag</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    End Placement Drive?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conclude recruiting cycle for candidates
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p>
                  Are you sure you want to conclude the drive for{' '}
                  <strong className="text-slate-900 font-semibold">{driveToEnd.companyName}</strong> (
                  <strong className="text-slate-900 font-semibold">{driveToEnd.roleTitle}</strong>)?
                </p>
                <p className="mt-2 text-slate-500">
                  This will transition the status to <strong>Completed</strong>. Candidates will see this drive marked as finalized.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDriveToEnd(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onEndDrive && driveToEnd) {
                      onEndDrive(driveToEnd.id);
                      setDriveToEnd(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Confirm & End Drive</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
