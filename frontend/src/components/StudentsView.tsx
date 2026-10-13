import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types/placement';
import { getShortYearOfStudy } from '../utils/academicYear';

interface StudentsViewProps {
  students: Student[];
  onOpenNewDrive?: () => void;
}

type SortField = 'cgpa-desc' | 'cgpa-asc' | 'name-asc' | 'roll-asc' | 'status' | 'offers-desc';
type BacklogFilter = 'all' | 'zero' | 'with-backlogs';

const ALL_BRANCHES = ['CSE', 'IT', 'ECE', 'AIML', 'Electrical', 'Mechanical', 'Civil'];
const ALL_STATUSES = ['Placed', 'In Process', 'Unplaced'] as const;

export const StudentsView: React.FC<StudentsViewProps> = ({ students }) => {
  // ----------------------------------------------------
  // FILTER STATES
  // ----------------------------------------------------
  const [search, setSearch] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [maxCgpa, setMaxCgpa] = useState<number>(10);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [backlogFilter, setBacklogFilter] = useState<BacklogFilter>('all');
  const [sortBy, setSortBy] = useState<SortField>('cgpa-desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // UI / Popover states
  const [activeDropdown, setActiveDropdown] = useState<'branch' | 'cgpa' | 'status' | 'sort' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // References for outside click dismissal
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ----------------------------------------------------
  // BRANCH COUNTS & HELPERS
  // ----------------------------------------------------
  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of ALL_BRANCHES) counts[b] = 0;
    for (const s of students) {
      if (counts[s.branch] !== undefined) counts[s.branch]++;
    }
    return counts;
  }, [students]);

  const statusCounts = useMemo(() => {
    return {
      Placed: students.filter((s) => s.placementStatus === 'Placed').length,
      'In Process': students.filter((s) => s.placementStatus === 'In Process').length,
      Unplaced: students.filter((s) => s.placementStatus === 'Unplaced').length,
    };
  }, [students]);

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesRoll = s.rollNo.toLowerCase().includes(query);
        const matchesEmail = s.email.toLowerCase().includes(query);
        const matchesBranch = s.branch.toLowerCase().includes(query);
        const matchesCompany = s.offers?.some((o) => o.companyName.toLowerCase().includes(query));
        const matchesSkills = s.skills?.some((sk) => sk.toLowerCase().includes(query));

        if (!matchesName && !matchesRoll && !matchesEmail && !matchesBranch && !matchesCompany && !matchesSkills) {
          return false;
        }
      }

      // 2. Branch Multi-Filter
      if (selectedBranches.length > 0) {
        if (!selectedBranches.includes(s.branch)) {
          return false;
        }
      }

      // 3. CGPA Range Multi-Filter
      if (s.cgpa < minCgpa || s.cgpa > maxCgpa) {
        return false;
      }

      // 4. Status Multi-Filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(s.placementStatus)) {
          return false;
        }
      }

      // 5. Backlog Filter
      if (backlogFilter === 'zero' && s.backlogs !== 0) {
        return false;
      }
      if (backlogFilter === 'with-backlogs' && s.backlogs === 0) {
        return false;
      }

      return true;
    });
  }, [students, search, selectedBranches, minCgpa, maxCgpa, selectedStatuses, backlogFilter]);

  // ----------------------------------------------------
  // SORTING LOGIC
  // ----------------------------------------------------
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      switch (sortBy) {
        case 'cgpa-desc':
          return b.cgpa - a.cgpa;
        case 'cgpa-asc':
          return a.cgpa - b.cgpa;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'roll-asc':
          return a.rollNo.localeCompare(b.rollNo);
        case 'status':
          return a.placementStatus.localeCompare(b.placementStatus);
        case 'offers-desc':
          return b.offers.length - a.offers.length;
        default:
          return 0;
      }
    });
  }, [filteredStudents, sortBy]);

  // ----------------------------------------------------
  // FILTER TOGGLE HANDLERS
  // ----------------------------------------------------
  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const selectAllBranches = () => setSelectedBranches([...ALL_BRANCHES]);
  const clearBranches = () => setSelectedBranches([]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((st) => st !== status) : [...prev, status]
    );
  };

  const selectAllStatuses = () => setSelectedStatuses([...ALL_STATUSES]);
  const clearStatuses = () => setSelectedStatuses([]);

  const applyCgpaPreset = (min: number, max: number = 10) => {
    setMinCgpa(min);
    setMaxCgpa(max);
    setActiveDropdown(null);
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedBranches([]);
    setMinCgpa(0);
    setMaxCgpa(10);
    setSelectedStatuses([]);
    setBacklogFilter('all');
    setSortBy('cgpa-desc');
    setActiveDropdown(null);
  };

  const isFiltered =
    search.trim() !== '' ||
    selectedBranches.length > 0 ||
    minCgpa > 0 ||
    maxCgpa < 10 ||
    selectedStatuses.length > 0 ||
    backlogFilter !== 'all';

  // ----------------------------------------------------
  // CSV EXPORT
  // ----------------------------------------------------
  const handleExport = () => {
    const headers = [
      'Roll Number',
      'Full Name',
      'Discipline',
      'CGPA Score',
      'Active Backlogs',
      'Placement Status',
      'Offers Count',
      'Primary Offer Company',
      'Offered Package CTC',
      'Email Contact',
      'Phone Contact',
      'Graduation Year',
    ];

    const rows = sortedStudents.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.branch}"`,
      s.cgpa.toFixed(2),
      s.backlogs,
      `"${s.placementStatus}"`,
      s.offers.length,
      `"${s.offers[0]?.companyName || 'None'}"`,
      `"${s.offers[0]?.ctc || 'N/A'}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.graduationYear || 2026,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Margdarshi_Student_Master_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // COMPUTED STATS FOR BANNER
  // ----------------------------------------------------
  const placedCount = statusCounts.Placed;
  const inProcessCount = statusCounts['In Process'];
  const unplacedCount = statusCounts.Unplaced;
  const avgCgpa = (
    students.reduce((acc, curr) => acc + curr.cgpa, 0) / (students.length || 1)
  ).toFixed(2);

  return (
    <div className="flex flex-col w-full gap-5">
      {/* ---------------------------------------------------- */}
      {/* 1. DIRECTORY HEADER & PRIMARY ACTIONS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-semibold">
              Official University Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">•</span>
            <span className="text-xs font-mono text-slate-500">Academic Year 2026–2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Student Master Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl font-sans">
            Central repository of candidate academic profiles, real-time eligibility records, ongoing drive pipelines, and verified placement selections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="h-9 px-3.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV report of current directory"
          >
            <span className="material-symbols-outlined text-[17px] text-amber-600">download</span>
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. STATISTICAL SNAPSHOT CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Total Enrolled</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{students.length}</span>
            <span className="text-xs font-mono text-slate-500">Candidates</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider">Verified Placed</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-emerald-800">{placedCount}</span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              ({students.length > 0 ? Math.round((placedCount / students.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-mono text-amber-800 uppercase tracking-wider">In Active Rounds</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-amber-800">{inProcessCount}</span>
            <span className="text-xs font-mono text-amber-700 font-semibold">Pipelines</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Cohort Avg CGPA</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{avgCgpa}</span>
            <span className="text-xs font-mono text-slate-500">/ 10.0</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. SEARCH BAR & MULTI-FILTER CONTROLS BAR */}
      {/* ---------------------------------------------------- */}
      <div
        ref={dropdownRef}
        className="bg-white rounded-xl p-3.5 sm:p-4 shadow-2xs border border-slate-200 flex flex-col gap-3 relative"
      >
        {/* Row 1: Search Bar & Multi-Filter Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no (21EG1A...), discipline, skills, or company..."
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* MULTI-FILTER DROPDOWNS GROUP */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* ----------------- 1. BRANCH MULTI-FILTER DROPDOWN ----------------- */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'branch' ? null : 'branch')}
                className={`h-10 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedBranches.length > 0
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">
                  account_tree
                </span>
                <span>
                  {selectedBranches.length === 0
                    ? 'All Branches'
                    : selectedBranches.length === 1
                    ? `Branch: ${selectedBranches[0]}`
                    : `Branches (${selectedBranches.length})`}
                </span>
                {selectedBranches.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {selectedBranches.length}
                  </span>
                )}
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  {activeDropdown === 'branch' ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {/* Branch Multi-Select Popover Menu */}
              {activeDropdown === 'branch' && (
                <div className="absolute left-0 lg:right-0 lg:left-auto top-11 z-40 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900 font-mono uppercase tracking-wider">
                      Filter Disciplines
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        onClick={selectAllBranches}
                        className="text-amber-700 hover:underline cursor-pointer font-medium"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={clearBranches}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                    {ALL_BRANCHES.map((branch) => {
                      const isChecked = selectedBranches.includes(branch);
                      const count = branchCounts[branch] || 0;
                      return (
                        <label
                          key={branch}
                          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-xs cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleBranch(branch)}
                              className="w-3.5 h-3.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                            />
                            <span className={`font-mono ${isChecked ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                              {branch}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {selectedBranches.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setActiveDropdown(null)}
                        className="px-2.5 py-1 text-[11px] bg-slate-900 text-white rounded font-medium cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ----------------- 2. CGPA RANGE DROPDOWN ----------------- */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'cgpa' ? null : 'cgpa')}
                className={`h-10 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                  minCgpa > 0 || maxCgpa < 10
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">
                  grade
                </span>
                <span>
                  {minCgpa === 0 && maxCgpa === 10
                    ? 'All CGPA'
                    : minCgpa > 0 && maxCgpa === 10
                    ? `CGPA ≥ ${minCgpa.toFixed(1)}`
                    : `CGPA: ${minCgpa.toFixed(1)}–${maxCgpa.toFixed(1)}`}
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  {activeDropdown === 'cgpa' ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {/* CGPA Range Popover */}
              {activeDropdown === 'cgpa' && (
                <div className="absolute left-0 lg:right-0 lg:left-auto top-11 z-40 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900 font-mono uppercase tracking-wider">
                      CGPA Range Cutoff
                    </span>
                    {(minCgpa > 0 || maxCgpa < 10) && (
                      <button
                        onClick={() => {
                          setMinCgpa(0);
                          setMaxCgpa(10);
                        }}
                        className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Preset Cutoffs */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Academic Presets
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => applyCgpaPreset(0, 10)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 0 && maxCgpa === 10
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Any (0.0 – 10.0)
                      </button>
                      <button
                        onClick={() => applyCgpaPreset(9.0, 10)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 9.0 && maxCgpa === 10
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ≥ 9.0 Distinction
                      </button>
                      <button
                        onClick={() => applyCgpaPreset(8.0, 10)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 8.0 && maxCgpa === 10
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ≥ 8.0 Tier-1 Cutoff
                      </button>
                      <button
                        onClick={() => applyCgpaPreset(7.0, 10)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 7.0 && maxCgpa === 10
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ≥ 7.0 First Class
                      </button>
                      <button
                        onClick={() => applyCgpaPreset(6.0, 10)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 6.0 && maxCgpa === 10
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ≥ 6.0 Standard
                      </button>
                      <button
                        onClick={() => applyCgpaPreset(0, 6.0)}
                        className={`px-2 py-1.5 text-left text-[11px] rounded border transition-colors cursor-pointer ${
                          minCgpa === 0 && maxCgpa === 6.0
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        &lt; 6.0 Needs Review
                      </button>
                    </div>
                  </div>

                  {/* Custom Min / Max Stepper */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Custom Range Bounds
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Min CGPA</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={minCgpa}
                          onChange={(e) => setMinCgpa(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
                          className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-slate-800 outline-none"
                        />
                      </div>
                      <span className="text-slate-400 self-end pb-1 font-mono">to</span>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Max CGPA</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={maxCgpa}
                          onChange={(e) => setMaxCgpa(Math.max(0, Math.min(10, parseFloat(e.target.value) || 10)))}
                          className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="px-2.5 py-1 text-[11px] bg-slate-900 text-white rounded font-medium cursor-pointer"
                    >
                      Apply CGPA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ----------------- 3. STATUS MULTI-FILTER DROPDOWN ----------------- */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className={`h-10 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedStatuses.length > 0
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">
                  verified
                </span>
                <span>
                  {selectedStatuses.length === 0
                    ? 'All Statuses'
                    : selectedStatuses.length === 1
                    ? `Status: ${selectedStatuses[0]}`
                    : `Statuses (${selectedStatuses.length})`}
                </span>
                {selectedStatuses.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {selectedStatuses.length}
                  </span>
                )}
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  {activeDropdown === 'status' ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {/* Status Multi-Select Popover Menu */}
              {activeDropdown === 'status' && (
                <div className="absolute right-0 top-11 z-40 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900 font-mono uppercase tracking-wider">
                      Placement Status
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        onClick={selectAllStatuses}
                        className="text-amber-700 hover:underline cursor-pointer font-medium"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={clearStatuses}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {ALL_STATUSES.map((status) => {
                      const isChecked = selectedStatuses.includes(status);
                      const count = statusCounts[status] || 0;
                      const dotColor =
                        status === 'Placed'
                          ? 'bg-emerald-600'
                          : status === 'In Process'
                          ? 'bg-amber-500'
                          : 'bg-slate-400';

                      return (
                        <label
                          key={status}
                          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-xs cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStatus(status)}
                              className="w-3.5 h-3.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                            />
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-700'}>
                              {status}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {selectedStatuses.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setActiveDropdown(null)}
                        className="px-2.5 py-1 text-[11px] bg-slate-900 text-white rounded font-medium cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ----------------- 4. SORT BY DROPDOWN ----------------- */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className="h-10 px-3 rounded-lg text-xs font-medium border bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sort order"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">
                  sort
                </span>
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-semibold text-slate-800">
                  {sortBy === 'cgpa-desc'
                    ? 'CGPA High'
                    : sortBy === 'cgpa-asc'
                    ? 'CGPA Low'
                    : sortBy === 'name-asc'
                    ? 'Name A–Z'
                    : sortBy === 'roll-asc'
                    ? 'Roll No'
                    : sortBy === 'offers-desc'
                    ? 'Offers'
                    : 'Status'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  {activeDropdown === 'sort' ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {activeDropdown === 'sort' && (
                <div className="absolute right-0 top-11 z-40 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { id: 'cgpa-desc', label: 'CGPA (Highest first)' },
                    { id: 'cgpa-asc', label: 'CGPA (Lowest first)' },
                    { id: 'name-asc', label: 'Student Name (A → Z)' },
                    { id: 'roll-asc', label: 'Roll Number (Ascending)' },
                    { id: 'offers-desc', label: 'Offer Count (Most offers)' },
                    { id: 'status', label: 'Placement Status' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSortBy(item.id as SortField);
                        setActiveDropdown(null);
                      }}
                      className={`px-2.5 py-1.5 text-left rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        sortBy === item.id
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {sortBy === item.id && (
                        <span className="material-symbols-outlined text-[15px] text-amber-600">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle (Table / Card Grid) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`h-9 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`h-9 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card grid view"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filter Badges (Backlogs) & Active Filter Tags */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Backlogs quick filter toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Backlogs:</span>
            <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200">
              <button
                onClick={() => setBacklogFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  backlogFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setBacklogFilter('zero')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  backlogFilter === 'zero' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                0 Backlogs Only
              </button>
              <button
                onClick={() => setBacklogFilter('with-backlogs')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  backlogFilter === 'with-backlogs' ? 'bg-white text-red-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Has Backlogs
              </button>
            </div>
          </div>

          {/* Result Count and Clear Filters Action */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono">
              Showing <strong className="text-slate-900 font-semibold">{sortedStudents.length}</strong> of{' '}
              <span className="text-slate-500">{students.length}</span> students
            </span>

            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline cursor-pointer flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Active Filter Chips */}
        {isFiltered && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active:</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-600 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {selectedBranches.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[11px] font-mono border border-amber-200"
              >
                {b}
                <button onClick={() => toggleBranch(b)} className="hover:text-red-600 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}

            {(minCgpa > 0 || maxCgpa < 10) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[11px] font-mono border border-amber-200">
                CGPA: {minCgpa.toFixed(1)} – {maxCgpa.toFixed(1)}
                <button
                  onClick={() => {
                    setMinCgpa(0);
                    setMaxCgpa(10);
                  }}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {selectedStatuses.map((st) => (
              <span
                key={st}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200"
              >
                Status: {st}
                <button onClick={() => toggleStatus(st)} className="hover:text-red-600 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}

            {backlogFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
                {backlogFilter === 'zero' ? '0 Backlogs' : 'Has Backlogs'}
                <button onClick={() => setBacklogFilter('all')} className="hover:text-red-600 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. ROSTER PRESENTATION (TABLE OR CARD GRID) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Dossier</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Backlogs</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4">Selections & CTC</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[36px] text-slate-300">
                          person_search
                        </span>
                        <p className="text-sm font-medium text-slate-600">
                          No candidates found matching current directory criteria.
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting search keywords, clearing branch filters, or loosening CGPA cutoffs.
                        </p>
                        <button
                          onClick={resetAllFilters}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((s) => {
                    const statusColor =
                      s.placementStatus === 'Placed'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : s.placementStatus === 'In Process'
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : 'text-slate-600 bg-slate-100 border-slate-200';

                    const cgpaColor =
                      s.cgpa >= 8.5
                        ? 'text-emerald-700 font-bold'
                        : s.cgpa >= 7.0
                        ? 'text-slate-900 font-semibold'
                        : 'text-amber-800 font-medium';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Student Dossier: Name + Email */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm hover:text-amber-700 cursor-pointer transition-colors"
                              onClick={() => setSelectedStudent(s)}
                            >
                              {s.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                              {s.email}
                            </span>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {s.rollNo}
                        </td>

                        {/* Branch */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                            {s.branch}
                          </span>
                        </td>

                        {/* CGPA */}
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <span className={`text-sm ${cgpaColor}`}>
                            {s.cgpa.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-0.5 font-sans">/ 10</span>
                        </td>

                        {/* Backlogs */}
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={
                              s.backlogs === 0
                                ? 'text-emerald-700 font-semibold'
                                : 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                            }
                          >
                            {s.backlogs === 0 ? '0 Nil' : `${s.backlogs} Active`}
                          </span>
                        </td>

                        {/* Placement Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${statusColor}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.placementStatus === 'Placed'
                                  ? 'bg-emerald-600'
                                  : s.placementStatus === 'In Process'
                                  ? 'bg-amber-600'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {s.placementStatus}
                          </span>
                        </td>

                        {/* Verified Selection & CTC */}
                        <td className="py-3 px-4">
                          {s.offers.length > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 font-mono truncate max-w-[170px]">
                                {s.offers[0].companyName}
                              </span>
                              <span className="text-[11px] text-amber-700 font-mono font-bold">
                                {s.offers[0].ctc}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Dossier Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-medium transition-all cursor-pointer shadow-2xs hover:border-slate-400"
                            title="Open verified candidate dossier"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW (OPTIMIZED FOR MOBILE & DENSE OVERVIEW) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
              <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                person_search
              </span>
              <p className="text-sm font-semibold text-slate-700">No candidates match current filters</p>
              <button
                onClick={resetAllFilters}
                className="mt-2 text-xs font-semibold text-amber-700 underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            sortedStudents.map((s) => {
              const statusColor =
                s.placementStatus === 'Placed'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : s.placementStatus === 'In Process'
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-slate-600 bg-slate-100 border-slate-200';

              return (
                <div
                  key={s.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {s.branch}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{s.rollNo}</span>
                      </div>
                      <h3
                        onClick={() => setSelectedStudent(s)}
                        className="font-serif font-bold text-slate-900 text-base hover:text-amber-700 cursor-pointer transition-colors"
                      >
                        {s.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono truncate">{s.email}</p>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusColor}`}>
                      {s.placementStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">CGPA Score</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {s.cgpa.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Backlogs</span>
                      <span
                        className={`font-mono font-semibold ${
                          s.backlogs === 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {s.backlogs === 0 ? '0 (Clean)' : `${s.backlogs} Active`}
                      </span>
                    </div>
                  </div>

                  {s.offers.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-amber-800 font-medium block">
                          Verified Selection
                        </span>
                        <span className="font-semibold text-slate-900">{s.offers[0].companyName}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-900 text-xs">{s.offers[0].ctc}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="w-full h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                  >
                    <span>View Full Dossier</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. STUDENT DOSSIER MODAL (OFFICIAL AUDIT PROFILE) */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setSelectedStudent(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 flex flex-col gap-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Official University Dossier
                    </span>
                    <span className="text-xs font-mono text-slate-500">{selectedStudent.rollNo}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedStudent.branch} Engineering • Cohort {selectedStudent.graduationYear || 2028} ({getShortYearOfStudy(selectedStudent.graduationYear || 2028)})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Close dossier"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Academic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono uppercase">CGPA Score</span>
                  <span className="font-bold text-slate-900 font-mono text-base mt-0.5 block tabular-nums">
                    {selectedStudent.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">Scale of 10.0</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono uppercase">Backlogs</span>
                  <span
                    className={`font-bold font-mono text-base mt-0.5 block tabular-nums ${
                      selectedStudent.backlogs === 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {selectedStudent.backlogs}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedStudent.backlogs === 0 ? 'Clear Record' : 'Requires Clearance'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono uppercase">Class 10th</span>
                  <span className="font-bold text-slate-900 font-mono text-base mt-0.5 block tabular-nums">
                    {selectedStudent.tenthPercentage ? `${selectedStudent.tenthPercentage}%` : '90.0%'}
                  </span>
                  <span className="text-[10px] text-slate-400">Board Aggregate</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono uppercase">Class 12th</span>
                  <span className="font-bold text-slate-900 font-mono text-base mt-0.5 block tabular-nums">
                    {selectedStudent.twelfthPercentage ? `${selectedStudent.twelfthPercentage}%` : '87.5%'}
                  </span>
                  <span className="text-[10px] text-slate-400">Intermediate</span>
                </div>
              </div>

              {/* Contact Credentials */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Institutional Email</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Contact Phone</span>
                  <span className="font-mono text-slate-900">{selectedStudent.phone}</span>
                </div>
              </div>

              {/* Technical Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2 font-mono">
                    Audited Skills & Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-medium border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Placement Selections */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2 font-mono">
                  Verified Selections & Offers
                </span>
                {selectedStudent.offers.length === 0 ? (
                  <div className="p-3.5 bg-slate-50 rounded-xl text-slate-500 text-xs text-center border border-slate-200">
                    No confirmed company offers recorded yet. Candidate remains in recruitment pool.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedStudent.offers.map((off, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-serif font-bold text-slate-900 text-sm">
                            {off.companyName}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{off.role}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-amber-900 font-mono tabular-nums block">
                            {off.ctc}
                          </span>
                          <span className="text-[10px] font-mono text-amber-800 uppercase font-semibold">
                            {off.tier} Offer
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400">
                  Total Drives Applied: {selectedStudent.appliedDrivesCount}
                </span>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
