import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlacementDrive, DriveCandidate } from '../types/placement';
import { api } from '../api/client';

interface FunnelDashboardModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceCandidate?: (driveId: string, candidateId: string) => void;
}

export const FunnelDashboardModal: React.FC<FunnelDashboardModalProps> = ({
  drive,
  isOpen,
  onClose,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateList, setCandidateList] = useState<DriveCandidate[]>([]);

  React.useEffect(() => {
    if (drive && isOpen) {
      let isMounted = true;
      api.applications.getAll({ driveId: drive.id })
        .then((apps: any[]) => {
          if (!isMounted) return;
          const candidates: DriveCandidate[] = apps.map((app) => {
            const activeStage = app.stageProgress && app.stageProgress.length > 0
              ? app.stageProgress[app.stageProgress.length - 1].stage?.id || app.stageProgress[app.stageProgress.length - 1].stageId
              : (drive.stages[0]?.id || 'stage-1');
            return {
              id: app.id,
              name: app.studentName || 'Applicant Candidate',
              rollNo: app.studentRoll || '24EG107B47',
              branch: 'CSE',
              cgpa: 8.5,
              stageId: activeStage,
              status: 'pending',
              email: `${app.studentId || 'candidate'}@anurag.edu.in`,
            };
          });
          setCandidateList(candidates);
        })
        .catch(() => {
          if (isMounted) setCandidateList([]);
        });
      setSelectedStageId('all');
      setSearchQuery('');
      return () => { isMounted = false; };
    }
  }, [drive, isOpen]);

  if (!isOpen || !drive) return null;

  const handleAdvance = (candId: string) => {
    setCandidateList((prev) =>
      prev.map((c) => {
        if (c.id === candId) {
          const currentStageIdx = drive.stages.findIndex((s) => s.id === c.stageId);
          if (currentStageIdx < drive.stages.length - 1) {
            const nextStage = drive.stages[currentStageIdx + 1];
            return {
              ...c,
              stageId: nextStage.id,
              status: nextStage.id === drive.stages[drive.stages.length - 1].id ? 'selected' : 'cleared',
            };
          }
        }
        return c;
      })
    );
  };

  const handleExportCsv = () => {
    const headers = ['Roll No', 'Name', 'Branch', 'CGPA', 'Score', 'Current Stage', 'Status', 'Email'];
    const rows = filteredCandidates.map((c) => {
      const stageName = drive.stages.find((s) => s.id === c.stageId)?.name || c.stageId;
      return [c.rollNo, c.name, c.branch, c.cgpa, c.score || '-', stageName, c.status, c.email].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${drive.companyName}_${drive.roleTitle}_candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidateList.filter((c) => {
    const matchesStage = selectedStageId === 'all' || c.stageId === selectedStageId;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                Funnel Conversion Pipeline
              </span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {drive.ctc}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-7 font-display">
              {drive.companyName} · {drive.roleTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCsv}
              className="h-8.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">download</span>
              <span>Export CSV</span>
            </motion.button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Funnel Metrics Bar */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overall Recruitment Conversion Funnel</span>
            <span className="font-semibold text-emerald-700 font-mono">
              Final Selected: {drive.selectedCount || 1} Students
            </span>
          </div>

          {/* Stepped Conversion Visual */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {drive.stages.map((stg, i) => {
              const count = stg.candidateCount || 20;
              const isSelected = selectedStageId === stg.id;
              return (
                <div
                  key={stg.id}
                  onClick={() => setSelectedStageId(isSelected ? 'all' : stg.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 font-mono uppercase">
                      Round 0{i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                      {count}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {stg.name}
                  </span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(15, 100 - i * 18)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate List & Filters */}
        <div className="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter candidates by name, roll no..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Stage Filter:</span>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Stages ({candidateList.length})</option>
                {drive.stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Candidate</th>
                  <th className="py-2.5 px-4">Roll No</th>
                  <th className="py-2.5 px-4">Branch</th>
                  <th className="py-2.5 px-4">CGPA</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {cand.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{cand.rollNo}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{cand.branch}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{cand.cgpa.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Active Round</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAdvance(cand.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        Advance Round
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
