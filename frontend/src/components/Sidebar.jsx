import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  BookOpen, 
  History, 
  Cpu,
  Database
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, dbStatus, aiStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-claim', label: 'Submit Claim', icon: PlusCircle },
    { id: 'claims', label: 'All Claims', icon: FileText },
    { id: 'policy', label: 'Policy Reference', icon: BookOpen },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  const isMongoConnected = dbStatus?.connected;
  const isAiOnline = aiStatus?.configured;

  return (
    <aside className="w-64 bg-dark-850 border-r border-white/[0.07] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                ClaimGuard
              </div>
              <div className="text-xs text-neutral-400">Policy Review Assistant</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-brand/15 text-white border border-brand/30 shadow-sm shadow-brand/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-brand-light' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 m-3 rounded-xl bg-dark-800/80 border border-white/[0.06] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <Cpu className="w-3.5 h-3.5 text-brand-light" />
            <span>Policy Engine</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 font-medium ${isAiOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isAiOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-neutral-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>MongoDB</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 font-medium ${isMongoConnected ? 'text-emerald-400' : 'text-neutral-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMongoConnected ? 'bg-emerald-500' : 'bg-neutral-500'}`}></span>
            {isMongoConnected ? 'Atlas Cloud' : 'In-Memory'}
          </span>
        </div>
      </div>
    </aside>
  );
}
