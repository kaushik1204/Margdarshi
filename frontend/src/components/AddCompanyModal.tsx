import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Company, CompensationTier } from '../types/placement';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (company: Company) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onAddCompany,
}) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [tier, setTier] = useState<CompensationTier>('tier-1');
  const [locations, setLocations] = useState('Hyderabad / Bangalore');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');

    const tierLabel =
      tier === 'tier-1'
        ? 'Tier 1 (Dream)'
        : tier === 'tier-2'
        ? 'Tier 2'
        : 'Tier 3';

    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: name.trim(),
      logoLetter: initials || name.charAt(0).toUpperCase(),
      logoColorClass:
        tier === 'tier-1'
          ? 'text-blue-600'
          : tier === 'tier-2'
          ? 'text-indigo-600'
          : 'text-slate-700',
      industry: industry || 'Information Technology & Cloud Solutions',
      locations: locations || 'Pan India',
      tier,
      tierLabel,
      status: 'Active',
      drivesRecordLabel: '0 Active Drives',
      totalHiredCount: 0,
      contactPerson: contactPerson || 'University Relations Lead',
      contactEmail: contactEmail || `recruiting@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      drives: [],
    };

    onAddCompany(newCompany);
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
              Corporate Onboarding
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Add Corporate Partner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oracle, Salesforce, Nvidia"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Industry Vertical</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Enterprise Software"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Assigned Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CompensationTier)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold outline-none focus:bg-white cursor-pointer"
              >
                <option value="tier-1">Tier 1 (&gt; 20 LPA)</option>
                <option value="tier-2">Tier 2 (10 - 20 LPA)</option>
                <option value="tier-3">Tier 3 (&lt; 10 LPA)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Work Locations</label>
            <input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="Hyderabad / Bangalore"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Recruiter Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Recruiter Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="campus@company.com"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
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
              Add Corporate Partner
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
