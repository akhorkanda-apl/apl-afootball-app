import React, { useState } from 'react';
import { Award, Flame, Target, Star, BarChart3, Shield, Sparkles } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { toBengaliNumber } from '../utils/bengali';

export const StatsView: React.FC = () => {
  const { topScorers, topMoMs, matches, activeTournament, useBengaliNumerals } = useTournament();
  const [activeSubTab, setActiveSubTab] = useState<'scorers' | 'mom'>('scorers');

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  // Compute tournament overview metrics
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const totalGoals = matches.reduce((acc, m) => acc + m.team1Score + m.team2Score, 0);
  const avgGoals =
    completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : '0';

  const goldenBootLeader = topScorers[0];
  const hasTournamentAwards =
    activeTournament.playerOfTournament ||
    activeTournament.bestGoalkeeper ||
    goldenBootLeader;

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Official Tournament Awards Showcase (টুর্নামেন্ট সেরা সম্মাননা) */}
      {hasTournamentAwards && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#07241c] to-[#041510] border-2 border-amber-500/50 p-4 shadow-xl gold-badge-glow relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  অফিসিয়াল টুর্নামেন্ট সেরা পুরস্কার ও ট্রফি
                </h3>
                <p className="text-[10px] text-slate-400">{activeTournament.name}</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
              হল অব ফেম
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Player of Tournament */}
            {activeTournament.playerOfTournament && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow">
                  <Award className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    টুর্নামেন্ট সেরা খেলোয়াড়
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {activeTournament.playerOfTournament}
                  </h4>
                  {activeTournament.playerOfTournamentTeam && (
                    <span className="text-[11px] text-slate-400 truncate block">
                      {activeTournament.playerOfTournamentTeam}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Best Goalkeeper (Golden Glove) */}
            {activeTournament.bestGoalkeeper && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    সেরা গোলরক্ষক (গোল্ডেন গ্লাভস)
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {activeTournament.bestGoalkeeper}
                  </h4>
                  {activeTournament.bestGoalkeeperTeam && (
                    <span className="text-[11px] text-slate-400 truncate block">
                      {activeTournament.bestGoalkeeperTeam}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Golden Boot Leader */}
            {goldenBootLeader && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow text-lg">
                  ⚽
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    গোল্ডেন বুট (শীর্ষ গোলদাতা)
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {goldenBootLeader.playerName}
                  </h4>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {num(goldenBootLeader.goals)} গোল · {goldenBootLeader.teamName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Tournament KPI Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#09261e] to-[#051813] border border-emerald-800/40 text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-900/60 flex items-center justify-center text-emerald-400 mx-auto mb-1">
            <Target className="w-4 h-4" />
          </div>
          <div className="font-display font-black text-xl text-amber-400">
            {num(totalGoals)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">মোট গোল</div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#09261e] to-[#051813] border border-emerald-800/40 text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-900/60 flex items-center justify-center text-emerald-400 mx-auto mb-1">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="font-display font-black text-xl text-emerald-400">
            {num(completedMatches.length)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">সমাপ্ত ম্যাচ</div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#09261e] to-[#051813] border border-emerald-800/40 text-center shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-900/60 flex items-center justify-center text-amber-400 mx-auto mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <div className="font-display font-black text-xl text-amber-400">
            {num(avgGoals)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">গড় গোল / ম্যাচ</div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation (Scorers vs MOTM) */}
      <div className="flex rounded-xl bg-[#061c16] p-1 border border-emerald-900/40">
        <button
          onClick={() => setActiveSubTab('scorers')}
          className={`flex-1 min-h-[44px] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'scorers'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>শীর্ষ গোলদাতা (গোল্ডেন বুট)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mom')}
          className={`flex-1 min-h-[44px] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'mom'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>ম্যান অফ দ্য ম্যাচ বিজয়ী</span>
        </button>
      </div>

      {/* 4. Top Scorers Leaderboard */}
      {activeSubTab === 'scorers' && (
        <div className="rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border border-emerald-900/60 p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <h3 className="text-sm font-bold text-white">সর্বোচ্চ গোলদাতা তালিকা</h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              গোল্ডেন বুট রেস
            </span>
          </div>

          {topScorers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              এই টুর্নামেন্টে এখনও কোনো গোল নথিভুক্ত হয়নি।
            </div>
          ) : (
            <div className="space-y-2">
              {topScorers.map((scorer, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={`${scorer.playerName}-${scorer.teamName}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isTop1
                        ? 'bg-gradient-to-r from-amber-950/40 via-emerald-950/40 to-[#061c16] border-amber-500/40 shadow-sm'
                        : 'bg-[#061813] border-emerald-950 hover:border-emerald-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isTop1
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow'
                            : isTop2
                            ? 'bg-slate-300 text-slate-950'
                            : isTop3
                            ? 'bg-amber-800 text-amber-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {num(idx + 1)}
                      </span>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center gap-1.5">
                          <span>{scorer.playerName}</span>
                          {isTop1 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: scorer.teamColor }}
                          />
                          <span className="truncate">{scorer.teamName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-800/30">
                      <span className="text-xs">⚽</span>
                      <span className="font-display font-black text-base text-amber-400">
                        {num(scorer.goals)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">গোল</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Most Man of the Match Winners Leaderboard */}
      {activeSubTab === 'mom' && (
        <div className="rounded-2xl bg-gradient-to-b from-[#08221b] to-[#051813] border border-emerald-900/60 p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">ম্যান অব দ্য ম্যাচ অ্যাওয়ার্ড</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">
              টুর্নামেন্ট সেরা তারকা
            </span>
          </div>

          {topMoMs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              এই টুর্নামেন্টে এখনও কোনো খেলোয়াড়কে ম্যান অব দ্য ম্যাচ নির্বাচিত করা হয়নি।
            </div>
          ) : (
            <div className="space-y-2">
              {topMoMs.map((player, idx) => (
                <div
                  key={`${player.playerName}-${player.teamName}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#061813] border border-emerald-950 hover:border-emerald-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      {num(idx + 1)}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {player.playerName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: player.teamColor }}
                        />
                        <span className="truncate">{player.teamName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-600/30">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-display font-black text-base text-amber-300">
                      {num(player.awardsCount)}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-medium">বার সেরা</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
