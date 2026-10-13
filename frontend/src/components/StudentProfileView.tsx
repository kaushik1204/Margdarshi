import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../types/placement';
import { getYearOfStudy } from '../utils/academicYear';

interface StudentProfileViewProps {
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => void;
  onNavigateToDrives: () => void;
}

const getSafeSkills = (s?: any): string[] => {
  if (!s) return ['Java', 'Python', 'React', 'Spring Boot'];
  if (Array.isArray(s.skills)) return s.skills;
  if (typeof s.skills === 'string') return s.skills.split(',').map((x: string) => x.trim()).filter(Boolean);
  return ['Java', 'Python', 'React', 'Spring Boot'];
};

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onUpdateStudent,
  onNavigateToDrives,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(() => ({
    ...student,
    skills: getSafeSkills(student),
    tenthPercentage: student?.tenthPercentage ?? 85.0,
    twelfthPercentage: student?.twelfthPercentage ?? 85.0,
    graduationYear: student?.graduationYear ?? 2026,
    resumePath: student?.resumePath || `resumes/${student?.rollNumber || 'student'}_Resume.pdf`,
  }));

  const [newSkill, setNewSkill] = useState('');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState<string>(
    student?.resumePath?.split('/').pop() || '24EG107B47_resume.pdf'
  );

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        skills: getSafeSkills(student),
        tenthPercentage: student.tenthPercentage ?? 85.0,
        twelfthPercentage: student.twelfthPercentage ?? 85.0,
        graduationYear: student.graduationYear ?? 2026,
        resumePath: student.resumePath || `resumes/${student.rollNumber || 'student'}_Resume.pdf`,
      });
      if (student.resumePath) {
        setUploadedResumeName(student.resumePath.split('/').pop() || student.resumePath);
      }
    }
  }, [student]);

  const branches = ['CSE', 'IT', 'ECE', 'AIML', 'Electrical', 'Mechanical', 'Civil'];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSkills = formData.skills || [];
    if (!newSkill.trim() || currentSkills.includes(newSkill.trim())) return;
    setFormData({
      ...formData,
      skills: [...currentSkills, newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = formData.skills || [];
    setFormData({
      ...formData,
      skills: currentSkills.filter((s) => s !== skill),
    });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const generatedPath = `resumes/${formData.rollNumber}_${Date.now()}.pdf`;
      setUploadedResumeName(file.name);
      setFormData({
        ...formData,
        resumePath: generatedPath,
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateStudent(formData);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Student Academic Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Single institutional record used for real-time eligibility evaluation across all corporate drives.
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToDrives}
          className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">travel_explore</span>
          <span>View Matching Drives</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {saveFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>Profile successfully updated! Live drive eligibility calculations recomputed instantly.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100 font-display">
              Academic & Personal Dossier
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">University Roll Number *</label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Engineering Discipline *</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 outline-none focus:bg-white cursor-pointer font-medium"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Cumulative CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Active Backlogs *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">10th Board Marks (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.tenthPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, tenthPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">12th Board Marks (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.twelfthPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, twelfthPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Graduation Class</label>
                  <span className="text-[10px] text-blue-700 font-semibold font-mono">
                    {getYearOfStudy(formData.graduationYear)}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) =>
                    setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) || 2028 })
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Contact</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 font-mono border border-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Official Curriculum Vitae (PDF)
              </label>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">picture_as_pdf</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block font-mono">
                      {uploadedResumeName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Stored in secure university document locker
                    </span>
                  </div>
                </div>
                <label className="h-8.5 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs">
                  <span>Replace Document</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Competencies & Technical Proficiencies
              </label>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. PyTorch, Distributed Systems, Docker)..."
                  className="flex-1 h-9 px-3.5 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 outline-none focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddSkill}
                  className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
                >
                  Add Skill
                </motion.button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <motion.button
                whileHover={!isSaving ? { scale: 1.02 } : {}}
                whileTap={!isSaving ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save Academic Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Eligibility Explainer Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
              <span>Eligibility Evaluation Rules</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every drive performs an immediate live check against your current profile parameters. Adjusting your CGPA or backlogs dynamically updates qualification status across all corporate drives.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex flex-col gap-2">
              <span className="font-semibold text-slate-800">Rule Parameters Evaluated:</span>
              <span className="text-slate-600">· Degree CGPA ≥ Company Cutoff</span>
              <span className="text-slate-600">· Engineering Major in Approved Branches</span>
              <span className="text-slate-600">· Active Standing Backlogs ≤ Limit</span>
              <span className="text-slate-600">· Class 10 & 12 Board Percentage Cutoffs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
