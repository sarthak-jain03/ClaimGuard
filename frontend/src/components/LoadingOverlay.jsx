import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ isLoading, message = "Processing..." }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
        <div className="relative mb-4">
          <Loader2 className="w-10 h-10 text-brand-light animate-spin" />
        </div>
        <h3 className="font-semibold text-white text-base mb-1">Analyzing Claim</h3>
        <p className="text-xs text-neutral-400">{message}</p>
      </div>
    </div>
  );
}
