import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { EXPENSE_POLICY, formatCurrency } from '../policyData';

export default function PolicyView() {
  const [openSections, setOpenSections] = useState({
    general: true,
    meals: true,
    travel: true,
  });

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expense Policy Reference</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Official organizational expense policy guidelines and spending caps
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 text-brand-light border border-brand/30 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Version {EXPENSE_POLICY.version} — FY 2026</span>
        </div>
      </div>

      <div className="space-y-4">
        {EXPENSE_POLICY.sections.map((section) => {
          const isOpen = Boolean(openSections[section.id]);
          return (
            <div
              key={section.id}
              className="bg-dark-800 border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                    style={{
                      backgroundColor: `${section.color}15`,
                      borderColor: `${section.color}35`,
                      color: section.color,
                    }}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{section.title}</h2>
                    <span className="text-xs text-neutral-400">
                      {section.rules.length} policy rules {section.limits ? '· Spending limits defined' : ''}
                    </span>
                  </div>
                </div>

                <div className="text-neutral-400 p-1">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-white/[0.04] space-y-5 animate-in fade-in duration-150">
                  <p className="text-sm text-neutral-300 leading-relaxed bg-dark-750/50 p-4 rounded-xl border border-white/[0.04]">
                    {section.content}
                  </p>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                      Key Compliance Rules
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {section.rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-750/30 border border-white/[0.04] text-xs text-neutral-200"
                        >
                          <span className="text-brand-light font-bold text-sm leading-none mt-0.5">→</span>
                          <span className="leading-relaxed">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {section.limits && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                        Configured Spending Limits
                      </h4>
                      <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-dark-750/30">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-dark-700/60 text-neutral-400 border-b border-white/[0.07] uppercase tracking-wider font-semibold">
                            <tr>
                              <th className="py-2.5 px-4">Limit Scope</th>
                              <th className="py-2.5 px-4 text-right">Max Allowed (INR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {Object.entries(section.limits).map(([k, v]) => (
                              <tr key={k}>
                                <td className="py-2.5 px-4 text-neutral-300 capitalize">
                                  {k.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                                  {typeof v === 'number' && v <= 25 ? `₹${v}/km` : formatCurrency(v)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
