import React, { useState } from 'react';
import { Trophy, Info } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { toBengaliNumber } from '../utils/bengali';

export const PointsTableView: React.FC = () => {
  const { standingsByGroup, activeTournament, useBengaliNumerals } = useTournament();

  const groups = activeTournament.groups || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'গ্রুপ ক');

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  const standings = standingsByGroup[selectedGroup] || [];

  return (
    <div className="space-y-4 pb-20">
      {/* Group Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition border flex items-center gap-2 ${
              selectedGroup === g
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                : 'bg-[#082019] text-slate-300 border-emerald-900/60 hover:bg-[#0a2920]'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{g} পয়েন্ট তালিকা</span>
          </button>
        ))}
      </div>

      {/* Standings Table Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border border-emerald-900/60 overflow-hidden shadow-lg">
        {/* Table Title Bar */}
        <div className="px-4 py-3 bg-[#061e18] border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{selectedGroup} এর অবস্থান</h3>
            <span className="text-xs text-emerald-400 font-medium">
              (শীর্ষ ২ দল সেমিফাইনালে উত্তীর্ণ)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
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

                  return (
                    <tr
                      key={row.teamId}
                      className={`hover:bg-emerald-950/40 transition ${
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
                            <span className="text-[10px] text-slate-400 font-normal block">
                              {row.teamShortName}
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
    </div>
  );
};
