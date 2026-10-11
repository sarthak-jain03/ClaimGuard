import React from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Shuffle, 
  ShieldCheck,
  AlertOctagon,
  Clock,
  Quote
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_LIMITS, formatCurrency, formatDate, formatTimestamp } from '../policyData';

export default function ClaimDetailView({ 
  claim, 
  onBack, 
  onOpenModal, 
  onRerunAi, 
  isAnalyzing, 
  categoryLimits = CATEGORY_LIMITS 
}) {
  if (!claim) return null;

  const ai = claim.aiAnalysis;
  const hasAi = ai && !ai.error;
  const hasAiError = ai && ai.error;
  const isPending = ['pending', 'flagged', 'clarification'].includes(claim.status);

  const limit = categoryLimits[claim.category] || CATEGORY_LIMITS[claim.category];
  const amountNum = parseFloat(claim.amount) || 0;
  const pctLimit = limit ? Math.min((amountNum / limit) * 100, 100) : 0;
  const isOverLimit = limit ? amountNum > limit : false;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
      case 'flagged':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Flagged for Review</span>;
      case 'clarification':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Clarification Needed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Claims</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{claim.id}</h1>
            {getStatusBadge(claim.status)}
          </div>
        </div>

        <button
          onClick={() => onRerunAi(claim.id)}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-brand-light border border-white/10 text-xs font-medium shadow-sm transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-run Policy Analysis'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white pb-4 border-b border-white/[0.07]">
              Claim Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Claimant</div>
                <div className="text-sm font-semibold text-white mt-0.5">{claim.claimant}</div>
              </div>
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Department</div>
                <div className="text-sm font-semibold text-white mt-0.5">{claim.department || 'Not specified'}</div>
              </div>
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Date</div>
                <div className="text-sm font-semibold text-white mt-0.5">{formatDate(claim.date)}</div>
              </div>
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Category</div>
                <div className="text-sm font-semibold text-white mt-0.5">{CATEGORY_LABELS[claim.category] || claim.category}</div>
              </div>
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Amount</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(claim.amount, claim.currency)}
                </div>
              </div>
              <div className="p-3 bg-dark-750/50 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Receipt</div>
                <div className="text-sm font-semibold mt-0.5">
                  {claim.receipt === 'yes' ? (
                    <span className="text-emerald-400">Attached</span>
                  ) : claim.receipt === 'no' ? (
                    <span className="text-rose-400">Missing</span>
                  ) : (
                    <span className="text-amber-400">Pending</span>
                  )}
                </div>
              </div>
            </div>

            {claim.description && (
              <div className="mt-5 p-4 bg-dark-750/30 rounded-xl border border-white/[0.04]">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">Description & Business Justification</div>
                <p className="text-sm text-neutral-200 leading-relaxed">{claim.description}</p>
              </div>
            )}

            {claim.project && (
              <div className="mt-3 text-xs text-neutral-400">
                <span className="text-neutral-500 font-medium">Project / Cost Center:</span> {claim.project}
              </div>
            )}
          </div>

          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white pb-4 border-b border-white/[0.07]">
              Deterministic Policy Checks
            </h2>
            <div className="mt-4 space-y-3">
              {claim.validationIssues && claim.validationIssues.length > 0 ? (
                claim.validationIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      issue.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    {issue.type === 'error' ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-xs text-white">{issue.title}</div>
                      <div className="text-xs mt-0.5 text-neutral-300">{issue.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>All deterministic policy validation checks passed successfully.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-brand/20 text-brand-light">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h2 className="text-base font-semibold text-white">Policy Analysis & Compliance</h2>
              </div>
              {hasAi && ai.categoryUncertain && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Uncertain Classification
                </span>
              )}
            </div>

            <div className="mt-5">
              {hasAiError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex flex-col gap-2">
                  <div className="font-semibold">Analysis Error</div>
                  <div>{ai.error}</div>
                  <button
                    onClick={() => onRerunAi(claim.id)}
                    className="self-start px-3 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-500 transition-colors mt-1"
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : hasAi ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-neutral-400">Category Classification Confidence</span>
                      <span className="text-white font-mono">{ai.categoryConfidence || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden border border-white/[0.04]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ai.categoryConfidence >= 75
                            ? 'bg-emerald-500'
                            : ai.categoryConfidence >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${ai.categoryConfidence || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Compliance Assessment
                    </div>
                    <p className="text-sm text-neutral-200 leading-relaxed bg-dark-750/40 p-4 rounded-xl border border-white/[0.04]">
                      {ai.policyAnalysis || ai.complianceSummary}
                    </p>
                  </div>

                  {ai.policyCitation && (
                    <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/20 text-xs text-brand-light flex items-start gap-2.5">
                      <Quote className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                      <div className="italic">"{ai.policyCitation}"</div>
                    </div>
                  )}

                  {ai.redFlags && ai.redFlags.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                        Identified Red Flags
                      </div>
                      <div className="space-y-1.5">
                        {ai.redFlags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/15">
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ai.missingInformation && ai.missingInformation.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Missing Information
                      </div>
                      <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1 pl-1">
                        {ai.missingInformation.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ai.clarificationQuestions && ai.clarificationQuestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Clarification Questions to Ask Claimant
                      </div>
                      <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1 pl-1">
                        {ai.clarificationQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ai.recommendations && (
                    <div className="p-4 rounded-xl bg-dark-750/70 border border-white/[0.06] space-y-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Auditor Recommendation
                      </div>
                      <div className="text-xs text-neutral-200 leading-relaxed font-medium">
                        {ai.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-neutral-400 mb-3">No policy analysis recorded for this claim.</p>
                  <button
                    onClick={() => onRerunAi(claim.id)}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
                  >
                    Run Policy Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white pb-4 border-b border-white/[0.07] mb-4">
              Reviewer Actions
            </h2>

            {isPending ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenModal('approve', claim)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => onOpenModal('reject', claim)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/30 transition-all active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenModal('clarification', claim)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold transition-all active:scale-95"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Request Clarification</span>
                </button>

                <button
                  onClick={() => onOpenModal('override', claim)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold transition-all active:scale-95"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Override Category</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-neutral-400">
                  This claim has already been resolved as <strong className="text-white capitalize">{claim.status}</strong>.
                </div>
                <button
                  onClick={() => onOpenModal('reopen', claim)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-dark-750 hover:bg-dark-700 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reopen for Review</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.07] mb-4">
              Category Limit
            </h2>
            {limit ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-neutral-400 font-mono">{formatCurrency(amountNum, claim.currency)}</span>
                  <span className="text-white font-mono">Limit: {formatCurrency(limit)}</span>
                </div>
                <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverLimit ? 'bg-rose-500' : pctLimit > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pctLimit}%` }}
                  />
                </div>
                {isOverLimit && (
                  <div className="text-xs text-rose-400 font-medium pt-1">
                    Exceeds policy limit by {formatCurrency(amountNum - limit, claim.currency)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">No policy limit configured for this category.</p>
            )}
          </div>

          {hasAi && ai.requiresManagerApproval && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 text-amber-300 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-2 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Manager Approval Required</span>
              </div>
              <p className="text-neutral-300 leading-relaxed pt-1">
                Policy analysis determined that this claim requires executive line-manager approval prior to finance disbursement.
              </p>
            </div>
          )}

          <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.07] mb-4">
              Review History
            </h2>
            <div className="space-y-4">
              {claim.reviewHistory && claim.reviewHistory.length > 0 ? (
                claim.reviewHistory.map((hist, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: hist.color || '#6366f1' }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{hist.action}</div>
                      {hist.note && <div className="text-neutral-300 mt-0.5">{hist.note}</div>}
                      {hist.override && <div className="text-amber-400 mt-0.5">Override reason: {hist.override}</div>}
                      <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(hist.timestamp)}</span>
                        {hist.reviewer && <span>· by {hist.reviewer}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 text-xs py-2">No review actions recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
