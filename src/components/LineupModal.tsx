import React, { useState } from 'react';
import { X, Users, UserCheck, Phone } from 'lucide-react';
import { Team } from '../types/tournament';
import { toBengaliNumber } from '../utils/bengali';

interface LineupModalProps {
  isOpen: boolean;
  onClose: () => void;
  team1?: Team;
  team2?: Team;
  useBengaliNumerals?: boolean;
}

export const LineupModal: React.FC<LineupModalProps> = ({
  isOpen,
  onClose,
  team1,
  team2,
  useBengaliNumerals = true,
}) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'roster'>('pitch');

  if (!isOpen) return null;

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  const t1Players = team1?.players || [];
  const t2Players = team2?.players || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 text-slate-100 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                ম্যাচ লাইন-আপ ও দলীয় স্কোয়াড
              </h3>
              <p className="text-xs text-slate-400">
                {team1?.name} বনাম {team2?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Tactical Pitch vs Full Roster */}
        <div className="flex bg-[#061e18] p-1 rounded-xl border border-emerald-900/40 my-3">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'pitch'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ট্যাকটিক্যাল পিচ ভিউ
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'roster'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            পূর্ণ স্কোয়াড তালিকা
          </button>
        </div>

        {/* 1. Tactical Pitch Graphic */}
        {activeTab === 'pitch' && (
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#083a2a] border-4 border-emerald-600/50 p-4 overflow-hidden shadow-inner flex flex-col justify-between">
            {/* Field lines */}
            <div className="absolute inset-2 border-2 border-white/20 rounded-xl pointer-events-none" />
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 border-2 border-white/20 rounded-full pointer-events-none" />
            
            {/* Top Penalty Box (Team 1) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-14 border-b-2 border-x-2 border-white/20 pointer-events-none" />
            {/* Bottom Penalty Box (Team 2) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-14 border-t-2 border-x-2 border-white/20 pointer-events-none" />

            {/* Team 1 Half (Top) */}
            <div className="relative z-10 flex flex-col justify-around h-1/2 pb-2">
              <div className="flex items-center justify-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: team1?.color }}
                />
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {team1?.name}
                </span>
              </div>
              <div className="flex items-center justify-around px-2">
                {t1Players.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-white text-xs shadow-md border-2 border-white/30"
                      style={{ backgroundColor: team1?.color || '#10b981' }}
                    >
                      {num(p.jerseyNumber)}
                    </div>
                    <span className="text-[9px] font-bold text-white drop-shadow mt-0.5 truncate max-w-[65px] text-center">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 Half (Bottom) */}
            <div className="relative z-10 flex flex-col justify-around h-1/2 pt-2">
              <div className="flex items-center justify-around px-2">
                {t2Players.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-white text-xs shadow-md border-2 border-white/30"
                      style={{ backgroundColor: team2?.color || '#3b82f6' }}
                    >
                      {num(p.jerseyNumber)}
                    </div>
                    <span className="text-[9px] font-bold text-white drop-shadow mt-0.5 truncate max-w-[65px] text-center">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: team2?.color }}
                />
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {team2?.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Full Rosters Column Grid */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
            {/* Team 1 Squad */}
            <div className="p-3 rounded-2xl bg-[#061c16] border border-emerald-900/60 space-y-2">
              <div className="pb-1.5 border-b border-emerald-900/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: team1?.color }}
                  />
                  <h4 className="text-xs font-bold text-white truncate">{team1?.name}</h4>
                </div>
                {team1?.managerName && (
                  <div className="text-[10px] text-emerald-300 flex items-center gap-1 flex-wrap">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span>ম্যানেজার: {team1.managerName}</span>
                    {team1.managerPhone && (
                      <a
                        href={`tel:${team1.managerPhone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-0.5 text-amber-300 hover:underline font-mono"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{num(team1.managerPhone)}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                {t1Players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-800/50"
                  >
                    <span className="font-bold text-slate-100 truncate">{p.name}</span>
                    <span className="font-display font-bold text-amber-400 text-[11px]">
                      #{num(p.jerseyNumber)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 Squad */}
            <div className="p-3 rounded-2xl bg-[#061c16] border border-emerald-900/60 space-y-2">
              <div className="pb-1.5 border-b border-emerald-900/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: team2?.color }}
                  />
                  <h4 className="text-xs font-bold text-white truncate">{team2?.name}</h4>
                </div>
                {team2?.managerName && (
                  <div className="text-[10px] text-emerald-300 flex items-center gap-1 flex-wrap">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span>ম্যানেজার: {team2.managerName}</span>
                    {team2.managerPhone && (
                      <a
                        href={`tel:${team2.managerPhone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-0.5 text-amber-300 hover:underline font-mono"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{num(team2.managerPhone)}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                {t2Players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-800/50"
                  >
                    <span className="font-bold text-slate-100 truncate">{p.name}</span>
                    <span className="font-display font-bold text-amber-400 text-[11px]">
                      #{num(p.jerseyNumber)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
