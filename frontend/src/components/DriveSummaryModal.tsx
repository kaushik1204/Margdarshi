import React from 'react';
import { motion } from 'motion/react';
import { PlacementDrive, StudentProfile } from '../types/placement';

interface DriveSummaryModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  student?: StudentProfile;
}

export const DriveSummaryModal: React.FC<DriveSummaryModalProps> = ({
  drive,
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen || !drive) return null;

  const mockOfferedStudents = [
    {
      name: student?.name || 'Kaushik Rekha',
      roll: student?.rollNumber || '24EG107B47',
      branch: student?.branch || 'CSE',
      cgpa: student?.cgpa ?? 8.85,
      status: 'Offer Letter Signed',
    },
    { name: 'Ananya Deshmukh', roll: '21AG1A7302', branch: 'AIML', cgpa: 8.92, status: 'Offer Letter Signed' },
    { name: 'Karan Singhal', roll: '21AG1A0542', branch: 'CSE', cgpa: 8.74, status: 'Offer Letter Signed' },
    { name: 'Pooja Reddy', roll: '21AG1A0210', branch: 'ECE', cgpa: 8.65, status: 'Offer Letter Signed' },
  ];

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
        className="relative z-10 bg-white rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-5 shadow-2xl border border-slate-200/90 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Completed Recruitment Cycle Audit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
              {drive.companyName} · {drive.roleTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Final Selected</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5 font-mono tabular-nums">{drive.selectedCount || 1} Selected</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Compensation</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{drive.ctc}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Audit Status</span>
            <p className="text-xl font-bold text-blue-600 mt-0.5">Verified</p>
          </div>
        </div>

        {/* Selected Candidates Ledger */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Placed University Candidates
          </span>
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Candidate</th>
                  <th className="py-2.5 px-3.5">Roll No</th>
                  <th className="py-2.5 px-3.5">Branch</th>
                  <th className="py-2.5 px-3.5">CGPA</th>
                  <th className="py-2.5 px-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockOfferedStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">{s.roll}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">{s.branch}</td>
                    <td className="py-2.5 px-3.5 font-mono font-medium text-slate-900">{s.cgpa}</td>
                    <td className="py-2.5 px-3.5 text-right">
                      <span className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>{s.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
          >
            Close Report
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
