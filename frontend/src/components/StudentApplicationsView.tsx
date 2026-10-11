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
  onSelfMarkStage: (applicationId: string, stageId: string) => void;
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

  const drivesMap = new Map();
  companies.forEach((c) => {
    c.drives.forEach((d) => drivesMap.set(d.id, d));
  });

  const selectedApplication = applications.find((a) => a.id === selectedAppId) || applications[0];
  const selectedDrive = selectedApplication ? drivesMap.get(selectedApplication.driveId) : null;

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
                  const progress = stageProgresses.find(
                    (sp) => sp.applicationId === selectedApplication.id && sp.stageId === stage.id
                  );

                  const isCompleted = progress?.status === 'COMPLETED';
                  const isVerifiedByCoordinator = progress?.reportedBy === 'COORDINATOR';
                  const isSelfMarked = isCompleted && progress?.reportedBy === 'STUDENT';

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
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                                Stage {stage.stageOrder}
                              </span>
                              {isVerifiedByCoordinator && (
                                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[13px]">verified</span>
                                  <span>Confirmed</span>
                                </span>
                              )}
                              {isSelfMarked && (
                                <span className="text-[11px] font-semibold text-amber-600">
                                  Self-Reported
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5 font-display">
                              {stage.name}
                            </h4>
                          </div>

                          {/* Self-Mark Button */}
                          {!isCompleted && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onSelfMarkStage(selectedApplication.id, stage.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Self-mark as attended/cleared"
                            >
                              <span className="material-symbols-outlined text-[15px]">check_circle</span>
                              <span>Mark Attended</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Stage Schedule & Link info */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
