import React from 'react';
import { Trophy, ChevronRight, Award } from 'lucide-react';
import { Match, Team } from '../types/tournament';
import { toBengaliNumber } from '../utils/bengali';

interface KnockoutBracketViewProps {
  matches: Match[];
  teams: Team[];
  useBengaliNumerals?: boolean;
}

export const KnockoutBracketView: React.FC<KnockoutBracketViewProps> = ({
  matches,
  teams,
  useBengaliNumerals = true,
}) => {
  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));
  const getTeam = (id: string) => teams.find((t) => t.id === id);

  const quarterMatches = matches.filter((m) => m.round.includes('কোয়ার্টার') || m.round.includes('কোয়ার্টার'));
  const semiMatches = matches.filter((m) => m.round.includes('সেমিফাইনাল'));
  const finalMatches = matches.filter((m) => m.round.includes('ফাইনাল') && !m.round.includes('সেমি') && !m.round.includes('কোয়ার্টার'));

  const finalMatch = finalMatches[0];
  const championTeam =
    finalMatch && finalMatch.status === 'completed'
      ? finalMatch.team1Score > finalMatch.team2Score
        ? getTeam(finalMatch.team1Id)
        : finalMatch.team2Score > finalMatch.team1Score
        ? getTeam(finalMatch.team2Id)
        : (finalMatch.team1PenaltyScore || 0) > (finalMatch.team2PenaltyScore || 0)
        ? getTeam(finalMatch.team1Id)
        : getTeam(finalMatch.team2Id)
      : null;

  const renderMatchNode = (m: Match) => {
    const t1 = getTeam(m.team1Id);
    const t2 = getTeam(m.team2Id);
    const isCompleted = m.status === 'completed';

    const t1Won =
      isCompleted &&
      (m.team1Score > m.team2Score ||
        (m.team1Score === m.team2Score && (m.team1PenaltyScore || 0) > (m.team2PenaltyScore || 0)));
    const t2Won =
      isCompleted &&
      (m.team2Score > m.team1Score ||
        (m.team1Score === m.team2Score && (m.team2PenaltyScore || 0) > (m.team1PenaltyScore || 0)));

    return (
      <div
        key={m.id}
        className="w-52 rounded-xl bg-[#061e18] border border-emerald-800/60 p-2.5 shadow text-xs space-y-1.5"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-emerald-950 pb-1">
          <span className="font-semibold text-amber-400">{m.round}</span>
          <span>{m.date.slice(5)}</span>
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg ${
            t1Won ? 'bg-emerald-950/80 font-bold text-white' : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: t1?.color }}
            />
            <span className="truncate text-xs">{t1?.shortName || t1?.name || 'দল ১'}</span>
          </div>
          <span className="font-display font-bold text-amber-400 text-xs shrink-0 ml-1">
            {isCompleted || m.status === 'live' ? num(m.team1Score) : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg ${
            t2Won ? 'bg-emerald-950/80 font-bold text-white' : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: t2?.color }}
            />
            <span className="truncate text-xs">{t2?.shortName || t2?.name || 'দল ২'}</span>
          </div>
          <span className="font-display font-bold text-amber-400 text-xs shrink-0 ml-1">
            {isCompleted || m.status === 'live' ? num(m.team2Score) : '-'}
          </span>
        </div>

        {m.hasPenaltyShootout && (
          <div className="text-[10px] text-center text-amber-300 font-bold bg-amber-950/60 py-0.5 rounded">
            পেনাল্টি: {num(m.team1PenaltyScore ?? 0)}-{num(m.team2PenaltyScore ?? 0)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#08241c] to-[#041410] border border-emerald-900/60 p-4 overflow-x-auto shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 mb-4 min-w-[550px]">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">নকআউট টুর্নামেন্ট বন্ধনী (ট্রি ভিউ)</h3>
        </div>
        <span className="text-xs text-emerald-400 font-medium">কোয়ার্টার ➔ সেমিফাইনাল ➔ ফাইনাল</span>
      </div>

      <div className="flex items-center justify-start gap-6 min-w-[620px] py-2">
        {/* Quarter Finals (if any) */}
        {quarterMatches.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 text-center uppercase tracking-wide">
              কোয়ার্টার ফাইনাল
            </h4>
            <div className="space-y-3">{quarterMatches.map(renderMatchNode)}</div>
          </div>
        )}

        {/* Semi Finals */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-400 text-center uppercase tracking-wide">
            সেমিফাইনাল
          </h4>
          <div className="space-y-6">
            {semiMatches.length > 0 ? (
              semiMatches.map(renderMatchNode)
            ) : (
              <div className="w-52 p-4 rounded-xl border border-dashed border-emerald-800 text-center text-xs text-slate-500">
                সেমিফাইনাল ফিক্সচার বাকি
              </div>
            )}
          </div>
        </div>

        {/* Final */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-400 text-center uppercase tracking-wide">
            গ্র্যান্ড ফাইনাল
          </h4>
          <div className="flex flex-col items-center justify-center">
            {finalMatch ? (
              renderMatchNode(finalMatch)
            ) : (
              <div className="w-52 p-4 rounded-xl border border-dashed border-emerald-800 text-center text-xs text-slate-500">
                ফাইনাল ফিক্সচার বাকি
              </div>
            )}

            {/* Champion Badge */}
            {championTeam && (
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-center shadow-lg w-52 gold-badge-glow">
                <span className="text-2xl block">🏆</span>
                <span className="text-[10px] uppercase font-bold tracking-widest block mt-0.5">
                  চ্যাম্পিয়ন দল ২০২৬
                </span>
                <span className="text-sm font-extrabold block truncate">
                  {championTeam.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
