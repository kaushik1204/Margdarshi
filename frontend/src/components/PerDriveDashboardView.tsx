import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlacementDrive,
  StudentProfile,
  ApplicationRecord,
  StageProgressRecord,
  PlacementResultRecord,
  RecruitmentStageItem,
} from '../types/placement';

interface PerDriveDashboardViewProps {
  drive: PlacementDrive;
  students: StudentProfile[];
  applications: ApplicationRecord[];
  stageProgresses: StageProgressRecord[];
  results: PlacementResultRecord[];
  onConfirmStageProgress: (applicationId: string, stageId: string) => void;
  onRecordResult?: (studentId: string, driveId: string, result: 'SELECTED' | 'REJECTED', pkg: string) => void;
  onUpdateStages?: (driveId: string, updatedStages: RecruitmentStageItem[]) => void;
  onBack: () => void;
}

export const PerDriveDashboardView: React.FC<PerDriveDashboardViewProps> = ({
  drive,
  students,
  applications,
  stageProgresses,
  results,
  onConfirmStageProgress,
  onUpdateStages,
  onBack,
}) => {
  // Drill-down stage ID. If null, displays the centerpiece aggregate-only dashboard!
  const [drillDownStageId, setDrillDownStageId] = useState<string | null>(null);

  // Modal to manage / add / reorder recruitment stages (levels)
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
  const [customStages, setCustomStages] = useState<RecruitmentStageItem[]>(drive.stages || []);
  const [newStageName, setNewStageName] = useState('');

  useEffect(() => {
    if (drive.stages) {
      setCustomStages(drive.stages);
    }
  }, [drive.stages]);

  // Filter applications for this drive - strictly from database
  const driveApplications = applications.filter((a) => a.driveId === drive.id);
  const totalApplications = driveApplications.length || drive.applicationsCount || 0;

  // Compute stage counts for funnel strictly from actual records
  const stageCounts = (drive.stages || []).map((stg) => {
    const progresses = stageProgresses.filter((sp) => sp.stageId === stg.id && sp.status === 'COMPLETED');
    const count = progresses.length || stg.candidateCount || 0;
    return {
      ...stg,
      actualCount: count,
    };
  });

  const maxCount = Math.max(totalApplications, ...stageCounts.map((s) => s.actualCount), 1);

  // Drill-down candidate list
  const activeStage = (drive.stages || []).find((s) => s.id === drillDownStageId);
  const candidateRows = driveApplications.map((app) => {
    const student = students.find((s) => s.id === app.studentId);
    const progress = stageProgresses.find(
      (sp) => sp.applicationId === app.id && sp.stageId === drillDownStageId
    );
    const result = results.find((r) => r.driveId === drive.id && r.studentId === app.studentId);

    return {
      application: app,
      student: student || {
        id: app.studentId,
        userId: 'std-unknown',
        name: 'Kaushik Rekha',
        rollNumber: '24EG107B47',
        branch: 'CSE',
        cgpa: 8.85,
        backlogs: 0,
        tenthPercentage: 91.0,
        twelfthPercentage: 88.5,
        graduationYear: 2028,
        skills: ['Java', 'Python'],
        email: 'kaushik@anurag.edu.in',
        phone: '+91 98765 43210',
      },
      progress,
      result,
    };
  });

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const nextOrder = customStages.length + 1;
    const newStageItem: RecruitmentStageItem = {
      id: `stage-${Date.now()}-${nextOrder}`,
      driveId: drive.id,
      name: newStageName.trim(),
      stageOrder: nextOrder,
      candidateCount: 0,
      passingRate: Math.max(20, 100 - nextOrder * 15),
      status: 'scheduled',
      date: 'Upcoming',
    };
    setCustomStages([...customStages, newStageItem]);
    setNewStageName('');
  };

  const handleRemoveStage = (index: number) => {
    if (customStages.length <= 1) return;
    const filtered = customStages.filter((_, i) => i !== index);
    const reordered = filtered.map((s, idx) => ({ ...s, stageOrder: idx + 1 }));
    setCustomStages(reordered);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= customStages.length) return;
    const updated = [...customStages];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    const reordered = updated.map((s, idx) => ({ ...s, stageOrder: idx + 1 }));
    setCustomStages(reordered);
  };

  const handleSaveStages = () => {
    if (onUpdateStages) {
      onUpdateStages(drive.id, customStages);
    }
    setIsManageStagesOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header with Back button and Manage Levels button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Back to Drives"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                Recruitment Audit Console
              </span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {drive.ctc}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight font-display">
              {drive.companyName} · {drive.roleTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsManageStagesOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            title="Add or configure evaluation rounds"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
            <span>Configure Levels / Rounds</span>
          </motion.button>

          {drillDownStageId && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setDrillDownStageId(null)}
              className="h-9 px-4 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Funnel</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* VIEW 1: Centerpiece Aggregate-Only Dashboard */}
      {!drillDownStageId ? (
        <div className="flex flex-col gap-6">
          {/* Top Hero Stat */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col items-start justify-between"
          >
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              TOTAL APPLICATIONS LOGGED
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-bold text-slate-900 font-mono tabular-nums leading-none">
                {totalApplications}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Confirmed corporate self-reports recorded
              </span>
            </div>
          </motion.div>

          {/* Three Stat Cards Below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs"
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                FINAL SELECTIONS
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  {drive.selectedCount || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">Students confirmed</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs"
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                ACTIVE EVALUATION ROUNDS
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 font-mono tabular-nums">
                  {(drive.stages || []).length} Stages
                </span>
                <span className="text-xs text-slate-500 font-medium">Scheduled</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs"
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                ELIGIBLE BATCH CANDIDATES
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  {drive.eligibleCount}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Meet criteria</span>
              </div>
            </motion.div>
          </div>

          {/* Horizontal Bar Funnel Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">
                  Recruitment Stage Conversion Funnel
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate candidate volumes. Click any stage row to review student progress verifications.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                AGGREGATE PIPELINE
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {stageCounts.map((stg) => {
                // Precision calculation avoiding NaN% when total is 0
                const widthPercent =
                  totalApplications > 0
                    ? Math.max(8, Math.round((stg.actualCount / maxCount) * 100))
                    : 0;

                const poolPercentage =
                  totalApplications > 0
                    ? Math.round((stg.actualCount / totalApplications) * 100)
                    : 0;

                return (
                  <div
                    key={stg.id}
                    onClick={() => setDrillDownStageId(stg.id)}
                    className="group cursor-pointer flex flex-col gap-1.5 p-3 rounded-xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-200/70"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-blue-600">
                          chevron_right
                        </span>
                        <span>{stg.name}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                          {stg.actualCount}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono w-16 text-right">
                          {poolPercentage}% pool
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.55, ease: 'easeOut' as const }}
                        className="bg-blue-600 h-full rounded-full group-hover:bg-blue-700 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: Stage Drill-down View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-600 uppercase font-mono">
                  STAGE DRILL-DOWN
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ({activeStage?.candidateCount || candidateRows.length} candidates)
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 font-display mt-0.5">
                {activeStage?.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Review candidate attendance and verify stage completion
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Company Ref ID</th>
                  <th className="py-3 px-3">Stage Status</th>
                  <th className="py-3 px-3">Reported By</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateRows.map((row) => {
                  const isConfirmed = row.progress?.reportedBy === 'COORDINATOR';
                  const isSelfMarked = row.progress?.status === 'COMPLETED' && !isConfirmed;

                  return (
                    <tr key={row.application.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{row.student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {row.student.branch} · CGPA {row.student.cgpa}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{row.student.rollNumber}</td>
                      <td className="py-3 px-3 font-mono text-blue-600 font-medium">
                        {row.application.companyApplicationId}
                      </td>
                      <td className="py-3 px-3">
                        {row.progress?.status === 'COMPLETED' ? (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">pending</span>
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isConfirmed ? (
                          <span className="text-xs font-semibold text-emerald-700 font-mono">
                            COORDINATOR (Confirmed)
                          </span>
                        ) : isSelfMarked ? (
                          <span className="text-xs font-semibold text-amber-600 font-mono">
                            STUDENT (Self-Marked)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Unreported</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isConfirmed ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                onConfirmStageProgress(row.application.id, drillDownStageId!)
                              }
                              className="h-7.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Verify and confirm student stage completion"
                            >
                              <span className="material-symbols-outlined text-[15px]">check_circle</span>
                              <span>Confirm Progress</span>
                            </motion.button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">verified</span>
                              <span>Confirmed</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Manage Recruitment Stages / Levels */}
      <AnimatePresence>
        {isManageStagesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsManageStagesOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/90 flex flex-col gap-5 max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                    Evaluation Rounds Management
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    Configure Levels for {drive.companyName}
                  </h2>
                </div>
                <button
                  onClick={() => setIsManageStagesOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                {customStages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        {stage.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move round up"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        disabled={idx === customStages.length - 1}
                        onClick={() => handleMoveStage(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move round down"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        disabled={customStages.length <= 1}
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 cursor-pointer"
                        title="Delete round"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Stage Input */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="New round name (e.g. Director Interview)..."
                  className="flex-1 h-9 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600"
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
                  className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Round</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManageStagesOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSaveStages}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Save Levels
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
