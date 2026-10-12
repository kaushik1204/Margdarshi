import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, PlacementDrive, StudentProfile, ApplicationRecord } from '../types/placement';
import { EligibilityService } from '../services/eligibilityService';

interface StudentDrivesViewProps {
  companies: Company[];
  student: StudentProfile;
  applications: ApplicationRecord[];
  onApplyDrive: (driveId: string, companyAppId: string) => void;
  onNavigateToApplications: () => void;
}

export const StudentDrivesView: React.FC<StudentDrivesViewProps> = ({
  companies,
  student,
  applications,
  onApplyDrive,
  onNavigateToApplications,
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Completed'>('all');
  const [selectedCompanyDropdown, setSelectedCompanyDropdown] = useState<string>('all');

  // Collapsible company accordion dropdowns (default expanded to see drive, can toggle)
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [expandedDriveDetails, setExpandedDriveDetails] = useState<Record<string, boolean>>({});

  const isCompanyExpanded = (companyId: string) => {
    return expandedCompanies[companyId] !== undefined ? expandedCompanies[companyId] : true;
  };

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyId]: !isCompanyExpanded(companyId),
    }));
  };

  const toggleDriveDetails = (driveId: string) => {
    setExpandedDriveDetails((prev) => ({
      ...prev,
      [driveId]: !prev[driveId],
    }));
  };

  const handleExpandAll = () => {
    const allExp: Record<string, boolean> = {};
    companies.forEach((c) => {
      allExp[c.id] = true;
    });
    setExpandedCompanies(allExp);
  };

  const handleCollapseAll = () => {
    const allExp: Record<string, boolean> = {};
    companies.forEach((c) => {
      allExp[c.id] = false;
    });
    setExpandedCompanies(allExp);
  };

  // Modal for Applying / Self-Reporting
  const [activeApplyDrive, setActiveApplyDrive] = useState<PlacementDrive | null>(null);
  const [companyApplicationId, setCompanyApplicationId] = useState('');
  const [hasVisitedExternalUrl, setHasVisitedExternalUrl] = useState(false);

  const appliedDriveIds = new Set(applications.map((a) => a.driveId));

  const handleOpenApplyModal = (drive: PlacementDrive) => {
    setActiveApplyDrive(drive);
    setCompanyApplicationId('');
    setHasVisitedExternalUrl(false);
  };

  const handleConfirmApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplyDrive || !companyApplicationId.trim()) return;

    onApplyDrive(activeApplyDrive.id, companyApplicationId.trim());
    setActiveApplyDrive(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Active Placement Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified corporate drives. Eligibility is evaluated in real time against your academic criteria.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToApplications}
            className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">timeline</span>
            <span>My Applications ({applications.length})</span>
          </motion.button>
        </div>
      </div>

      {/* Student Academic Baseline Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs font-mono">
            {student.branch}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">{student.name}</span>
              <span className="text-xs font-mono text-slate-500">({student.rollNumber})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>CGPA <strong className="text-slate-800 font-mono">{student.cgpa.toFixed(2)}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Backlogs: <strong className={student.backlogs === 0 ? 'text-emerald-700' : 'text-red-600'}>{student.backlogs}</strong></span>
              <span aria-hidden="true">·</span>
              <span>10th: <strong className="text-slate-800 font-mono">{student.tenthPercentage}%</strong></span>
              <span aria-hidden="true">·</span>
              <span>12th: <strong className="text-slate-800 font-mono">{student.twelfthPercentage}%</strong></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Graduation Class of <strong>{student.graduationYear}</strong></span>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by company, role, or location..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Company / Drive dropdown selector */}
          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500 mr-2">Company:</span>
            <select
              value={selectedCompanyDropdown}
              onChange={(e) => setSelectedCompanyDropdown(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">All Recruiters</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500 mr-2">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="tier-1">Tier 1 (&gt; 20 LPA)</option>
              <option value="tier-2">Tier 2 (10 - 20 LPA)</option>
              <option value="tier-3">Tier 3 (&lt; 10 LPA)</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500 mr-2">Eligibility:</span>
            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Drives</option>
              <option value="eligible">Only Eligible</option>
              <option value="ineligible">Criteria Unmet</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500 mr-2">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Completed">Concluded Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Expand all drives"
            >
              <span className="material-symbols-outlined text-[15px]">unfold_more</span>
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Collapse all drives"
            >
              <span className="material-symbols-outlined text-[15px]">unfold_less</span>
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drives List grouped by Company */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {companies.map((company, companyIdx) => {
          if (selectedCompanyDropdown !== 'all' && company.id !== selectedCompanyDropdown) {
            return null;
          }

          const companyDrives = company.drives.filter((drive) => {
            const matchesSearch =
              company.name.toLowerCase().includes(search.toLowerCase()) ||
              drive.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
              drive.location.toLowerCase().includes(search.toLowerCase());

            const matchesTier = tierFilter === 'all' || drive.tier === tierFilter;
            const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;

            const evalResult = EligibilityService.evaluate(student, drive.criteria);
            let matchesEligibility = true;
            if (eligibilityFilter === 'eligible') matchesEligibility = evalResult.isEligible;
            if (eligibilityFilter === 'ineligible') matchesEligibility = !evalResult.isEligible;

            return matchesSearch && matchesTier && matchesStatus && matchesEligibility;
          });

          if (companyDrives.length === 0) return null;

          const isExpanded = isCompanyExpanded(company.id);

          return (
            <motion.div
              key={`${company.id}-${companyIdx}`}
              variants={cardVariants}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
            >
              {/* Company Header with Interactive Dropdown Toggle */}
              <div
                onClick={() => toggleCompany(company.id)}
                className="px-5 py-4 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors select-none group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-bold text-base text-blue-600 shadow-2xs group-hover:scale-105 transition-transform"
                  >
                    {company.logoLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 leading-tight font-display">
                        {company.name}
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">
                        {company.tierLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {company.industry} · {company.locations}
                    </p>
                  </div>
                </div>

                {/* Dropdown toggle to see the drive */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompany(company.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      isExpanded
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70'
                        : 'bg-white text-slate-700 border-slate-200 group-hover:border-slate-300'
                    }`}
                    title={isExpanded ? 'Collapse drive details' : 'Dropdown to see the drive'}
                  >
                    <span>{isExpanded ? 'Hide Drive' : 'See Drive'}</span>
                    <span className="text-[11px] font-mono opacity-80">
                      ({companyDrives.length} Role{companyDrives.length > 1 ? 's' : ''})
                    </span>
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-blue-600' : 'rotate-0 text-slate-400'
                      }`}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>
                </div>
              </div>

              {/* Company Drives Collapsible Section */}
              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    key={`drives-${company.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-slate-100">
                      {companyDrives.map((drive) => {
                        const evalResult = EligibilityService.evaluate(student, drive.criteria);
                        const isApplied = appliedDriveIds.has(drive.id);
                        const existingApp = applications.find((a) => a.driveId === drive.id);
                        const isDriveDetailsExpanded = !!expandedDriveDetails[drive.id];
                        const isDriveEnded = drive.status === 'Completed';

                        return (
                          <div
                            key={drive.id}
                            className="p-5 hover:bg-slate-50/40 transition-colors flex flex-col gap-4"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                <div
                                  className={`w-1.5 h-12 rounded-full shrink-0 mt-0.5 ${
                                    isDriveEnded
                                      ? 'bg-slate-400'
                                      : drive.jobType === 'Internship'
                                      ? 'bg-amber-500'
                                      : 'bg-blue-600'
                                  }`}
                                />
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
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

                                    {/* Drive Ended Indicator */}
                                    {isDriveEnded && (
                                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">flag</span>
                                        <span>Drive Concluded</span>
                                      </span>
                                    )}

                                    {/* Eligibility indicator */}
                                    {evalResult.isEligible ? (
                                      <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                        <span>Eligible</span>
                                      </span>
                                    ) : (
                                      <span
                                        className="text-xs font-medium text-red-600 flex items-center gap-1 cursor-help"
                                        title={evalResult.reasons.join('\n')}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">cancel</span>
                                        <span>Not Eligible</span>
                                      </span>
                                    )}

                                    {isApplied && (
                                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 font-mono">
                                        <span className="material-symbols-outlined text-[15px]">task_alt</span>
                                        <span>Applied ({existingApp?.companyApplicationId})</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                                    <span>{drive.location}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>Deadline: <strong className="text-slate-700 font-mono">{drive.deadline.replace('T', ' ')}</strong></span>
                                    <span aria-hidden="true">·</span>
                                    <span>Cutoff: <strong className="text-slate-700 font-mono">{drive.criteria.minCgpa.toFixed(1)} CGPA</strong></span>
                                    <span aria-hidden="true">·</span>
                                    <span>Branches: {drive.criteria.allowedBranches.join(', ')}</span>
                                    {drive.criteria?.graduationYear && drive.criteria.graduationYear > 0 ? (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span>Target Batch: <strong className="text-slate-800 font-mono">{drive.criteria.graduationYear}</strong></span>
                                      </>
                                    ) : (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="text-emerald-700 font-medium">Open to All Batches</span>
                                      </>
                                    )}
                                  </div>

                                  {!evalResult.isEligible && (
                                    <div className="text-[11px] text-red-600 bg-red-50/70 px-3 py-1 rounded-lg border border-red-200/50 w-fit">
                                      <strong>Notice:</strong> {evalResult.reasons.join('; ')}
                                    </div>
                                  )}

                                  {/* Dropdown toggle for detailed round info */}
                                  <button
                                    type="button"
                                    onClick={() => toggleDriveDetails(drive.id)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer w-fit mt-0.5"
                                  >
                                    <span>{isDriveDetailsExpanded ? 'Hide Rounds & Details' : 'See Drive Rounds & Details'}</span>
                                    <span
                                      className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                                        isDriveDetailsExpanded ? 'rotate-180' : 'rotate-0'
                                      }`}
                                    >
                                      expand_more
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                                {isDriveEnded ? (
                                  <button
                                    disabled
                                    className="h-9 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed border border-slate-200 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">lock</span>
                                    <span>Drive Concluded</span>
                                  </button>
                                ) : isApplied ? (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNavigateToApplications}
                                    className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    <span>Track Timeline</span>
                                  </motion.button>
                                ) : evalResult.isEligible ? (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleOpenApplyModal(drive)}
                                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>Apply & Self-Report</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                  </motion.button>
                                ) : (
                                  <button
                                    disabled
                                    className="h-9 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                                    title={evalResult.reasons.join(', ')}
                                  >
                                    Criteria Unmet
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Dropdown Details: Evaluation Rounds & Full Info */}
                            <AnimatePresence>
                              {isDriveDetailsExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col gap-3 text-xs"
                                >
                                  {drive.jobDescription && (
                                    <div>
                                      <span className="font-bold text-slate-800">Job Description:</span>
                                      <p className="text-slate-600 mt-1 leading-relaxed">{drive.jobDescription}</p>
                                    </div>
                                  )}

                                  {/* Recruitment Stages Timeline */}
                                  {drive.stages && drive.stages.length > 0 && (
                                    <div>
                                      <span className="font-bold text-slate-800 mb-2 block">
                                        Evaluation Rounds ({drive.stages.length} Stages):
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {drive.stages.map((stg, stgIdx) => (
                                          <div
                                            key={stg.id || stgIdx}
                                            className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2"
                                          >
                                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                              {stgIdx + 1}
                                            </span>
                                            <div className="min-w-0">
                                              <p className="font-semibold text-slate-800 truncate">{stg.name}</p>
                                              <p className="text-[10px] text-slate-400">{stg.date || 'Upcoming'}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Career Link */}
                                  {drive.externalUrl && (
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                                      <span className="text-slate-500">Official Portal Link:</span>
                                      <a
                                        href={drive.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                      >
                                        <span>Visit External Application Link</span>
                                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                      </a>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div
                    onClick={() => toggleCompany(company.id)}
                    className="px-5 py-3 bg-slate-50/40 text-xs text-slate-500 hover:bg-blue-50/30 hover:text-blue-700 cursor-pointer flex items-center justify-between border-t border-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">visibility</span>
                      <span>
                        Click dropdown to see {companyDrives.length} placement drive role
                        {companyDrives.length > 1 ? 's' : ''} for {company.name}
                      </span>
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <span>See Drive</span>
                      <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two-step Apply / Self-Report Modal */}
      <AnimatePresence>
        {activeApplyDrive && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl border border-slate-200/90"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                    Official Application Flow
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {activeApplyDrive.companyName} · {activeApplyDrive.roleTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveApplyDrive(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Step 1: External Application Portal */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Step 1: External Company Portal
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    First, open the verified career link and submit the corporate job application form.
                  </p>
                  <a
                    href={activeApplyDrive.externalUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasVisitedExternalUrl(true)}
                    className="mt-1 w-full h-9 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 text-blue-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Open {activeApplyDrive.companyName} Careers Portal</span>
                  </a>
                </div>

                {/* Step 2: Self-Report Application */}
                <form onSubmit={handleConfirmApplication} className="flex flex-col gap-3.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Step 2: Self-Report Reference ID
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the submission reference or confirmation ID issued by the recruiting team.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Company Application Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyApplicationId}
                      onChange={(e) => setCompanyApplicationId(e.target.value)}
                      placeholder={`e.g. ${activeApplyDrive.companyName.split(' ')[0].toUpperCase()}2026A18372`}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <span className="text-[11px] text-slate-400">
                      Self-reported applications are logged immediately and synced with coordinator records.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveApplyDrive(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      Confirm & Record Application
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
