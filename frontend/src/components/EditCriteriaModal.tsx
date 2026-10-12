import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlacementDrive, EligibilityCriteria, StudentProfile } from '../types/placement';
import { api } from '../api/client';
import { EligibilityService } from '../services/eligibilityService';

interface EditCriteriaModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCriteria: (driveId: string, updatedCriteria: EligibilityCriteria, eligibleCount: number) => void;
  students?: StudentProfile[];
}

export const EditCriteriaModal: React.FC<EditCriteriaModalProps> = ({
  drive,
  isOpen,
  onClose,
  onSaveCriteria,
  students,
}) => {
  const [studentList, setStudentList] = useState<StudentProfile[]>(students || []);
  const [minCgpa, setMinCgpa] = useState<number>(drive?.criteria.minCgpa || 7.5);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    drive?.criteria.allowedBranches || ['CSE', 'IT', 'ECE']
  );
  const [maxBacklogs, setMaxBacklogs] = useState<number>(drive?.criteria.maxBacklogs || 0);
  const [min10th, setMin10th] = useState<number>(drive?.criteria.min10thPercentage || 75);
  const [min12th, setMin12th] = useState<number>(drive?.criteria.min12thPercentage || 75);
  const [graduationYear, setGraduationYear] = useState<number>(drive?.criteria.graduationYear || 2026);

  useEffect(() => {
    if (students && students.length > 0) {
      setStudentList(students);
    } else if (isOpen) {
      api.students.getAll().then(setStudentList).catch(() => setStudentList([]));
    }
  }, [students, isOpen]);

  useEffect(() => {
    if (drive) {
      setMinCgpa(drive.criteria.minCgpa);
      setSelectedBranches(drive.criteria.allowedBranches);
      setMaxBacklogs(drive.criteria.maxBacklogs);
      setMin10th(drive.criteria.min10thPercentage);
      setMin12th(drive.criteria.min12thPercentage);
      setGraduationYear(drive.criteria.graduationYear || 2026);
    }
  }, [drive]);

  if (!isOpen || !drive) return null;

  const allBranches = ['CSE', 'IT', 'ECE', 'AIML', 'Electrical', 'Mechanical', 'Civil'];

  const toggleBranch = (b: string) => {
    if (selectedBranches.includes(b)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter((item) => item !== b));
      }
    } else {
      setSelectedBranches([...selectedBranches, b]);
    }
  };

  const estimatedEligible = studentList.filter((st) =>
    EligibilityService.evaluate(st, {
      minCgpa,
      allowedBranches: selectedBranches,
      maxBacklogs,
      min10thPercentage: min10th,
      min12thPercentage: min12th,
      graduationYear,
    }).isEligible
  ).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCriteria(
      drive.id,
      {
        minCgpa,
        allowedBranches: selectedBranches,
        maxBacklogs,
        min10thPercentage: min10th,
        min12thPercentage: min12th,
        graduationYear,
      },
      estimatedEligible
    );
    onClose();
  };

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
        className="relative z-10 bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/90 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
              Live Evaluation Cutoffs
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-display">
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

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Live Impact Preview */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-blue-900">
                Live Re-evaluation Impact
              </span>
              <span className="text-xs text-blue-700">
                Qualifying candidates across batch
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
              {estimatedEligible} Students
            </span>
          </div>

          {/* Eligible Student Year / Graduation Batch */}
          <div className="flex flex-col gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">school</span>
                <span>Target Student Year / Batch</span>
              </label>
              <span className="text-[10px] text-blue-700 font-medium font-mono">
                {graduationYear > 0 ? `${graduationYear} Cohort` : 'All Batches'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 2026, title: '2026 Batch', desc: '4th / Final' },
                { value: 2027, title: '2027 Batch', desc: '3rd / Pre-Final' },
                { value: 2028, title: '2028 Batch', desc: '2nd Year' },
                { value: 2029, title: '2029 Batch', desc: '1st Year' },
                { value: 0, title: 'All Years', desc: 'Open to All' },
              ].map((opt) => {
                const isSelected = graduationYear === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGraduationYear(opt.value)}
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
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Minimum CGPA *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={minCgpa}
                onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Max Backlogs Allowed</label>
              <input
                type="number"
                min="0"
                max="5"
                required
                value={maxBacklogs}
                onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10) || 0)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">10th Percentage Cutoff</label>
              <input
                type="number"
                min="0"
                max="100"
                value={min10th}
                onChange={(e) => setMin10th(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">12th Percentage Cutoff</label>
              <input
                type="number"
                min="0"
                max="100"
                value={min12th}
                onChange={(e) => setMin12th(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Permitted Branches */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Permitted Disciplines</label>
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

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
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
              Save & Recalculate
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
