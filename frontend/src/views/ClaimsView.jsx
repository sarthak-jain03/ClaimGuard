import React, { useState } from 'react';
import { Search, Plus, FileText, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Clock } from 'lucide-react';
import { CATEGORY_LABELS, formatCurrency, formatDate } from '../policyData';

export default function ClaimsView({ claims = [], onNavigate, onOpenClaim }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'clarification', label: 'Needs Clarification' },
  ];

  const filteredClaims = claims.filter((claim) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? ['pending', 'flagged'].includes(claim.status)
        : claim.status === statusFilter;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      claim.id?.toLowerCase().includes(term) ||
      claim.claimant?.toLowerCase().includes(term) ||
      claim.description?.toLowerCase().includes(term) ||
      (CATEGORY_LABELS[claim.category] || claim.category)?.toLowerCase().includes(term) ||
      claim.department?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Flagged
          </span>
        );
      case 'clarification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> Clarification
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Claims</h1>
          <p className="text-sm text-neutral-400 mt-1">Review, filter, and manage all submitted expense claims</p>
        </div>
        <button
          onClick={() => onNavigate('new-claim')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search claims by ID, claimant, note..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-dark-800 border border-white/[0.07] rounded-xl self-start sm:self-auto overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl">
        {filteredClaims.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No claims match criteria</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Try adjusting your search query or switching the status filter tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] bg-dark-750/40 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Claim ID</th>
                  <th className="py-3.5 px-5">Claimant</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5">Receipt</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => onOpenClaim(claim.id)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono text-xs font-medium text-brand-light group-hover:underline">
                      {claim.id}
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-sm font-semibold text-white">{claim.claimant}</div>
                      {claim.department && (
                        <div className="text-xs text-neutral-400">{claim.department}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-neutral-300">
                      {formatDate(claim.date)}
                    </td>
                    <td className="py-4 px-5 text-xs text-neutral-300">
                      {CATEGORY_LABELS[claim.category] || claim.category}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-white text-sm">
                      {formatCurrency(claim.amount, claim.currency)}
                    </td>
                    <td className="py-4 px-5 text-xs">
                      {claim.receipt === 'yes' ? (
                        <span className="text-emerald-400 font-medium">Yes</span>
                      ) : claim.receipt === 'no' ? (
                        <span className="text-rose-400 font-medium">No</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="py-4 px-5">
                      {claim.validationIssues && claim.validationIssues.length > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          {claim.validationIssues.length} issue{claim.validationIssues.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 font-medium">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
