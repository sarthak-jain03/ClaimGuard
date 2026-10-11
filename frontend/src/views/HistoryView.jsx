import React from 'react';
import { History, Clock } from 'lucide-react';
import { formatTimestamp } from '../policyData';

export default function HistoryView({ auditLogs = [] }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit History</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Complete, tamper-evident log of all claim submissions, reviews, and overrides
        </p>
      </div>

      <div className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6 sm:p-8">
        {auditLogs.length === 0 ? (
          <div className="py-16 text-center">
            <History className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No audit records found</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Actions such as submitting claims, approving, or requesting clarification will appear here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
            {auditLogs.map((entry, idx) => (
              <div key={idx} className="relative group">
                <div
                  className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-dark-800 shadow-sm"
                  style={{ backgroundColor: entry.color || '#6366f1' }}
                />

                <div className="bg-dark-750/50 hover:bg-dark-750 p-4 rounded-xl border border-white/[0.05] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      <span>{entry.action}</span>
                      {entry.claimId && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.05] text-brand-light font-normal">
                          {entry.claimId}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-300">
                    <span className="text-neutral-400">Claimant:</span> {entry.claimant}
                    {entry.reviewer && (
                      <span className="ml-2 text-neutral-400">
                        · Reviewed by <strong className="text-white">{entry.reviewer}</strong>
                      </span>
                    )}
                  </div>

                  {entry.detail && (
                    <div className="mt-2 text-xs text-neutral-200 bg-dark-900/40 p-2.5 rounded-lg border border-white/[0.03]">
                      {entry.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
