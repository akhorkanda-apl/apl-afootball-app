import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
  Share2,
  UserCheck,
  Check,
  Trophy,
  List,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import {
  formatBengaliDate,
  formatBengaliTime,
  generateMatchShareSummary,
  getMatchStatusLabel,
  shareMatchSummary,
  toBengaliNumber,
} from '../utils/bengali';
import { KnockoutBracketView } from './KnockoutBracketView';

interface FixturesViewProps {
  onSelectLiveMatch?: (matchId: string) => void;
}

export const FixturesView: React.FC<FixturesViewProps> = ({ onSelectLiveMatch }) => {
  const { matches, teams, activeTournament, orgSettings, useBengaliNumerals } = useTournament();

  const [viewMode, setViewMode] = useState<'list' | 'bracket'>('list');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [shareToast, setShareToast] = useState<string | null>(null);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);
  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  // Available round / group filters
  const filterOptions = [
    { id: 'all', label: 'সকল ম্যাচ' },
    ...activeTournament.groups.map((g) => ({ id: g, label: g })),
    { id: 'কোয়ার্টার ফাইনাল', label: 'কোয়ার্টার ফাইনাল' },
    { id: 'সেমিফাইনাল', label: 'সেমিফাইনাল' },
    { id: 'ফাইনাল', label: 'ফাইনাল' },
    { id: 'প্রীতি ম্যাচ', label: 'প্রীতি ম্যাচ' },
  ];

  const filteredMatches = matches.filter((m) => {
    // Round or Group filter
    if (selectedFilter !== 'all') {
      const matchInGroup = m.group === selectedFilter;
      const matchInRound = m.round === selectedFilter;
      if (!matchInGroup && !matchInRound) return false;
    }
    // Status filter
    if (statusFilter !== 'all' && m.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleShare = async (e: React.MouseEvent, m: typeof matches[0]) => {
    e.stopPropagation();
    const t1 = getTeam(m.team1Id);
    const t2 = getTeam(m.team2Id);
    const text = generateMatchShareSummary(
      m,
      t1,
      t2,
      orgSettings.orgName,
      activeTournament.name,
      useBengaliNumerals
    );
    const res = await shareMatchSummary(text, `${t1?.name} বনাম ${t2?.name}`);
    if (res.success) {
      setShareToast(res.method === 'clipboard' ? 'ম্যাচ তথ্য কপি হয়েছে!' : 'শেয়ার সম্পন্ন!');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* View Mode Switcher: Match List vs Knockout Bracket Tree */}
      <div className="flex bg-[#061e18] p-1 rounded-2xl border border-emerald-900/60 shadow">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 min-h-[40px] py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'list'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>ম্যাচ তালিকা ভিউ</span>
        </button>
        <button
          onClick={() => setViewMode('bracket')}
          className={`flex-1 min-h-[40px] py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'bracket'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>নকআউট বন্ধনী (ট্রি ভিউ)</span>
        </button>
      </div>

      {/* Render Knockout Bracket Tree when active */}
      {viewMode === 'bracket' ? (
        <KnockoutBracketView
          matches={matches}
          teams={teams}
          useBengaliNumerals={useBengaliNumerals}
        />
      ) : (
        <>
          {/* Category / Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedFilter === f.id
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                    : 'bg-[#082019] text-slate-300 border-emerald-900/60 hover:bg-[#0a2920]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Secondary Status Filter */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <span className="font-semibold text-slate-300">
              মোট ম্যাচ: {num(filteredMatches.length)}টি
            </span>

            <div className="flex items-center gap-1 bg-[#061914] p-1 rounded-lg border border-emerald-900/40">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'all' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  statusFilter === 'live' ? 'bg-red-900 text-red-200' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                লাইভ
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'upcoming' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                আসন্ন
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'completed' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ফলাফল
              </button>
            </div>
          </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="rounded-2xl bg-[#082019] border border-emerald-900/60 p-8 text-center text-slate-400">
            <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">কোনো ম্যাচ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        ) : (
          filteredMatches.map((m) => {
            const team1 = getTeam(m.team1Id);
            const team2 = getTeam(m.team2Id);

            return (
              <div
                key={m.id}
                onClick={() => onSelectLiveMatch && onSelectLiveMatch(m.id)}
                className={`rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border p-4 transition shadow-md cursor-pointer ${
                  m.status === 'live'
                    ? 'border-red-500/50 hover:border-red-400 shadow-red-950/20'
                    : 'border-emerald-900/60 hover:border-emerald-700/60'
                }`}
              >
                {/* Header: Round, Status & Share Button */}
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-900/40 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-amber-400 truncate">{m.round}</span>
                    {m.group && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 truncate">{m.group}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.status === 'live' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-bold text-[11px] border border-red-500/40">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        লাইভ
                      </span>
                    ) : m.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-medium text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        সমাপ্ত
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-medium text-[11px]">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {getMatchStatusLabel(m.status)}
                      </span>
                    )}

                    {/* Share Action */}
                    <button
                      onClick={(e) => handleShare(e, m)}
                      className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/40 transition"
                      title="ম্যাচ তথ্য শেয়ার করুন"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Teams & Score Row */}
                <div className="grid grid-cols-7 items-center gap-2 py-3">
                  {/* Team 1 */}
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-white text-xs shrink-0 shadow"
                      style={{ backgroundColor: team1?.color || '#10b981' }}
                    >
                      {team1?.shortName || 'T1'}
                    </div>
                    <span className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {team1?.name || 'দল ১'}
                    </span>
                  </div>

                  {/* Score or VS in Center */}
                  <div className="col-span-1 text-center">
                    {m.status === 'upcoming' ? (
                      <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-400 font-bold text-xs">
                        বনাম
                      </span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="font-display font-black text-lg sm:text-xl text-amber-400">
                          {num(m.team1Score)} - {num(m.team2Score)}
                        </div>
                        {m.hasPenaltyShootout && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-600/30 whitespace-nowrap mt-0.5">
                            পেনাল্টি: {num(m.team1PenaltyScore ?? 0)}-{num(m.team2PenaltyScore ?? 0)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="col-span-3 flex items-center justify-end gap-2.5 text-right min-w-0">
                    <span className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {team2?.name || 'দল ২'}
                    </span>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-white text-xs shrink-0 shadow"
                      style={{ backgroundColor: team2?.color || '#3b82f6' }}
                    >
                      {team2?.shortName || 'T2'}
                    </div>
                  </div>
                </div>

                {/* Match Venue, Referee & Date */}
                <div className="pt-2 border-t border-emerald-900/30 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex items-center gap-1 truncate text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{m.venue}</span>
                    </span>

                    {m.referee && (
                      <span className="hidden sm:flex items-center gap-1 text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>রেফারি: {m.referee}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.manOfTheMatchPlayerName && (
                      <div className="flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-600/30">
                        <Award className="w-3 h-3" />
                        <span>সেরা: {m.manOfTheMatchPlayerName}</span>
                      </div>
                    )}
                    <span className="text-slate-400">
                      {formatBengaliDate(m.date)} · {formatBengaliTime(m.time)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
};
