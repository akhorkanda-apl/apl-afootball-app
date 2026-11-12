import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Flame,
  Calendar,
  Sparkles,
  Share2,
  UserCheck,
  Check,
  FileText,
  Users,
  Volume2,
  Radio,
  ListOrdered,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import {
  formatBengaliDate,
  formatBengaliTime,
  formatTimer,
  generateMatchShareSummary,
  getMatchHalfLabel,
  getMatchStatusLabel,
  shareMatchSummary,
  toBengaliNumber,
} from '../utils/bengali';
import { MatchReportModal } from './MatchReportModal';
import { LineupModal } from './LineupModal';
import { soundEffects } from '../utils/audio';

interface LiveMatchViewProps {
  onOpenLiveController?: (matchId: string) => void;
}

export const LiveMatchView: React.FC<LiveMatchViewProps> = ({ onOpenLiveController }) => {
  const {
    matches,
    teams,
    activeTournament,
    orgSettings,
    activeLiveMatch,
    setActiveLiveMatchId,
    useBengaliNumerals,
    isAdmin,
  } = useTournament();

  const [lastScoredTotal, setLastScoredTotal] = useState<number>(0);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'events' | 'commentary'>('events');

  // Trigger celebration confetti and goal chime on score increment
  useEffect(() => {
    if (activeLiveMatch) {
      const totalGoals = activeLiveMatch.team1Score + activeLiveMatch.team2Score;
      if (lastScoredTotal !== 0 && totalGoals > lastScoredTotal) {
        try {
          soundEffects.playGoalChime();
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#ffffff'],
          });
        } catch {
          // ignore
        }
      }
      setLastScoredTotal(totalGoals);
    }
  }, [activeLiveMatch?.team1Score, activeLiveMatch?.team2Score]);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);
  const num = (v: number | string) =>
    useBengaliNumerals ? toBengaliNumber(v) : String(v);

  const liveMatches = matches.filter((m) => m.status === 'live');
  const recentCompleted = matches
    .filter((m) => m.status === 'completed')
    .slice(0, 3);
  const nextUpcoming = matches.find((m) => m.status === 'upcoming');

  const match = activeLiveMatch;
  const team1 = match ? getTeam(match.team1Id) : null;
  const team2 = match ? getTeam(match.team2Id) : null;

  // Handle Share
  const handleShareMatch = async (targetMatch = match) => {
    if (!targetMatch) return;
    const t1 = getTeam(targetMatch.team1Id);
    const t2 = getTeam(targetMatch.team2Id);
    const summary = generateMatchShareSummary(
      targetMatch,
      t1,
      t2,
      orgSettings.orgName,
      activeTournament.name,
      useBengaliNumerals
    );

    const res = await shareMatchSummary(summary, `${t1?.name || 'দল ১'} বনাম ${t2?.name || 'দল ২'} - ম্যাচ সারাংশ`);
    if (res.success) {
      if (res.method === 'clipboard') {
        setShareToast('ম্যাচ সারাংশ কপি হয়েছে! হোয়াটসঅ্যাপ বা ফেসবুকে পেস্ট করুন।');
      } else {
        setShareToast('ম্যাচ সারাংশ শেয়ার সম্পন্ন হয়েছে!');
      }
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification for Share */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Multiple Live Match Switcher Bar */}
      {liveMatches.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-semibold text-emerald-400 shrink-0">
            চলমান খেলাসমূহ:
          </span>
          {liveMatches.map((m) => {
            const t1 = getTeam(m.team1Id);
            const t2 = getTeam(m.team2Id);
            const isSelected = activeLiveMatch?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveLiveMatchId(m.id)}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                    : 'bg-emerald-950/60 text-slate-300 border-emerald-800/40 hover:bg-emerald-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>
                  {t1?.shortName || 'দল ১'} {num(m.team1Score)} - {num(m.team2Score)} {t2?.shortName || 'দল ২'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Live Score Card */}
      {match ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a271f] via-[#061e18] to-[#041510] border border-emerald-800/50 shadow-xl stadium-card-glow">
          {/* Subtle background field lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-400" />
          </div>

          {/* Top Info Bar */}
          <div className="relative z-10 px-4 py-2.5 border-b border-emerald-900/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="font-bold text-amber-400 truncate">{match.round}</span>
              {match.group && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 truncate">{match.group}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {match.status === 'live' ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold tracking-wide text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>লাইভ</span>
                </div>
              ) : (
                <span className="text-slate-400 font-medium">
                  {getMatchStatusLabel(match.status)}
                </span>
              )}

              {/* Sound Whistle Effect */}
              <button
                onClick={() => soundEffects.playWhistle(true)}
                className="min-h-[36px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 hover:text-white border border-emerald-800/60 text-xs font-semibold transition active:scale-95"
                title="রেফারির বাঁশি বাজান"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">বাঁশি</span>
              </button>

              {/* Squad Lineup Button */}
              <button
                onClick={() => setShowLineupModal(true)}
                className="min-h-[36px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/60 text-xs font-semibold transition active:scale-95"
                title="উভয় দলের লাইন-আপ ও পিচ ভিউ দেখুন"
              >
                <Users className="w-3.5 h-3.5" />
                <span>লাইন-আপ</span>
              </button>

              {/* Official Match Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="min-h-[36px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/60 text-xs font-semibold transition active:scale-95"
                title="অফিসিয়াল ম্যাচ রিপোর্ট ও শিট ডাউনলোড"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">রিপোর্ট</span>
              </button>

              {/* One-Click Share Button */}
              <button
                onClick={() => handleShareMatch(match)}
                className="min-h-[36px] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 text-xs font-semibold transition active:scale-95"
                title="ফলাফল ও লাইভ স্কোর শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার</span>
              </button>
            </div>
          </div>

          {/* Central Scoreboard Arena */}
          <div className="relative z-10 px-4 pt-4 pb-3">
            {/* Live Clock & Half status */}
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-700/40 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-display font-bold text-amber-400 text-sm tracking-wider">
                  {useBengaliNumerals
                    ? formatTimer(match.elapsedSeconds)
                    : `${Math.floor(match.elapsedSeconds / 60)}:${match.elapsedSeconds % 60 < 10 ? '0' : ''}${match.elapsedSeconds % 60}`}
                </span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs font-semibold text-slate-300">
                  {getMatchHalfLabel(match.currentHalf)}
                </span>
              </div>
            </div>

            {/* Teams & Score Display */}
            <div className="grid grid-cols-7 items-center gap-2 py-1">
              {/* Team 1 */}
              <div className="col-span-3 flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/10 mb-2 relative"
                  style={{ backgroundColor: team1?.color || '#10b981' }}
                >
                  <span className="font-display font-black text-white text-base sm:text-lg drop-shadow">
                    {team1?.shortName || 'T1'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                  {team1?.name || 'দল ১'}
                </h3>
                {team1?.managerName && (
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
                    ম্যানেজার: {team1.managerName}
                  </span>
                )}
              </div>

              {/* Score Center */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 font-display font-black text-3xl sm:text-4xl text-amber-400 tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                  <span>{num(match.team1Score)}</span>
                  <span className="text-slate-500 text-2xl font-light">-</span>
                  <span>{num(match.team2Score)}</span>
                </div>

                {/* Penalty Shootout Badge (টাইব্রেকার) */}
                {match.hasPenaltyShootout && (
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[10px] sm:text-[11px] font-bold text-amber-300 whitespace-nowrap shadow-sm">
                    পেনাল্টি: {num(match.team1PenaltyScore ?? 0)} - {num(match.team2PenaltyScore ?? 0)}
                  </div>
                )}
                {!match.hasPenaltyShootout && (
                  <span className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider mt-0.5">
                    স্কোর
                  </span>
                )}
              </div>

              {/* Team 2 */}
              <div className="col-span-3 flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/10 mb-2 relative"
                  style={{ backgroundColor: team2?.color || '#3b82f6' }}
                >
                  <span className="font-display font-black text-white text-base sm:text-lg drop-shadow">
                    {team2?.shortName || 'T2'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                  {team2?.name || 'দল ২'}
                </h3>
                {team2?.managerName && (
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
                    ম্যানেজার: {team2.managerName}
                  </span>
                )}
              </div>
            </div>

            {/* Match Specific Venue & Referee Details */}
            <div className="mt-3 pt-3 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium truncate">{match.venue}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {match.referee && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>রেফারি: <strong className="text-white">{match.referee}</strong></span>
                  </div>
                )}
                <span className="text-slate-400">
                  {formatBengaliDate(match.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Live Controller Shortcut */}
          {isAdmin && onOpenLiveController && (
            <div className="px-4 py-2 bg-emerald-950/80 border-t border-emerald-800/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                অ্যাডমিন: স্কোর, পেনাল্টি ও ঘড়ি নিয়ন্ত্রণ করুন
              </span>
              <button
                onClick={() => onOpenLiveController(match.id)}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow"
              >
                কন্ট্রোলার
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-[#092019] border border-emerald-900/60 p-6 text-center text-slate-300">
          <Calendar className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-base font-bold text-white mb-1">
            বর্তমানে কোনো ম্যাচ লাইভ নেই
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            টুর্নামেন্টের পরবর্তী ফিক্সচার নিচে দেখুন অথবা অ্যাডমিন প্যানেল থেকে ম্যাচ শুরু করুন।
          </p>
        </div>
      )}

      {/* Feed Tabs: Events & Ball-by-Ball Commentary */}
      {match && (
        <div className="rounded-2xl bg-[#071d17] border border-emerald-900/50 p-4 space-y-3">
          {/* Sub-tab Switcher */}
          <div className="flex bg-[#051711] p-1 rounded-xl border border-emerald-900/50">
            <button
              onClick={() => setActiveFeedTab('events')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeFeedTab === 'events'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚽</span>
              <span>ম্যাচ মুহূর্ত ও গোল ({num(match.events.length)})</span>
            </button>
            <button
              onClick={() => setActiveFeedTab('commentary')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeFeedTab === 'commentary'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>লাইভ ধারাভাষ্য ({num(match.commentary?.length || 0)})</span>
            </button>
          </div>

          {/* 1. Events Timeline */}
          {activeFeedTab === 'events' && (
            <div>
              {match.events.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <ListOrdered className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 opacity-60" />
                  <span>এখনও কোনো গোল বা কার্ড নথিভুক্ত করা হয়নি।</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {match.events.map((ev) => {
                    const eventTeam = getTeam(ev.teamId);
                    const isT1 = ev.teamId === match.team1Id;

                    return (
                      <div
                        key={ev.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${
                          ev.type === 'goal'
                            ? 'bg-emerald-950/50 border-emerald-700/40 text-emerald-200'
                            : ev.type === 'red_card'
                            ? 'bg-red-950/40 border-red-800/40 text-red-200'
                            : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold font-display text-amber-400 shrink-0 border border-slate-700">
                            {num(ev.minute)}'
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {ev.type === 'goal' && <span>⚽</span>}
                              {ev.type === 'yellow_card' && (
                                <span className="w-3 h-4 rounded-xs bg-yellow-400 inline-block shadow-sm" />
                              )}
                              {ev.type === 'red_card' && (
                                <span className="w-3 h-4 rounded-xs bg-red-600 inline-block shadow-sm" />
                              )}
                              <span className="text-xs font-bold text-white truncate">
                                {ev.playerName}
                              </span>
                            </div>
                            {ev.detail && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {ev.detail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: eventTeam?.color || '#10b981' }}
                          />
                          <span className="text-xs font-semibold text-slate-300">
                            {eventTeam?.shortName || (isT1 ? 'দল ১' : 'দল ২')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Ball-by-Ball Live Commentary */}
          {activeFeedTab === 'commentary' && (
            <div>
              {!match.commentary || match.commentary.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <Radio className="w-6 h-6 text-amber-500 mx-auto mb-1.5 opacity-60" />
                  <span>লাইভ ধারাভাষ্য শিগগিরই শুরু হবে...</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    অ্যাডমিন কন্ট্রোলার থেকে ধারাভাষ্য পোস্ট করা যাবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {match.commentary.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        c.type === 'goal'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100'
                          : c.type === 'card'
                          ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                          : c.type === 'save'
                          ? 'bg-blue-950/40 border-blue-600/40 text-blue-200'
                          : c.type === 'highlight'
                          ? 'bg-purple-950/40 border-purple-600/40 text-purple-200'
                          : 'bg-[#08241c] border-emerald-900/40 text-slate-200'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold font-display text-amber-400 shrink-0 border border-slate-700">
                        {num(c.minute)}'
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {c.type === 'goal' && <span>⚽ [গোল]</span>}
                          {c.type === 'card' && <span>🟨 [কার্ড]</span>}
                          {c.type === 'save' && <span>🧤 [অসাধারণ সেভ]</span>}
                          {c.type === 'foul' && <span>🛑 [ফাউল]</span>}
                          {c.type === 'highlight' && <span>🔥 [হাইলাইটস]</span>}
                          {c.type === 'whistle' && <span>⏱️ [বাঁশি]</span>}
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-white leading-relaxed font-medium">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Man of the Match Card */}
      {match && match.manOfTheMatchPlayerName && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-[#071d17] border border-amber-500/40 p-4 shadow-lg gold-badge-glow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Award className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ম্যান অফ দ্য ম্যাচ (ম্যাচ সেরা)</span>
              </div>
              <h4 className="text-base font-extrabold text-white truncate leading-tight mt-0.5">
                {match.manOfTheMatchPlayerName}
              </h4>
              <p className="text-xs text-slate-300 truncate">
                {getTeam(match.manOfTheMatchTeamId || '')?.name || ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Upcoming Match Preview */}
      {nextUpcoming && (
        <div className="rounded-2xl bg-[#061c16] border border-emerald-900/40 p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-900/40 mb-3">
            <span className="text-xs font-bold text-slate-200">
              পরবর্তী আসন্ন ম্যাচ
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {formatBengaliDate(nextUpcoming.date)} · {formatBengaliTime(nextUpcoming.time)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getTeam(nextUpcoming.team1Id)?.color || '#10b981' }}
              />
              <span className="font-semibold text-white truncate">
                {getTeam(nextUpcoming.team1Id)?.name || 'দল ১'}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[11px] shrink-0 mx-2">
              বনাম
            </span>

            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <span className="font-semibold text-white truncate text-right">
                {getTeam(nextUpcoming.team2Id)?.name || 'দল ২'}
              </span>
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getTeam(nextUpcoming.team2Id)?.color || '#3b82f6' }}
              />
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-900/30 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>{nextUpcoming.venue}</span>
            </span>
            {nextUpcoming.referee && (
              <span>রেফারি: {nextUpcoming.referee}</span>
            )}
          </div>
        </div>
      )}

      {/* Recent Completed Matches Strip */}
      {recentCompleted.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            সাম্প্রতিক ফলাফলসমূহ
          </h4>
          <div className="grid gap-2">
            {recentCompleted.map((m) => {
              const t1 = getTeam(m.team1Id);
              const t2 = getTeam(m.team2Id);
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#071914] border border-emerald-900/30 flex items-center justify-between text-xs hover:border-emerald-800/60 transition"
                >
                  <div className="flex items-center gap-2 flex-1 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t1?.color }}
                    />
                    <span className="font-semibold text-slate-200 truncate">
                      {t1?.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-center shrink-0 mx-2">
                    <div className="px-2.5 py-0.5 rounded-md bg-slate-900 font-display font-bold text-amber-400 text-sm tracking-wider border border-slate-800">
                      {num(m.team1Score)} - {num(m.team2Score)}
                    </div>
                    {m.hasPenaltyShootout && (
                      <span className="text-[10px] text-amber-300 font-bold mt-0.5">
                        পেনাল্টি: {num(m.team1PenaltyScore ?? 0)}-{num(m.team2PenaltyScore ?? 0)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end truncate">
                    <span className="font-semibold text-slate-200 truncate text-right">
                      {t2?.name}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t2?.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Match Report Modal */}
      {match && (
        <MatchReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          match={match}
          team1={team1 || undefined}
          team2={team2 || undefined}
          tournamentName={activeTournament.name}
          orgName={orgSettings.orgName}
          useBengaliNumerals={useBengaliNumerals}
        />
      )}

      {/* Squad Lineup & Tactical Pitch Modal */}
      {match && (
        <LineupModal
          isOpen={showLineupModal}
          onClose={() => setShowLineupModal(false)}
          team1={team1 || undefined}
          team2={team2 || undefined}
          useBengaliNumerals={useBengaliNumerals}
        />
      )}
    </div>
  );
};
