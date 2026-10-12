import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Company,
  StudentProfile,
  ApplicationRecord,
  StageProgressRecord,
  PlacementResultRecord,
} from '../types/placement';

interface StudentApplicationsViewProps {
  companies: Company[];
  student: StudentProfile;
  applications: ApplicationRecord[];
  stageProgresses: StageProgressRecord[];
  results: PlacementResultRecord[];
  onSelfMarkStage: (
    applicationId: string,
    stageId: string,
    details?: {
      roundOutcome?: 'CLEARED' | 'AWAITING_RESULT' | 'NOT_CLEARED';
      difficultyRating?: 'Easy' | 'Moderate' | 'Challenging' | 'Hard';
      experienceNotes?: string;
      confidenceRating?: number;
    }
  ) => void;
  onNavigateToDrives: () => void;
}

export const StudentApplicationsView: React.FC<StudentApplicationsViewProps> = ({
  companies,
  student,
  applications,
  stageProgresses,
  results,
  onSelfMarkStage,
  onNavigateToDrives,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications[0]?.id || ''
  );

  // Attendance & Feedback Modal State
  const [attendedModalStage, setAttendedModalStage] = useState<{
    applicationId: string;
    stage: any;
  } | null>(null);

  const [roundOutcome, setRoundOutcome] = useState<'CLEARED' | 'AWAITING_RESULT' | 'NOT_CLEARED'>('CLEARED');
  const [difficultyRating, setDifficultyRating] = useState<'Easy' | 'Moderate' | 'Challenging' | 'Hard'>('Moderate');
  const [experienceNotes, setExperienceNotes] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(4);

  const drivesMap = new Map();
  companies.forEach((c) => {
    c.drives.forEach((d) => drivesMap.set(d.id, d));
  });

  const selectedApplication = applications.find((a) => a.id === selectedAppId) || applications[0];
  const selectedDrive = selectedApplication ? drivesMap.get(selectedApplication.driveId) : null;

  const handleOpenAttendanceModal = (stage: any) => {
    let cached: any = null;
    try {
      const raw = localStorage.getItem(`stage_feedback_${selectedApplication.id}_${stage.id}`);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    setRoundOutcome(cached?.roundOutcome || 'CLEARED');
    setDifficultyRating(cached?.difficultyRating || 'Moderate');
    setExperienceNotes(cached?.experienceNotes || '');
    setConfidenceScore(cached?.confidenceRating || 4);

    setAttendedModalStage({
      applicationId: selectedApplication.id,
      stage,
    });
  };

  const handleSaveAttendanceFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendedModalStage) return;

    onSelfMarkStage(attendedModalStage.applicationId, attendedModalStage.stage.id, {
      roundOutcome,
      difficultyRating,
      experienceNotes: experienceNotes.trim(),
      confidenceRating: confidenceScore,
    });

    setAttendedModalStage(null);
  };

  const getStageDetails = (stageId: string) => {
    const progress = stageProgresses.find(
      (sp) => sp.applicationId === selectedApplication.id && sp.stageId === stageId
    );
    let cached: any = null;
    try {
      const raw = localStorage.getItem(`stage_feedback_${selectedApplication.id}_${stageId}`);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    const isCompleted = progress?.status === 'COMPLETED';
    const outcome = cached?.roundOutcome || progress?.roundOutcome || (isCompleted ? 'CLEARED' : null);
    const difficulty = cached?.difficultyRating || progress?.difficultyRating;
    const notes = cached?.experienceNotes || progress?.experienceNotes;
    const confidence = cached?.confidenceRating || progress?.confidenceRating;

    return {
      progress,
      isCompleted,
      outcome,
      difficulty,
      notes,
      confidence,
    };
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            My Applications & Progress
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track interview timelines, self-report attended rounds, and review verified coordinator sign-offs.
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToDrives}
          className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">add_circle</span>
          <span>Explore More Drives</span>
        </motion.button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center flex flex-col items-center gap-3.5 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
          </div>
          <p className="text-base font-bold text-slate-900 font-display">No applications submitted yet</p>
          <p className="text-xs text-slate-500 max-w-md">
            Review active corporate recruitment drives matching your academic criteria and self-report your application ID.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToDrives}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            Browse Eligible Drives
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Applications List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Submitted Applications ({applications.length})
            </span>

            <div className="flex flex-col gap-2.5">
              {applications.map((app) => {
                const drive = drivesMap.get(app.driveId);
                const isSelected = app.id === selectedAppId;
                const result = results.find((r) => r.driveId === app.driveId);

                return (
                  <motion.button
                    key={app.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono block">
                          {drive?.companyName || 'Corporate Partner'}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug mt-0.5 font-display">
                          {drive?.roleTitle}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-blue-700 font-mono tabular-nums shrink-0">
                        {drive?.ctc}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="font-mono text-slate-500 text-[11px]">
                        Ref: {app.companyApplicationId}
                      </span>

                      {result ? (
                        <span
                          className={`font-semibold text-xs ${
                            result.result === 'SELECTED'
                              ? 'text-emerald-700'
                              : 'text-red-600'
                          }`}
                        >
                          {result.result} ({result.ctcPackage || result.package})
                        </span>
                      ) : (
                        <span className="text-blue-600 font-medium flex items-center gap-1.5 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span>Active Timeline</span>
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ordered Stage Timeline */}
          {selectedDrive && selectedApplication && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-6">
              {/* Timeline Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                    Official Stage Timeline
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {selectedDrive.companyName} · {selectedDrive.roleTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Reference: <strong className="font-mono text-slate-800">{selectedApplication.companyApplicationId}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Applied on {new Date(selectedApplication.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-600 font-mono">
                    {selectedDrive.jobType}
                  </span>
                </div>
              </div>

              {/* Stage Progress Legend */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center gap-4 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Verified by Coordinator</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Self-Reported (Pending Verification)</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Upcoming Round</span>
                </span>
              </div>

              {/* Vertical Stage Timeline */}
              <div className="relative flex flex-col gap-6 pl-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {selectedDrive.stages.map((stage: any, idx: number) => {
                  const details = getStageDetails(stage.id);
                  const isCompleted = details.isCompleted;
                  const isVerifiedByCoordinator = details.progress?.reportedBy === 'COORDINATOR';
                  const isSelfMarked = isCompleted && details.progress?.reportedBy === 'STUDENT';

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="relative flex items-start gap-4"
                    >
                      {/* Timeline Icon Node */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-all shadow-2xs ${
                          isVerifiedByCoordinator
                            ? 'border-emerald-600 text-emerald-600'
                            : isSelfMarked
                            ? 'border-amber-500 text-amber-500'
                            : 'border-slate-300 text-slate-300'
                        }`}
                      >
                        {isVerifiedByCoordinator ? (
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        ) : isSelfMarked ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        ) : (
                          <span className="text-[10px] font-mono font-medium">{idx + 1}</span>
                        )}
                      </div>

                      {/* Timeline Item Details */}
                      <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col gap-2 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                                Stage {stage.stageOrder}
                              </span>
                              {isVerifiedByCoordinator && (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[13px]">verified</span>
                                  <span>Verified by Coordinator</span>
                                </span>
                              )}
                              {isSelfMarked && (
                                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">person_check</span>
                                  <span>Self-Reported</span>
                                </span>
                              )}

                              {/* Student-reported outcome badge */}
                              {isCompleted && details.outcome === 'CLEARED' && (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  <span>Cleared Round</span>
                                </span>
                              )}
                              {isCompleted && details.outcome === 'AWAITING_RESULT' && (
                                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                                  <span>Awaiting Result</span>
                                </span>
                              )}
                              {isCompleted && details.outcome === 'NOT_CLEARED' && (
                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">cancel</span>
                                  <span>Did Not Clear</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5 font-display">
                              {stage.name}
                            </h4>
                          </div>

                          {/* Self-Mark / Edit Feedback Action */}
                          {!isCompleted ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleOpenAttendanceModal(stage)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Report round attendance, outcome, and experience"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Mark Attended</span>
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleOpenAttendanceModal(stage)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title="Update outcome or feedback notes"
                            >
                              <span className="material-symbols-outlined text-[14px] text-blue-600">edit_note</span>
                              <span>Edit Feedback</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Stage Schedule & Link info */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                          {stage.date && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">event</span>
                              <span>{stage.date}</span>
                            </span>
                          )}
                          {stage.platform && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">devices</span>
                              <span>{stage.platform}</span>
                            </span>
                          )}
                          {stage.link && (
                            <a
                              href={stage.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              <span>Assessment Link</span>
                            </a>
                          )}
                        </div>

                        {/* Experience Notes & Review Snippet */}
                        {isCompleted && (details.notes || details.difficulty || details.confidence) && (
                          <div className="mt-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
                              <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-blue-600">reviews</span>
                                <span>Candidate Round Review</span>
                              </span>
                              <div className="flex items-center gap-2">
                                {details.difficulty && (
                                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                                    Difficulty: <strong>{details.difficulty}</strong>
                                  </span>
                                )}
                                {details.confidence && (
                                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-amber-600 font-semibold">
                                    ★ {details.confidence}/5
                                  </span>
                                )}
                              </div>
                            </div>
                            {details.notes && (
                              <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">
                                "{details.notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance, Outcome & Round Experience Modal */}
      <AnimatePresence>
        {attendedModalStage && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                      Stage {attendedModalStage.stage.stageOrder} Self-Report
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {attendedModalStage.stage.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDrive?.companyName} · {selectedDrive?.roleTitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttendedModalStage(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveAttendanceFeedback} className="flex flex-col gap-4">
                {/* 1. Round Outcome / Result */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">flag</span>
                    <span>What was the result of this round? *</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select your current status or outcome for this stage.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    {[
                      {
                        value: 'CLEARED' as const,
                        label: 'Cleared / Passed',
                        desc: 'Shortlisted for next round',
                        icon: 'check_circle',
                        activeColor: 'bg-emerald-50 border-emerald-500 text-emerald-800',
                      },
                      {
                        value: 'AWAITING_RESULT' as const,
                        label: 'Awaiting Results',
                        desc: 'Attended, results pending',
                        icon: 'hourglass_top',
                        activeColor: 'bg-blue-50 border-blue-500 text-blue-800',
                      },
                      {
                        value: 'NOT_CLEARED' as const,
                        label: 'Did Not Clear',
                        desc: 'Attempted, did not qualify',
                        icon: 'cancel',
                        activeColor: 'bg-rose-50 border-rose-500 text-rose-800',
                      },
                    ].map((opt) => {
                      const isSelected = roundOutcome === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setRoundOutcome(opt.value)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1 select-none ${
                            isSelected
                              ? `${opt.activeColor} shadow-2xs`
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{opt.label}</span>
                            <span className="material-symbols-outlined text-[18px]">
                              {opt.icon}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-80 leading-tight">
                            {opt.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Round Difficulty */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">speed</span>
                    <span>How difficult was this round?</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {(['Easy', 'Moderate', 'Challenging', 'Hard'] as const).map((diff) => {
                      const isSelected = difficultyRating === diff;
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficultyRating(diff)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {diff}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Self Performance Confidence Rating */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Performance Confidence Rating
                    </label>
                    <span className="text-[11px] text-slate-500">How satisfied are you with your performance?</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setConfidenceScore(star)}
                        className={`text-xl transition-transform hover:scale-110 cursor-pointer ${
                          star <= confidenceScore ? 'text-amber-400' : 'text-slate-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Experience & How Was It? */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">edit_note</span>
                      <span>How was it? Share questions & insights *</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Visible to you & coordinator</span>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-400">Quick Topics:</span>
                    {[
                      'DSA / Coding Problems',
                      'Java / Spring Boot',
                      'SQL & DBMS Queries',
                      'System Architecture',
                      'HR Situational',
                    ].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          const separator = experienceNotes ? ', ' : '';
                          setExperienceNotes(experienceNotes + separator + topic);
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        + {topic}
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    rows={3}
                    value={experienceNotes}
                    onChange={(e) => setExperienceNotes(e.target.value)}
                    placeholder="Describe how the test/interview went. What specific questions or challenges were asked? Any key takeaways or advice for campus peers?"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAttendedModalStage(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Submit Attendance & Review</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
