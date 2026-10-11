import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole, AuthUser, StudentProfile } from '../types/placement';
import { api, ApiError } from '../api/client';

export type AuthMode = 'STUDENT_SIGN_IN' | 'COORDINATOR_SIGN_IN' | 'STUDENT_REGISTER';

interface AuthViewProps {
  initialMode: AuthMode;
  onLoginSuccess: (user: AuthUser, studentProfile?: StudentProfile) => void;
  onBackToGateway: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode,
  onLoginSuccess,
  onBackToGateway,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sign In inputs (empty by default so user must enter password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student Registration inputs (placeholders used instead of pre-filled numbers)
  const [regName, setRegName] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regBranch, setRegBranch] = useState('CSE');
  const [regCgpa, setRegCgpa] = useState('');
  const [regBacklogs, setRegBacklogs] = useState('');
  const [regTenthPct, setRegTenthPct] = useState('');
  const [regTwelfthPct, setRegTwelfthPct] = useState('');
  const [regResumeName, setRegResumeName] = useState('');

  // Loading & Error feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.auth.signIn(cleanEmail, cleanPassword);

      // Verify intended role alignment
      if (mode === 'COORDINATOR_SIGN_IN' && response.user.role !== 'COORDINATOR') {
        setErrorMsg('This account is registered as a student. Please use the Student Sign In page.');
        api.auth.signOut();
        setIsSubmitting(false);
        return;
      }

      if (mode === 'STUDENT_SIGN_IN' && response.user.role !== 'STUDENT') {
        setErrorMsg('This account is a coordinator. Please use the Coordinator Sign In page.');
        api.auth.signOut();
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(response.user, response.student);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegResumeName(file.name);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = regName.trim();
    const rollNo = regRollNumber.trim().toUpperCase();
    const studentEmail = regEmail.trim().toLowerCase();
    const pwd = regPassword.trim();

    if (!name || !rollNo || !studentEmail || !pwd) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    // Client-side format check for Anurag University format (e.g. 24EG107B47)
    const rollRegex = /^([0-9]{2}EG[0-9]{3}[A-Z][0-9]{2}|[0-9]{2}EG[0-9A-Z]{2}[0-9]{4})$/i;
    if (!rollRegex.test(rollNo)) {
      setErrorMsg('Roll number must follow Anurag University format (e.g., 24EG107B47).');
      return;
    }

    if (!studentEmail.endsWith('@anurag.edu.in')) {
      setErrorMsg('Registration requires an official @anurag.edu.in institutional email.');
      return;
    }

    if (pwd.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalResume = regResumeName ? `resumes/${rollNo}_${regResumeName}` : `resumes/${rollNo}_Resume.pdf`;

      const response = await api.auth.register({
        email: studentEmail,
        password: pwd,
        name,
        rollNumber: rollNo,
        branch: regBranch,
        cgpa: parseFloat(regCgpa) || 8.0,
        backlogs: parseInt(regBacklogs, 10) || 0,
        tenthPercentage: parseFloat(regTenthPct) || 85.0,
        twelfthPercentage: parseFloat(regTwelfthPct) || 85.0,
        graduationYear: 2026,
        resumePath: finalResume,
      });

      onLoginSuccess(response.user, response.student);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(err?.message || 'Student registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4 selection:bg-amber-100 selection:text-amber-900 relative">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-lg shadow-sm p-6 sm:p-8"
      >
        {/* Top brand header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <button
            onClick={onBackToGateway}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Portal</span>
          </button>
          <span className="text-xs font-mono text-slate-500 font-medium">Anurag University</span>
        </div>

        {/* Portal Wordmark */}
        <div className="text-center mb-6">
          <div className="inline-flex w-10 h-10 rounded-lg bg-slate-900 items-center justify-center text-amber-400 mb-2 border border-slate-800">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-950 font-display tracking-tight">Margdarshi</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {mode === 'COORDINATOR_SIGN_IN' && 'Placement Cell Coordinator Sign In'}
            {mode === 'STUDENT_SIGN_IN' && 'Official Student Sign In'}
            {mode === 'STUDENT_REGISTER' && 'Student Self-Registration'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        {mode !== 'STUDENT_REGISTER' && (
          <div className="flex bg-slate-100 p-1 rounded-md mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('STUDENT_SIGN_IN');
                setEmail('');
                setPassword('');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                mode === 'STUDENT_SIGN_IN'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                setMode('COORDINATOR_SIGN_IN');
                setEmail('');
                setPassword('');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                mode === 'COORDINATOR_SIGN_IN'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Coordinator
            </button>
          </div>
        )}

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* ================= SIGN IN FORM ================= */}
        {mode !== 'STUDENT_REGISTER' ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'COORDINATOR_SIGN_IN'
                    ? 'coordinator@anurag.edu.in'
                    : 'username@anurag.edu.in'
                }
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {mode === 'COORDINATOR_SIGN_IN' ? 'Coordinator' : 'Student'}</span>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                </>
              )}
            </button>

            {mode === 'STUDENT_SIGN_IN' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('STUDENT_REGISTER');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-950 font-medium cursor-pointer"
                >
                  New student?{' '}
                  <span className="text-amber-800 font-semibold underline underline-offset-2">
                    Register your account here
                  </span>
                </button>
              </div>
            )}
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Kaushik Rekha"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={regRollNumber}
                  onChange={(e) => setRegRollNumber(e.target.value)}
                  placeholder="24EG107B47"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="AIML">AIML</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email (@anurag.edu.in)
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="yourname@anurag.edu.in"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs px-3 py-2 pr-10 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showRegPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Student Resume / CV (PDF) *
                </label>
                <span className="text-[10px] text-slate-400">PDF document</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-rose-500 text-[20px] shrink-0">
                    picture_as_pdf
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-mono font-medium text-slate-800 block truncate">
                      {regResumeName || (regRollNumber ? `${regRollNumber}_Resume.pdf` : 'Select official Resume (PDF)...')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {regResumeName ? 'Document chosen' : 'Click browse to upload your official PDF'}
                    </span>
                  </div>
                </div>
                <label className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded cursor-pointer transition-colors shadow-2xs">
                  <span>Browse</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleRegResumeChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={regCgpa}
                  onChange={(e) => setRegCgpa(e.target.value)}
                  placeholder="8.50"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={regBacklogs}
                  onChange={(e) => setRegBacklogs(e.target.value)}
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">10th %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={regTenthPct}
                  onChange={(e) => setRegTenthPct(e.target.value)}
                  placeholder="88.0"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">12th / Inter %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={regTwelfthPct}
                  onChange={(e) => setRegTwelfthPct(e.target.value)}
                  placeholder="86.0"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Student Registration</span>
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('STUDENT_SIGN_IN');
                  setErrorMsg(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-950 font-medium cursor-pointer"
              >
                Already registered?{' '}
                <span className="text-amber-800 font-semibold underline underline-offset-2">
                  Sign In instead
                </span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
