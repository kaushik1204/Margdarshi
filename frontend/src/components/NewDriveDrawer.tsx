import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Company, PlacementDrive, JobType, CompensationTier, RecruitmentStageItem } from '../types/placement';

interface NewDriveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onCreateDrive: (drive: PlacementDrive) => void;
}

export const NewDriveDrawer: React.FC<NewDriveDrawerProps> = ({
  isOpen,
  onClose,
  companies,
  onCreateDrive,
}) => {
  const [companyId, setCompanyId] = useState(companies[0]?.id || 'google');
  const [roleTitle, setRoleTitle] = useState('');
  const [jobType, setJobType] = useState<JobType>('Full Time');
  const [ctcText, setCtcText] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [deadline, setDeadline] = useState('2026-11-30T23:59');
  const [externalUrl, setExternalUrl] = useState('');
  
  // Cutoffs start as empty strings with placeholders so users don't need to delete numbers
  const [minCgpa, setMinCgpa] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');
  const [min10th, setMin10th] = useState('');
  const [min12th, setMin12th] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'CSE',
    'IT',
    'ECE',
    'AIML',
  ]);
  const [targetGradYear, setTargetGradYear] = useState<string>('2027');
  const [customGradYear, setCustomGradYear] = useState<string>('');

  // Dynamic recruitment stages (levels) configurable by coordinator
  const [stagesList, setStagesList] = useState<string[]>([
    'Applications Received',
    'Eligibility Shortlist',
    'Online Coding Challenge',
    'Technical Interview',
    'Final Selection Rollout',
  ]);
  const [newStageInput, setNewStageInput] = useState('');

  if (!isOpen) return null;

  const allBranches = ['CSE', 'IT', 'ECE', 'AIML', 'Electrical', 'Mechanical', 'Civil'];

  const toggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleSelectAllBranches = () => {
    if (selectedBranches.length === allBranches.length) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches([...allBranches]);
    }
  };

  const handleAddStage = () => {
    if (newStageInput.trim() && !stagesList.includes(newStageInput.trim())) {
      setStagesList([...stagesList, newStageInput.trim()]);
      setNewStageInput('');
    }
  };

  const handleRemoveStage = (index: number) => {
    if (stagesList.length <= 1) return;
    setStagesList(stagesList.filter((_, i) => i !== index));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= stagesList.length) return;
    const updated = [...stagesList];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setStagesList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === companyId) || companies[0];

    const match = ctcText.match(/(\d+(\.\d+)?)/);
    const num = match ? parseFloat(match[1]) : 15.0;
    const tier: CompensationTier =
      num >= 20 ? 'tier-1' : num >= 10 ? 'tier-2' : 'tier-3';

    const driveId = `drive-${Date.now()}`;

    const configuredStages: RecruitmentStageItem[] = stagesList.map((name, idx) => ({
      id: `stage-${idx + 1}-${Date.now()}`,
      driveId,
      stageOrder: idx + 1,
      name,
      candidateCount: 0,
      passingRate: Math.max(15, 100 - idx * 20),
      status: idx === 0 ? 'in_progress' : 'scheduled',
      date: idx === 0 ? 'Now' : 'Upcoming',
    }));

    const parsedMinCgpa = minCgpa ? parseFloat(minCgpa) : 7.0;
    const parsedMaxBacklogs = maxBacklogs ? parseInt(maxBacklogs, 10) : 0;
    const parsedMin10th = min10th ? parseFloat(min10th) : 0;
    const parsedMin12th = min12th ? parseFloat(min12th) : 0;
    const parsedGradYear =
      targetGradYear === '0' || targetGradYear === 'all'
        ? 0
        : targetGradYear === 'custom'
        ? (parseInt(customGradYear, 10) || 0)
        : (parseInt(targetGradYear, 10) || 2026);

    const newDrive: PlacementDrive = {
      id: driveId,
      companyId: comp.id,
      companyName: comp.name,
      roleTitle: roleTitle || 'Graduate Trainee Engineer',
      jobType,
      ctc: ctcText.startsWith('CTC:') || ctcText.startsWith('Stipend:') ? ctcText : `CTC: ${ctcText || '18.0 LPA'}`,
      rawCtcNumber: num,
      tier,
      location,
      deadline,
      externalUrl: externalUrl || 'https://careers.google.com',
      jobDescription: `Placement drive for ${roleTitle || 'Graduate Role'} at ${comp.name}.`,
      eligibleCount: 0,
      applicationsCount: 0,
      currentStage: stagesList[0] || 'Registration Open',
      currentStageStatus: 'warning',
      status: 'Active',
      selectedCount: 0,
      criteria: {
        minCgpa: parsedMinCgpa,
        allowedBranches: selectedBranches.length ? selectedBranches : ['ALL'],
        maxBacklogs: parsedMaxBacklogs,
        graduationYear: parsedGradYear,
        min10thPercentage: parsedMin10th,
        min12thPercentage: parsedMin12th,
      },
      stages: configuredStages,
    };

    onCreateDrive(newDrive);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="fixed top-0 right-0 h-full w-full max-w-[540px] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4.5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase font-mono">
              Recruitment Drive Provisioning
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-7 font-display">
              Create Placement Drive
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form
          id="create-drive-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 text-xs"
        >
          {/* Company Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Corporate Partner *
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.industry})
                </option>
              ))}
            </select>
          </div>

          {/* Job Role Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Job Role Title *
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Software Development Engineer (SDE)"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          {/* Job Type Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Job Category *
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setJobType('Full Time')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  jobType === 'Full Time'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Time Role
              </button>
              <button
                type="button"
                onClick={() => setJobType('Internship')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  jobType === 'Internship'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internship
              </button>
            </div>
          </div>

          {/* CTC and Location */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                CTC Package *
              </label>
              <input
                type="text"
                required
                value={ctcText}
                onChange={(e) => setCtcText(e.target.value)}
                placeholder="e.g. 24.5 LPA"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Job Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hyderabad / Bengaluru"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Application Deadline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Registration Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          {/* External URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              External Careers Job Link
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://careers.google.com/jobs/..."
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          {/* Academic Eligibility Cutoffs */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Academic Eligibility Cutoffs
            </span>

            {/* Year of Students Who Can Apply / Graduation Batch */}
            <div className="flex flex-col gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">school</span>
                  <span>Eligible Student Year / Batch *</span>
                </label>
                <span className="text-[10px] text-blue-700 font-medium">Who can apply</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { value: '2027', title: '2027 Batch', desc: '4th Year / Final' },
                  { value: '2028', title: '2028 Batch', desc: '3rd Year / Pre-Final' },
                  { value: '2029', title: '2029 Batch', desc: '2nd Year' },
                  { value: '2030', title: '2030 Batch', desc: '1st Year' },
                  { value: '2026', title: '2026 Batch', desc: 'Graduated / Alumni' },
                  { value: 'all', title: 'Open to All', desc: 'Any Student Year' },
                  { value: 'custom', title: 'Custom Batch', desc: 'Enter Year' },
                ].map((opt) => {
                  const isSelected = targetGradYear === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetGradYear(opt.value)}
                      className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {targetGradYear === 'custom' && (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={customGradYear}
                    onChange={(e) => setCustomGradYear(e.target.value)}
                    placeholder="Enter Graduation Year e.g. 2025"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-blue-300 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Minimum CGPA Cutoff
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="e.g. 7.50"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Max Standing Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  10th Board Cutoff (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={min10th}
                  onChange={(e) => setMin10th(e.target.value)}
                  placeholder="e.g. 60.0 (Optional)"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  12th Board Cutoff (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={min12th}
                  onChange={(e) => setMin12th(e.target.value)}
                  placeholder="e.g. 60.0 (Optional)"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            {/* Allowed Branches */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Eligible Academic Branches
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllBranches}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {selectedBranches.length === allBranches.length ? 'Deselect All' : 'Select All Branches'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allBranches.map((branch) => {
                  const isSelected = selectedBranches.includes(branch);
                  return (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => toggleBranch(branch)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {branch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recruitment Stages / Evaluation Levels (Customizable by Coordinator) */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Evaluation Rounds / Levels ({stagesList.length})
              </span>
              <span className="text-[11px] text-slate-400">Order from round 1 to final</span>
            </div>

            <div className="flex flex-col gap-2">
              {stagesList.map((stageName, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {stageName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStage(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === stagesList.length - 1}
                      onClick={() => handleMoveStage(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                    <button
                      type="button"
                      disabled={stagesList.length <= 1}
                      onClick={() => handleRemoveStage(index)}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 cursor-pointer"
                      title="Remove Stage"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Stage / Level */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newStageInput}
                onChange={(e) => setNewStageInput(e.target.value)}
                placeholder="e.g. System Architecture Round, HR Discussion"
                className="flex-1 h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddStage}
                className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">add</span>
                <span>Add Level</span>
              </button>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            form="create-drive-form"
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Publish Placement Drive</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </motion.button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
};
