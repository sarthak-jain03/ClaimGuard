import React, { useState } from 'react';
import { X, CheckCircle2, AlertOctagon, HelpCircle, Shuffle, RotateCcw } from 'lucide-react';
import { CATEGORY_LABELS, formatCurrency } from '../policyData';

export default function ReviewModal({ modalData, onClose, onConfirm }) {
  if (!modalData) return null;

  const { action, claim } = modalData;
  const [reviewer, setReviewer] = useState(localStorage.getItem('claimguard_reviewer') || '');
  const [note, setNote] = useState('');
  const [overrideCategory, setOverrideCategory] = useState(claim?.category || 'meals');
  const [error, setError] = useState('');

  const configs = {
    approve: {
      title: 'Approve Claim',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      btnText: 'Confirm Approve',
      btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      noteRequired: false,
      placeholder: 'Add an optional approval note...',
      desc: `Approving claim ${claim.id} for ${claim.claimant} — ${formatCurrency(claim.amount, claim.currency)}.`
    },
    reject: {
      title: 'Reject Claim',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      btnText: 'Confirm Reject',
      btnClass: 'bg-rose-600 hover:bg-rose-500 text-white',
      noteRequired: true,
      placeholder: 'Explain why this claim is being rejected...',
      desc: `Rejecting claim ${claim.id} for policy violations or ineligible expenses.`
    },
    clarification: {
      title: 'Request Clarification',
      icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
      btnText: 'Send Request',
      btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
      noteRequired: true,
      placeholder: 'Specify what documentation or answers are required...',
      desc: `Request additional clarification from ${claim.claimant}.`
    },
    override: {
      title: 'Override Classification',
      icon: <Shuffle className="w-5 h-5 text-purple-400" />,
      btnText: 'Apply Override',
      btnClass: 'bg-purple-600 hover:bg-purple-500 text-white',
      noteRequired: true,
      placeholder: 'Explain why the category is being reclassified...',
      desc: `Change category for claim ${claim.id} from ${CATEGORY_LABELS[claim.category] || claim.category}.`
    },
    reopen: {
      title: 'Reopen Claim',
      icon: <RotateCcw className="w-5 h-5 text-brand-light" />,
      btnText: 'Reopen for Review',
      btnClass: 'bg-brand hover:bg-brand-hover text-white',
      noteRequired: false,
      placeholder: 'Why is this claim being reopened?',
      desc: `Reset claim ${claim.id} status back to Pending for review.`
    }
  };

  const cfg = configs[action] || configs.approve;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cfg.noteRequired && !note.trim()) {
      setError('Please provide a reason/note before proceeding.');
      return;
    }
    const finalReviewer = reviewer.trim() || 'Reviewer';
    localStorage.setItem('claimguard_reviewer', finalReviewer);

    onConfirm({
      claimId: claim.id,
      action,
      reviewer: finalReviewer,
      note: note.trim(),
      overrideCategory: action === 'override' ? overrideCategory : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5 font-semibold text-white text-base">
            {cfg.icon}
            <span>{cfg.title}</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-neutral-300 leading-relaxed">{cfg.desc}</p>

          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              Reviewer Name
            </label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="Your name or role"
              className="w-full bg-dark-input border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand"
            />
          </div>

          {action === 'override' && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                New Category
              </label>
              <select
                value={overrideCategory}
                onChange={(e) => setOverrideCategory(e.target.value)}
                className="w-full bg-dark-input border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              Note / Explanation {cfg.noteRequired && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError('');
              }}
              placeholder={cfg.placeholder}
              className="w-full bg-dark-input border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand resize-none"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-md ${cfg.btnClass}`}
            >
              {cfg.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
