import React, { useState } from 'react';
import { Send, RotateCcw, AlertCircle, BookOpen, Info } from 'lucide-react';
import { EXPENSE_POLICY, CATEGORY_LABELS, CATEGORY_LIMITS, formatCurrency } from '../policyData';

export default function NewClaimView({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    claimant: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    currency: 'INR',
    receipt: '',
    description: '',
    project: '',
  });

  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleReset = () => {
    setFormData({
      claimant: '',
      department: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      currency: 'INR',
      receipt: '',
      description: '',
      project: '',
    });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.claimant.trim()) {
      setFormError('Claimant Name is required.');
      return;
    }
    if (!formData.date) {
      setFormError('Expense Date is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Please select an expense category.');
      return;
    }
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!formData.receipt) {
      setFormError('Please indicate receipt availability.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setFormError('Description must be at least 10 characters detailing the business justification.');
      return;
    }

    onSubmit({
      ...formData,
      amount: parsedAmount,
    });
  };

  const selectedPolicySection = EXPENSE_POLICY.sections.find(
    (s) => s.id === formData.category
  );
  const selectedLimit = CATEGORY_LIMITS[formData.category];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Submit Expense Claim</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Provide complete claim details for organizational policy verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-dark-800 border border-white/[0.07] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.07] mb-6">
            <h2 className="text-base font-semibold text-white">Claim Information</h2>
            <span className="text-xs text-neutral-400">* Required fields</span>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Claimant Name *
                </label>
                <input
                  type="text"
                  name="claimant"
                  value={formData.claimant}
                  onChange={handleChange}
                  placeholder="e.g. Sarthak Jain"
                  required
                  className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering, Product, Sales"
                  className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                >
                  <option value="">Select category...</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Amount *
                </label>
                <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-brand">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="bg-dark-750 px-3 py-2.5 text-sm text-neutral-300 border-r border-white/10 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full bg-dark-input px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Receipt Available? *
                </label>
                <select
                  name="receipt"
                  value={formData.receipt}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes — Receipt Available</option>
                  <option value="no">No — Receipt Missing</option>
                  <option value="pending">Pending Upload</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Business Description & Justification *
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the expense in detail: business purpose, participants/attendees, project context, and receipts description..."
                required
                className="w-full bg-dark-input border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Project / Cost Center
              </label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="e.g. Q4 Client Workshop, Core Platform Upgrade"
                className="w-full bg-dark-input border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Form</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover shadow-lg shadow-brand/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/[0.07]">
            <BookOpen className="w-4 h-4 text-brand-light" />
            <h2 className="text-base font-semibold text-white">Policy Quick Reference</h2>
          </div>

          <div className="mt-4">
            {selectedPolicySection ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-dark-750 border border-white/[0.06]">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Category</div>
                  <div className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
                    <span className="text-base">{selectedPolicySection.icon}</span>
                    <span>{selectedPolicySection.title}</span>
                  </div>
                </div>

                {selectedLimit && (
                  <div className="p-3.5 rounded-xl bg-dark-750 border border-white/[0.06]">
                    <div className="text-xs text-neutral-400 uppercase tracking-wider">Claim Limit</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                      {formatCurrency(selectedLimit)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Manager approval required above limit</div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-dark-750 border border-white/[0.06] space-y-2">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Key Policy Rules</div>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    {selectedPolicySection.rules.slice(0, 4).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-light font-bold">→</span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <Info className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Select an expense category to see immediate spending limits and compliance rules.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
