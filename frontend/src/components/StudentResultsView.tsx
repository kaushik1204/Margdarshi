import React from 'react';
import { motion } from 'motion/react';
import { Company, PlacementResultRecord, ApplicationRecord } from '../types/placement';

interface StudentResultsViewProps {
  companies: Company[];
  applications: ApplicationRecord[];
  results: PlacementResultRecord[];
  onNavigateToDrives: () => void;
}

export const StudentResultsView: React.FC<StudentResultsViewProps> = ({
  companies,
  applications,
  results,
  onNavigateToDrives,
}) => {
  const drivesMap = new Map();
  companies.forEach((c) => {
    c.drives.forEach((d) => drivesMap.set(d.id, d));
  });

  const selectedOffers = results.filter((r) => r.result === 'SELECTED');

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Placement Results & Selection Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official recruitment outcomes verified and recorded by University Career Services.
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToDrives}
          className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">business_center</span>
          <span>Explore More Drives</span>
        </motion.button>
      </div>

      {/* Selections Stat Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            VERIFIED SELECTIONS
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 font-mono tabular-nums">
              {selectedOffers.length}
            </span>
            <span className="text-xs font-medium text-slate-500">Confirmed Selections</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            SELECTED CTC PACKAGE
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600 font-mono tabular-nums">
              {selectedOffers[0]?.ctcPackage || selectedOffers[0]?.package || '—'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {selectedOffers.length > 0 ? 'Confirmed CTC' : 'Awaiting Selection'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            APPLICATIONS LOGGED
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {applications.length}
            </span>
            <span className="text-xs font-medium text-slate-500">Active Pipelines</span>
          </div>
        </motion.div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col">
        <div className="p-5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Recruitment Outcomes Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited results verified with signed corporate documentation
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {results.length} Entries
          </span>
        </div>

        {results.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No finalized outcome posted yet. Interview pipelines remain actively evaluated.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.map((res) => {
              const drive = drivesMap.get(res.driveId);
              const app = applications.find((a) => a.driveId === res.driveId);

              return (
                <div
                  key={res.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        res.result === 'SELECTED'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {res.result === 'SELECTED' ? 'verified' : 'cancel'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-display">
                          {drive?.companyName}
                        </span>
                        <span className="text-xs text-slate-500">· {drive?.roleTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Application Ref: <strong className="font-mono text-slate-700">{app?.companyApplicationId || 'N/A'}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Recorded on {new Date(res.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          res.result === 'SELECTED'
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }`}
                      >
                        {res.result === 'SELECTED' ? 'Selected' : 'Rejected'}
                      </span>
                      <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                        CTC: {res.ctcPackage}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
