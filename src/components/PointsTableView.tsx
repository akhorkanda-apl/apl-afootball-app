import React, { useState } from 'react';
import { Trophy, Info, Users, UserCheck, Phone, X, Shield } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Team } from '../types/tournament';
import { toBengaliNumber } from '../utils/bengali';

export const PointsTableView: React.FC = () => {
  const { standingsByGroup, activeTournament, teams, matches, useBengaliNumerals } = useTournament();

  const groups = activeTournament.groups || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'গ্রুপ ক');
  const [viewMode, setViewMode] = useState<'table' | 'teams'>('table');
  const [selectedTeamModal, setSelectedTeamModal] = useState<Team | null>(null);

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  const standings = standingsByGroup[selectedGroup] || [];

  return (
    <div className="space-y-4 pb-20">
      {/* Group Selector & All Teams/Squads Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => {
              setSelectedGroup(g);
              setViewMode('table');
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition border flex items-center gap-2 ${
              viewMode === 'table' && selectedGroup === g
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                : 'bg-[#082019] text-slate-300 border-emerald-900/60 hover:bg-[#0a2920]'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{g} পয়েন্ট তালিকা</span>
          </button>
        ))}

        <button
          onClick={() => setViewMode('teams')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition border flex items-center gap-2 ${
            viewMode === 'teams'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
              : 'bg-[#082019] text-slate-300 border-emerald-900/60 hover:bg-[#0a2920]'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>সকল দল ও স্কোয়াড ({num(teams.length)})</span>
        </button>
      </div>

      {viewMode === 'teams' ? (
        /* Public All Teams & Squads Directory */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.length === 0 ? (
            <div className="sm:col-span-2 rounded-2xl bg-[#071d17] border border-emerald-900/60 p-8 text-center text-slate-400 text-xs">
              এই টুর্নামেন্টে এখনও কোনো দল যুক্ত করা হয়নি।
            </div>
          ) : (
            teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTeamModal(t)}
                className="text-left rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border border-emerald-900/60 hover:border-emerald-500/60 p-4 transition shadow-md space-y-2.5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-white text-sm shadow shrink-0 border border-white/15"
                      style={{ backgroundColor: t.color || '#10b981' }}
                    >
                      {t.shortName}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">{t.group}</span>
                        <span>·</span>
                        <span>খেলোয়াড়: {num(t.players.length)} জন</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50 shrink-0">
                    স্কোয়াড দেখুন
                  </span>
                </div>

                {t.managerName && (
                  <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">ম্যানেজার: {t.managerName}</span>
                    </span>
                    {t.managerPhone && (
                      <span className="text-[11px] font-mono text-amber-300 shrink-0">
                        {num(t.managerPhone)}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      ) : (
        /* Standings Table Card */
        <div className="rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border border-emerald-900/60 overflow-hidden shadow-lg">
          {/* Table Title Bar */}
          <div className="px-4 py-3 bg-[#061e18] border-b border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">{selectedGroup} এর অবস্থান</h3>
              <span className="text-xs text-emerald-400 font-medium">
                (দলের নামে ক্লিক করে স্কোয়াড দেখুন)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              মোট দল: {num(standings.length)}টি
            </span>
          </div>

          {/* Table Container with Horizontal Scroll for Small Screens */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#051510] text-slate-400 border-b border-emerald-900/40 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold text-center w-8">#</th>
                  <th className="py-2.5 px-3 font-semibold">দল</th>
                  <th className="py-2.5 px-2 font-semibold text-center" title="ম্যাচ খেলেছে">ম্যা</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-emerald-400" title="জয়">জ</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-amber-400" title="ড্র">ড্র</th>
                  <th className="py-2.5 px-2 font-semibold text-center text-red-400" title="হার">হা</th>
                  <th className="py-2.5 px-2 font-semibold text-center" title="পক্ষে গোল">গো+</th>
                  <th className="py-2.5 px-2 font-semibold text-center" title="বিপক্ষে গোল">গো-</th>
                  <th className="py-2.5 px-2 font-semibold text-center font-bold" title="গোল ব্যবধান">ব্যব</th>
                  <th className="py-2.5 px-3 font-bold text-center text-amber-400" title="মোট পয়েন্ট">পয়েন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60 font-medium">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      এই গ্রুপে এখনও কোনো দল যোগ করা হয়নি।
                    </td>
                  </tr>
                ) : (
                  standings.map((row, idx) => {
                    const isQualifying = idx < 2; // Top 2 qualify
                    const gdSign = row.goalDifference > 0 ? '+' : '';
                    const teamObj = teams.find((t) => t.id === row.teamId);

                    return (
                      <tr
                        key={row.teamId}
                        onClick={() => teamObj && setSelectedTeamModal(teamObj)}
                        className={`hover:bg-emerald-950/50 transition cursor-pointer ${
                          isQualifying ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        {/* Rank Position */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                              idx === 0
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950 shadow-sm'
                                : 'text-slate-400'
                            }`}
                          >
                            {num(idx + 1)}
                          </span>
                        </td>

                        {/* Team Name with Color Badge */}
                        <td className="py-3 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: row.teamColor || '#10b981' }}
                            />
                            <div className="min-w-0">
                              <span className="truncate block font-bold text-slate-100">
                                {row.teamName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal block truncate">
                                {row.teamShortName}
                                {teamObj?.managerName ? ` · ম্যানেজার: ${teamObj.managerName}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Matches Played */}
                        <td className="py-3 px-2 text-center text-slate-300 tabular-nums">
                          {num(row.played)}
                        </td>

                        {/* Won */}
                        <td className="py-3 px-2 text-center text-emerald-300 font-semibold tabular-nums">
                          {num(row.won)}
                        </td>

                        {/* Drawn */}
                        <td className="py-3 px-2 text-center text-amber-300 tabular-nums">
                          {num(row.drawn)}
                        </td>

                        {/* Lost */}
                        <td className="py-3 px-2 text-center text-red-300 tabular-nums">
                          {num(row.lost)}
                        </td>

                        {/* Goals For */}
                        <td className="py-3 px-2 text-center text-slate-300 tabular-nums">
                          {num(row.goalsFor)}
                        </td>

                        {/* Goals Against */}
                        <td className="py-3 px-2 text-center text-slate-300 tabular-nums">
                          {num(row.goalsAgainst)}
                        </td>

                        {/* Goal Difference */}
                        <td className="py-3 px-2 text-center font-bold tabular-nums">
                          <span
                            className={
                              row.goalDifference > 0
                                ? 'text-emerald-400'
                                : row.goalDifference < 0
                                ? 'text-red-400'
                                : 'text-slate-400'
                            }
                          >
                            {row.goalDifference > 0 ? gdSign : ''}
                            {num(row.goalDifference)}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-display font-black text-amber-400 text-sm tabular-nums">
                            {num(row.points)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Legend / Info Footer */}
          <div className="p-3 bg-[#061813] border-t border-emerald-900/40 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>১ম ও ২য় দল সেমিফাইনালে খেলবে</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>জয় = ৩ পয়েন্ট | ড্র = ১ পয়েন্ট | হার = ০</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Full Squad & Details Modal (Public Read-Only A-to-Z View) */}
      {selectedTeamModal && (
        <div
          onClick={() => setSelectedTeamModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 text-slate-100 shadow-2xl my-auto space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-white text-base shadow-lg border border-white/20 shrink-0"
                  style={{ backgroundColor: selectedTeamModal.color || '#10b981' }}
                >
                  {selectedTeamModal.shortName}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {selectedTeamModal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-amber-400 font-semibold">{selectedTeamModal.group}</span>
                    <span>·</span>
                    <span>মোট খেলোয়াড়: {num(selectedTeamModal.players.length)} জন</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Manager Card */}
            {selectedTeamModal.managerName && (
              <div className="p-3 rounded-2xl bg-[#061e18] border border-emerald-800/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      টিম ম্যানেজার
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-white truncate">
                      {selectedTeamModal.managerName}
                    </div>
                  </div>
                </div>
                {selectedTeamModal.managerPhone && (
                  <a
                    href={`tel:${selectedTeamModal.managerPhone.replace(/[^\d+]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{num(selectedTeamModal.managerPhone)}</span>
                  </a>
                )}
              </div>
            )}

            {/* Full Player Roster */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>পূর্ণ খেলোয়াড় স্কোয়াড তালিকা</span>
              </h4>

              {selectedTeamModal.players.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-800/40 rounded-xl">
                  এই দলের খেলোয়াড় তালিকা এখনও যুক্ত করা হয়নি।
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {selectedTeamModal.players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-display font-black text-amber-400 text-xs shrink-0">
                          #{num(p.jerseyNumber)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.position}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Matches Summary */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                মোট নির্ধারিত ম্যাচ:{' '}
                <strong className="text-white">
                  {num(
                    matches.filter(
                      (m) =>
                        m.team1Id === selectedTeamModal.id ||
                        m.team2Id === selectedTeamModal.id
                    ).length
                  )}
                  টি
                </strong>
              </span>
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
