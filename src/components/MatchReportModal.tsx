import React from 'react';
import { Printer, X, Award, MapPin, UserCheck, CheckCircle } from 'lucide-react';
import { Match, Team } from '../types/tournament';
import { formatBengaliDate, formatBengaliTime, toBengaliNumber } from '../utils/bengali';
import { AplLogo } from './AplLogo';

interface MatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  team1?: Team;
  team2?: Team;
  tournamentName: string;
  orgName: string;
  useBengaliNumerals?: boolean;
}

export const MatchReportModal: React.FC<MatchReportModalProps> = ({
  isOpen,
  onClose,
  match,
  team1,
  team2,
  tournamentName,
  orgName,
  useBengaliNumerals = true,
}) => {
  if (!isOpen) return null;

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  const handlePrint = () => {
    window.print();
  };

  const goals = match.events.filter((e) => e.type === 'goal');
  const cards = match.events.filter((e) => e.type === 'yellow_card' || e.type === 'red_card');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl relative print:border-none print:shadow-none print:bg-white print:text-black my-auto">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white">অফিসিয়াল ম্যাচ রিপোর্ট শিট</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / সেভ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Match Sheet */}
        <div className="pt-4 space-y-4 print:pt-0">
          {/* Header Lockup */}
          <div className="text-center pb-4 border-b border-emerald-900/60 print:border-slate-300">
            <div className="flex justify-center mb-2">
              <AplLogo size="lg" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white print:text-slate-950 font-display uppercase tracking-wide">
              {orgName}
            </h1>
            <h2 className="text-sm font-bold text-amber-400 print:text-slate-800 mt-0.5">
              {tournamentName}
            </h2>
            <p className="text-xs text-slate-300 print:text-slate-600 font-medium mt-1">
              {match.round} {match.group ? `· ${match.group}` : ''}
            </p>
          </div>

          {/* Match Score Strip */}
          <div className="p-4 rounded-2xl bg-[#061e18] border border-emerald-800/60 print:bg-slate-50 print:border-slate-300">
            <div className="grid grid-cols-7 items-center text-center">
              <div className="col-span-3">
                <span className="text-base sm:text-lg font-black text-white print:text-slate-950 block">
                  {team1?.name}
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600 font-semibold">
                  {team1?.shortName}
                </span>
              </div>

              <div className="col-span-1">
                <div className="font-display font-black text-3xl text-amber-400 print:text-slate-950">
                  {num(match.team1Score)} - {num(match.team2Score)}
                </div>
                {match.hasPenaltyShootout && (
                  <span className="text-[11px] font-bold text-amber-300 print:text-slate-700 block mt-0.5">
                    পেনাল্টি: {num(match.team1PenaltyScore ?? 0)} - {num(match.team2PenaltyScore ?? 0)}
                  </span>
                )}
              </div>

              <div className="col-span-3">
                <span className="text-base sm:text-lg font-black text-white print:text-slate-950 block">
                  {team2?.name}
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600 font-semibold">
                  {team2?.shortName}
                </span>
              </div>
            </div>
          </div>

          {/* Venue, Date & Referee Strip */}
          <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-800/50 print:bg-white print:border print:border-slate-300 text-slate-300 print:text-slate-800">
            <div className="space-y-1">
              <div>
                <strong className="text-white print:text-black">তারিখ ও সময়:</strong>{' '}
                {formatBengaliDate(match.date)} · {formatBengaliTime(match.time)}
              </div>
              <div>
                <strong className="text-white print:text-black">ম্যাচ ভেন্যু:</strong> {match.venue}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <strong className="text-white print:text-black">ম্যাচ রেফারি:</strong>{' '}
                {match.referee || 'নির্ধারিত রেফারি'}
              </div>
              <div>
                <strong className="text-white print:text-black">ম্যাচের অবস্থা:</strong>{' '}
                {match.status === 'completed' ? 'সমাপ্ত' : 'চলমান'}
              </div>
            </div>
          </div>

          {/* Goal Scorers Table */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 print:text-black mb-2 uppercase tracking-wide">
              ⚽ গোল বিবরণী:
            </h4>
            {goals.length === 0 ? (
              <p className="text-xs text-slate-400 print:text-slate-600 italic">কোনো গোল হয়নি।</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {goals.map((g) => {
                  const gTeam = g.teamId === match.team1Id ? team1?.name : team2?.name;
                  return (
                    <div
                      key={g.id}
                      className="p-2 rounded-lg bg-slate-800/60 print:bg-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-amber-400 print:text-black">
                          {num(g.minute)}'
                        </span>
                        <span className="font-bold text-white print:text-black">{g.playerName}</span>
                        {g.detail && (
                          <span className="text-[10px] text-slate-400 print:text-slate-600">
                            ({g.detail})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 print:text-slate-700">{gTeam}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Man of the Match */}
          {match.manOfTheMatchPlayerName && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 print:bg-slate-100 print:border-slate-300 flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 print:text-slate-800 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-400 print:text-slate-700 font-bold uppercase tracking-wider block">
                  ম্যান অব দ্য ম্যাচ (ম্যাচ সেরা)
                </span>
                <span className="text-sm font-bold text-white print:text-black">
                  {match.manOfTheMatchPlayerName}
                </span>
              </div>
            </div>
          )}

          {/* Official Signatures Area */}
          <div className="pt-8 grid grid-cols-2 gap-6 text-center text-xs text-slate-300 print:text-black border-t border-slate-800 print:border-slate-400">
            <div>
              <div className="border-b border-slate-600 print:border-black w-36 mx-auto mb-1 h-8" />
              <span className="font-bold">প্রধান রেফারি স্বাক্ষর</span>
              <p className="text-[10px] text-slate-400 print:text-slate-600">Match Referee</p>
            </div>
            <div>
              <div className="border-b border-slate-600 print:border-black w-36 mx-auto mb-1 h-8" />
              <span className="font-bold">টুর্নামেন্ট পরিচালক স্বাক্ষর</span>
              <p className="text-[10px] text-slate-400 print:text-slate-600">Tournament Secretary</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
