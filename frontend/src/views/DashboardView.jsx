import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { CATEGORY_LABELS, formatCurrency, formatDate } from '../policyData';

export default function DashboardView({ stats, onNavigate, onOpenClaim }) {
  const {
    totalClaims = 0,
    pendingReview = 0,
    approved = 0,
    rejected = 0,
    totalAmount = 0,
    totalFlags = 0,
    categoryBreakdown = {},
    recentClaims = []
  } = stats || {};

  const statCards = [
    {
      label: 'Total Claims',
      value: totalClaims,
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Pending Review',
      value: pendingReview,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Approved',
      value: approved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Total Claimed',
      value: `₹${Math.round(totalAmount).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      label: 'Flagged Issues',
      value: totalFlags,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20'
    },
  ];

  const maxCategoryCount = Math.max(...Object.values(categoryBreakdown), 1);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</span>;
      case 'flagged':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Flagged</span>;
      case 'clarification':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Clarification</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">Overview of expense claims and policy compliance review status</p>
        </div>
        <button
          onClick={() => onNavigate('new-claim')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-dark-800 border border-white/[0.07] p-4 rounded-2xl flex items-center gap-3.5 hover:border-white/[0.12] transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono leading-none">{stat.value}</div>
                <div className="text-xs text-neutral-400 mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-800 border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
            <h2 className="text-base font-semibold text-white">Recent Claims</h2>
            <button
              onClick={() => onNavigate('claims')}
              className="text-xs font-medium text-brand-light hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-white/[0.04]">
            {recentClaims.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-500 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-white">No claims submitted yet</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mb-4">Submit your first expense claim to review it against policy rules.</p>
                <button
                  onClick={() => onNavigate('new-claim')}
                  className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Submit First Claim
                </button>
              </div>
            ) : (
              recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => onOpenClaim(claim.id)}
                  className="py-3.5 px-3 flex items-center justify-between rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-dark-750 border border-white/[0.08] flex items-center justify-center font-mono text-xs text-brand-light font-medium group-hover:border-brand/40 transition-colors">
                      {claim.category?.slice(0, 2).toUpperCase() || 'EX'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                        {claim.claimant}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {formatDate(claim.date)} · {CATEGORY_LABELS[claim.category] || claim.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(claim.status)}
                    <div className="text-sm font-bold font-mono text-white text-right w-28">
                      {formatCurrency(claim.amount, claim.currency)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-semibold text-white pb-4 border-b border-white/[0.07]">
            Category Breakdown
          </h2>

          <div className="mt-4 flex-1 flex flex-col justify-center space-y-4">
            {Object.keys(categoryBreakdown).length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No spending data recorded yet
              </div>
            ) : (
              Object.entries(categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => {
                  const pct = Math.round((count / maxCategoryCount) * 100);
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-medium">{CATEGORY_LABELS[cat] || cat}</span>
                        <span className="text-neutral-400 font-mono">{count} claim{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden border border-white/[0.04]">
                        <div
                          className="h-full bg-gradient-to-r from-brand to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
