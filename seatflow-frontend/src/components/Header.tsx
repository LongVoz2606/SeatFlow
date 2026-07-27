import React from 'react';
import { Ticket, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Ticket className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              SeatFlow
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              High-Concurrency Ticket Engine
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Redisson Lock Protected</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimistic Locking (@Version)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
