import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Award,
  Clock,
  CheckCircle,
  X,
  Target,
  Radio,
  Volume2,
  Send,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import {
  formatTimer,
  getMatchHalfLabel,
  getMatchStatusLabel,
  toBengaliNumber,
} from '../../utils/bengali';
import { MatchCommentary, MatchHalf, MatchStatus } from '../../types/tournament';
import { soundEffects } from '../../utils/audio';

interface AdminLiveControllerProps {
  initialMatchId?: string;
}

export const AdminLiveController: React.FC<AdminLiveControllerProps> = ({ initialMatchId }) => {
  const {
    matches,
    teams,
    activeLiveMatch,
    startTimer,
    pauseTimer,
    resetTimer,
    setMatchHalf,
    setMatchStatus,
    addMatchEvent,
    removeMatchEvent,
    setManOfTheMatch,
    updateScoresDirectly,
    updatePenaltyShootout,
    addMatchCommentary,
    removeMatchCommentary,
    useBengaliNumerals,
  } = useTournament();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId || activeLiveMatch?.id || matches[0]?.id || ''
  );

  // Live Commentary Input State
  const [commentaryText, setCommentaryText] = useState('');
  const [commentaryType, setCommentaryType] = useState<MatchCommentary['type']>('general');

  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMOTMModal, setShowMOTMModal] = useState(false);

  // Goal Form State
  const [goalTeamId, setGoalTeamId] = useState<string>('');
  const [goalPlayerName, setGoalPlayerName] = useState<string>('');
  const [goalMinute, setGoalMinute] = useState<number>(1);
  const [goalDetail, setGoalDetail] = useState<string>('সাধারণ গোল');

  // Card Form State
  const [cardType, setCardType] = useState<'yellow_card' | 'red_card'>('yellow_card');
  const [cardTeamId, setCardTeamId] = useState<string>('');
  const [cardPlayerName, setCardPlayerName] = useState<string>('');
  const [cardMinute, setCardMinute] = useState<number>(1);
  const [cardDetail, setCardDetail] = useState<string>('ট্যাকল ফাউল');

  // MOTM Form State
  const [motmTeamId, setMotmTeamId] = useState<string>('');
  const [motmPlayerId, setMotmPlayerId] = useState<string>('');
  const [motmPlayerName, setMotmPlayerName] = useState<string>('');

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const team1 = teams.find((t) => t.id === currentMatch?.team1Id);
  const team2 = teams.find((t) => t.id === currentMatch?.team2Id);

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));
  const currentMinute = Math.max(1, Math.floor((currentMatch?.elapsedSeconds || 0) / 60));

  // Open Goal Modal with prefilled minute
  const handleOpenGoalModal = (teamId: string) => {
    setGoalTeamId(teamId);
    setGoalMinute(currentMinute);
    setGoalPlayerName('');
    setGoalDetail('সাধারণ গোল');
    setShowGoalModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !goalTeamId || !goalPlayerName.trim()) return;

    addMatchEvent(currentMatch.id, {
      type: 'goal',
      teamId: goalTeamId,
      playerName: goalPlayerName.trim(),
      minute: Number(goalMinute) || currentMinute,
      detail: goalDetail,
    });
    soundEffects.playGoalChime();
    setShowGoalModal(false);
  };

  // Open Card Modal
  const handleOpenCardModal = (type: 'yellow_card' | 'red_card') => {
    setCardType(type);
    setCardTeamId(currentMatch?.team1Id || '');
    setCardMinute(currentMinute);
    setCardPlayerName('');
    setCardDetail('ট্যাকল ফাউল');
    setShowCardModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !cardTeamId || !cardPlayerName.trim()) return;

    addMatchEvent(currentMatch.id, {
      type: cardType,
      teamId: cardTeamId,
      playerName: cardPlayerName.trim(),
      minute: Number(cardMinute) || currentMinute,
      detail: cardDetail,
    });
    soundEffects.playWhistle(false);
    setShowCardModal(false);
  };

  // Save MOTM
  const handleSaveMOTM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !motmPlayerName.trim()) return;
    setManOfTheMatch(currentMatch.id, motmPlayerId, motmPlayerName.trim(), motmTeamId);
    setShowMOTMModal(false);
  };

  // Post Commentary
  const handlePostCommentary = (customText?: string, customType?: MatchCommentary['type']) => {
    const textToPost = (customText || commentaryText).trim();
    if (!currentMatch || !textToPost) return;

    addMatchCommentary(
      currentMatch.id,
      textToPost,
      customType || commentaryType,
      currentMinute
    );
    if (!customText) {
      setCommentaryText('');
    }
  };

  if (!currentMatch) {
    return (
      <div className="p-6 text-center text-slate-400">
        নিয়ন্ত্রণ করার জন্য কোনো ম্যাচ তৈরি করা হয়নি। ফিক্সচার ম্যানেজার থেকে ম্যাচ যোগ করুন।
      </div>
    );
  }

  const selectedTeam1Players = team1?.players || [];
  const selectedTeam2Players = team2?.players || [];

  return (
    <div className="space-y-4">
      {/* Match Selector Dropdown */}
      <div className="bg-[#051a14] p-3 rounded-2xl border border-emerald-900/60">
        <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
          নিয়ন্ত্রণের জন্য ম্যাচ নির্বাচন করুন:
        </label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="w-full min-h-[44px] bg-[#07241c] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {matches.map((m) => {
            const t1 = teams.find((t) => t.id === m.team1Id);
            const t2 = teams.find((t) => t.id === m.team2Id);
            return (
              <option key={m.id} value={m.id}>
                [{getMatchStatusLabel(m.status)}] {t1?.name || 'দল ১'} ({m.team1Score}) বনাম ({m.team2Score}) {t2?.name || 'দল ২'} - {m.round}
              </option>
            );
          })}
        </select>
      </div>

      {/* Main Live Controller Panel */}
      <div className="rounded-2xl bg-gradient-to-b from-[#092a20] via-[#061e18] to-[#04140f] border border-emerald-800/60 p-4 shadow-xl">
        {/* Match Half Status Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-3 border-b border-emerald-900/50">
          {(['1st_half', 'half_time', '2nd_half', 'extra_time', 'finished'] as MatchHalf[]).map((half) => {
            const isActive = currentMatch.currentHalf === half;
            return (
              <button
                key={half}
                onClick={() => {
                  setMatchHalf(currentMatch.id, half);
                  soundEffects.playWhistle(true);
                }}
                className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                    : 'bg-[#082019] text-slate-300 border-emerald-900/60 hover:bg-[#0a2820]'
                }`}
              >
                {getMatchHalfLabel(half)}
              </button>
            );
          })}
        </div>

        {/* Live Timer Control Station */}
        <div className="py-3 text-center">
          <div className="text-[11px] text-emerald-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>ম্যাচের বর্তমান চলমান ঘড়ি</span>
          </div>

          <div className="font-display font-black text-4xl text-amber-400 tracking-wider my-1 drop-shadow">
            {formatTimer(currentMatch.elapsedSeconds)}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {currentMatch.isTimerRunning ? (
              <button
                onClick={() => {
                  pauseTimer(currentMatch.id);
                  soundEffects.playWhistle(true);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Pause className="w-4 h-4" />
                <span>টাইমার থামান (Pause)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  startTimer(currentMatch.id);
                  soundEffects.playWhistle(false);
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>টাইমার চালু করুন (Start)</span>
              </button>
            )}

            <button
              onClick={() => resetTimer(currentMatch.id, 0)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 transition"
              title="ঘড়ি ০ তে রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            {/* Quick Referee Whistle Trigger */}
            <button
              onClick={() => soundEffects.playWhistle(true)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-400 border border-emerald-700/50 font-semibold text-xs flex items-center gap-1.5 transition"
              title="বাঁশির আওয়াজ বাজান"
            >
              <Volume2 className="w-4 h-4" />
              <span>বাঁশি</span>
            </button>
          </div>
        </div>

        {/* Score Board & Quick +/- Controller */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-900/50">
          {/* Team 1 Score Box */}
          <div className="p-3 rounded-xl bg-[#061c16] border border-emerald-800/40 text-center">
            <span
              className="w-3 h-3 rounded-full inline-block mb-1"
              style={{ backgroundColor: team1?.color || '#10b981' }}
            />
            <h4 className="text-xs font-bold text-white truncate mb-1">
              {team1?.name || 'দল ১'}
            </h4>
            <div className="font-display font-black text-3xl text-amber-400 my-1">
              {num(currentMatch.team1Score)}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2">
              <button
                onClick={() =>
                  updateScoresDirectly(
                    currentMatch.id,
                    currentMatch.team1Score + 1,
                    currentMatch.team2Score
                  )
                }
                className="min-h-[40px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                +১ স্কোর
              </button>
              <button
                onClick={() =>
                  updateScoresDirectly(
                    currentMatch.id,
                    Math.max(0, currentMatch.team1Score - 1),
                    currentMatch.team2Score
                  )
                }
                className="min-h-[40px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                -১
              </button>
            </div>

            <button
              onClick={() => handleOpenGoalModal(currentMatch.team1Id)}
              className="mt-2 w-full min-h-[40px] rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/40 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>গোল যোগ করুন</span>
            </button>
          </div>

          {/* Team 2 Score Box */}
          <div className="p-3 rounded-xl bg-[#061c16] border border-emerald-800/40 text-center">
            <span
              className="w-3 h-3 rounded-full inline-block mb-1"
              style={{ backgroundColor: team2?.color || '#3b82f6' }}
            />
            <h4 className="text-xs font-bold text-white truncate mb-1">
              {team2?.name || 'দল ২'}
            </h4>
            <div className="font-display font-black text-3xl text-amber-400 my-1">
              {num(currentMatch.team2Score)}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2">
              <button
                onClick={() =>
                  updateScoresDirectly(
                    currentMatch.id,
                    currentMatch.team1Score,
                    currentMatch.team2Score + 1
                  )
                }
                className="min-h-[40px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                +১ স্কোর
              </button>
              <button
                onClick={() =>
                  updateScoresDirectly(
                    currentMatch.id,
                    currentMatch.team1Score,
                    Math.max(0, currentMatch.team2Score - 1)
                  )
                }
                className="min-h-[40px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                -১
              </button>
            </div>

            <button
              onClick={() => handleOpenGoalModal(currentMatch.team2Id)}
              className="mt-2 w-full min-h-[40px] rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/40 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>গোল যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Penalty Shootout (টাইব্রেকার / পেনাল্টি) Section */}
        <div className="mt-3 p-3 rounded-xl bg-[#051711] border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
              <input
                type="checkbox"
                checked={!!currentMatch.hasPenaltyShootout}
                onChange={(e) =>
                  updatePenaltyShootout(
                    currentMatch.id,
                    e.target.checked,
                    currentMatch.team1PenaltyScore || 0,
                    currentMatch.team2PenaltyScore || 0
                  )
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>পেনাল্টি শুটআউট (টাইব্রেকার) সক্রিয় করুন</span>
              </span>
            </label>
            {currentMatch.hasPenaltyShootout && (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded-full border border-amber-600/40">
                টাইব্রেকার চলমান
              </span>
            )}
          </div>

          {currentMatch.hasPenaltyShootout && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-950">
              {/* Team 1 Penalty input */}
              <div className="text-center p-2 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="text-[11px] font-semibold text-slate-300 truncate block">
                  {team1?.name} পেনাল্টি:
                </span>
                <div className="flex items-center justify-center gap-2 my-1">
                  <button
                    onClick={() =>
                      updatePenaltyShootout(
                        currentMatch.id,
                        true,
                        Math.max(0, (currentMatch.team1PenaltyScore || 0) - 1),
                        currentMatch.team2PenaltyScore || 0
                      )
                    }
                    className="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <span className="font-display font-black text-2xl text-amber-400 w-10">
                    {num(currentMatch.team1PenaltyScore || 0)}
                  </span>
                  <button
                    onClick={() =>
                      updatePenaltyShootout(
                        currentMatch.id,
                        true,
                        (currentMatch.team1PenaltyScore || 0) + 1,
                        currentMatch.team2PenaltyScore || 0
                      )
                    }
                    className="w-8 h-8 rounded bg-emerald-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Team 2 Penalty input */}
              <div className="text-center p-2 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="text-[11px] font-semibold text-slate-300 truncate block">
                  {team2?.name} পেনাল্টি:
                </span>
                <div className="flex items-center justify-center gap-2 my-1">
                  <button
                    onClick={() =>
                      updatePenaltyShootout(
                        currentMatch.id,
                        true,
                        currentMatch.team1PenaltyScore || 0,
                        Math.max(0, (currentMatch.team2PenaltyScore || 0) - 1)
                      )
                    }
                    className="w-8 h-8 rounded bg-slate-800 text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <span className="font-display font-black text-2xl text-amber-400 w-10">
                    {num(currentMatch.team2PenaltyScore || 0)}
                  </span>
                  <button
                    onClick={() =>
                      updatePenaltyShootout(
                        currentMatch.id,
                        true,
                        currentMatch.team1PenaltyScore || 0,
                        (currentMatch.team2PenaltyScore || 0) + 1
                      )
                    }
                    className="w-8 h-8 rounded bg-emerald-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Triggers & MOTM Bar */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-900/40">
          <button
            onClick={() => handleOpenCardModal('yellow_card')}
            className="min-h-[44px] rounded-xl bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span className="w-3 h-4 rounded-xs bg-yellow-400 inline-block" />
            <span>হলুদ কার্ড</span>
          </button>

          <button
            onClick={() => handleOpenCardModal('red_card')}
            className="min-h-[44px] rounded-xl bg-red-950/70 border border-red-500/40 hover:bg-red-900/70 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span className="w-3 h-4 rounded-xs bg-red-600 inline-block" />
            <span>লাল কার্ড</span>
          </button>

          <button
            onClick={() => {
              setMotmTeamId(currentMatch.team1Id);
              setMotmPlayerId(selectedTeam1Players[0]?.id || '');
              setMotmPlayerName(selectedTeam1Players[0]?.name || '');
              setShowMOTMModal(true);
            }}
            className="min-h-[44px] rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1 shadow transition active:scale-95"
          >
            <Award className="w-4 h-4" />
            <span>সেরা খেলোয়াড়</span>
          </button>
        </div>

        {/* Finalize Match Button */}
        <div className="mt-3 pt-3 border-t border-emerald-900/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">ম্যাচের অবস্থা:</span>
          {currentMatch.status === 'completed' ? (
            <button
              onClick={() => setMatchStatus(currentMatch.id, 'live')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-semibold hover:bg-emerald-900"
            >
              পুনরায় লাইভ করুন
            </button>
          ) : (
            <button
              onClick={() => {
                setMatchHalf(currentMatch.id, 'finished');
                setMatchStatus(currentMatch.id, 'completed');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition shadow flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ম্যাচ সমাপ্ত ঘোষণা করুন (ফলাফল সংরক্ষণ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Events Logged & Undo List */}
      <div className="rounded-2xl bg-[#061c16] border border-emerald-900/50 p-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 pb-2 border-b border-emerald-900/40">
          নথিভুক্ত ঘটনা ও বাতিল (Undo) সুবিধা
        </h4>

        {currentMatch.events.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            এই ম্যাচে এখনও কোনো গোল বা কার্ড নথিভুক্ত করা হয়নি।
          </p>
        ) : (
          <div className="space-y-2">
            {currentMatch.events.map((ev) => {
              const eventTeam = teams.find((t) => t.id === ev.teamId);
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#07241c] border border-emerald-900/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-amber-400">{num(ev.minute)}'</span>
                    {ev.type === 'goal' && <span>⚽</span>}
                    {ev.type === 'yellow_card' && (
                      <span className="w-2.5 h-3.5 bg-yellow-400 rounded-xs inline-block" />
                    )}
                    {ev.type === 'red_card' && (
                      <span className="w-2.5 h-3.5 bg-red-600 rounded-xs inline-block" />
                    )}
                    <span className="font-bold text-white">{ev.playerName}</span>
                    <span className="text-[11px] text-slate-400">({eventTeam?.shortName})</span>
                    {ev.detail && <span className="text-slate-400">· {ev.detail}</span>}
                  </div>

                  <button
                    onClick={() => removeMatchEvent(currentMatch.id, ev.id)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition"
                    title="মুছুন / আনডু"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Ball-by-Ball Commentary Controller Station */}
      <div className="rounded-2xl bg-[#061c16] border border-emerald-900/50 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              লাইভ বল-বাই-বল ধারাভাষ্য স্টেশন (মিনিট: {num(currentMinute)}')
            </h4>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {num(currentMatch.commentary?.length || 0)}টি আপডেট
          </span>
        </div>

        {/* Quick Tap Presets */}
        <div>
          <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
            এক-ট্যাপে দ্রুত ধারাভাষ্য আপডেট দিন:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '⚽ অসাধারণ গোল!', text: 'গোল! চমৎকার প্লেসিংয়ে বল জালে জড়ালেন!', type: 'goal' as const },
              { label: '🧤 দুর্দান্ত সেভ!', text: 'গোলরক্ষকের অবিশ্বাস্য ক্ষিপ্রতায় নিশ্চিত গোল রক্ষা পেল!', type: 'save' as const },
              { label: '🟨 হলুদ কার্ড!', text: 'রেফারির বাঁশি এবং ফাউলের কারণে হলুদ কার্ড প্রদর্শন!', type: 'card' as const },
              { label: '🛑 ট্যাকল ফাউল', text: 'বিপজ্জনক ট্যাকল, রেফারি খেলা থামিয়ে ফ্রি-কিক দিলেন।', type: 'foul' as const },
              { label: '⏱️ হাফ-টাইম বাঁশি', text: 'প্রথমার্ধের সমাপ্তির বাঁশি বাজল, দলগুলো এখন বিরতিতে।', type: 'whistle' as const },
              { label: '⏱️ ২য় অর্ধ শুরু', text: 'দ্বিতীয়ার্ধের আক্রমণাত্মক ফুটবল খেলা পুনরায় শুরু হল!', type: 'whistle' as const },
              { label: '🔥 টানটান উত্তেজনা', text: 'মাঠে তুমুল উত্তেজনা, দুই দলই আক্রমণ পাল্টা-আক্রমণ চালাচ্ছে!', type: 'highlight' as const },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePostCommentary(p.text, p.type)}
                className="px-2.5 py-1 rounded-lg bg-[#07251d] hover:bg-[#0c392c] text-emerald-200 border border-emerald-800/40 text-[11px] font-medium transition active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Commentary Composer */}
        <div className="pt-2 border-t border-emerald-950 space-y-2">
          <div className="flex gap-2">
            <select
              value={commentaryType}
              onChange={(e) => setCommentaryType(e.target.value as MatchCommentary['type'])}
              className="bg-[#051813] border border-emerald-800/60 rounded-xl px-2.5 py-2 text-xs text-white shrink-0 font-medium"
            >
              <option value="general">সাধারণ বিবরণ</option>
              <option value="goal">⚽ গোল</option>
              <option value="save">🧤 গোল সেভ</option>
              <option value="card">🟨 কার্ড</option>
              <option value="foul">🛑 ফাউল</option>
              <option value="highlight">🔥 হাইলাইটস</option>
              <option value="whistle">⏱️ বাঁশি</option>
            </select>

            <input
              type="text"
              placeholder="সরাসরি ধারাভাষ্য লিখুন... (যেমন: দুর্দান্ত হেডার শট কর্নার পেল)"
              value={commentaryText}
              onChange={(e) => setCommentaryText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePostCommentary();
                }
              }}
              className="flex-1 bg-[#051813] border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />

            <button
              type="button"
              onClick={() => handlePostCommentary()}
              disabled={!commentaryText.trim()}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-1 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পাঠান</span>
            </button>
          </div>
        </div>

        {/* Stream of Posted Commentary for Undo */}
        {currentMatch.commentary && currentMatch.commentary.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-emerald-950 max-h-48 overflow-y-auto">
            {currentMatch.commentary.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#07241c] text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-display font-bold text-amber-400 shrink-0">
                    {num(c.minute)}'
                  </span>
                  <span className="text-white truncate">{c.text}</span>
                </div>
                <button
                  onClick={() => removeMatchCommentary(currentMatch.id, c.id)}
                  className="min-w-[28px] min-h-[28px] flex items-center justify-center text-red-400 hover:text-red-300 rounded"
                  title="ধারাভাষ্য মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Entry Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚽</span> গোল নথিভুক্ত করুন
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  গোলকারী দল:
                </label>
                <select
                  value={goalTeamId}
                  onChange={(e) => {
                    setGoalTeamId(e.target.value);
                    setGoalPlayerName('');
                  }}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value={currentMatch.team1Id}>{team1?.name}</option>
                  <option value={currentMatch.team2Id}>{team2?.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  খেলোয়াড়ের নাম:
                </label>
                <div className="space-y-1.5">
                  <select
                    onChange={(e) => setGoalPlayerName(e.target.value)}
                    value={goalPlayerName}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  >
                    <option value="">-- খেলোয়াড় নির্বাচন করুন --</option>
                    {(goalTeamId === currentMatch.team1Id
                      ? selectedTeam1Players
                      : selectedTeam2Players
                    ).map((p) => (
                      <option key={p.id} value={p.name}>
                        #{p.jerseyNumber} - {p.name} ({p.position})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="অথবা সরাসরি নাম লিখুন..."
                    value={goalPlayerName}
                    onChange={(e) => setGoalPlayerName(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মিনিট:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(parseInt(e.target.value, 10))}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    গোলের ধরন:
                  </label>
                  <select
                    value={goalDetail}
                    onChange={(e) => setGoalDetail(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  >
                    <option value="সাধারণ গোল">সাধারণ গোল</option>
                    <option value="পেনাল্টি গোল">পেনাল্টি গোল</option>
                    <option value="হেডার গোল">হেডার গোল</option>
                    <option value="ফ্রিকিক গোল">ফ্রিকিক গোল</option>
                    <option value="আত্মঘাতী গোল">আত্মঘাতী গোল</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Entry Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span
                  className={`w-3 h-4 rounded-xs ${
                    cardType === 'yellow_card' ? 'bg-yellow-400' : 'bg-red-600'
                  }`}
                />
                <span>
                  {cardType === 'yellow_card' ? 'হলুদ কার্ড দিন' : 'লাল কার্ড দিন'}
                </span>
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  দল:
                </label>
                <select
                  value={cardTeamId}
                  onChange={(e) => {
                    setCardTeamId(e.target.value);
                    setCardPlayerName('');
                  }}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value={currentMatch.team1Id}>{team1?.name}</option>
                  <option value={currentMatch.team2Id}>{team2?.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  খেলোয়াড়:
                </label>
                <select
                  onChange={(e) => setCardPlayerName(e.target.value)}
                  value={cardPlayerName}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value="">-- খেলোয়াড় নির্বাচন করুন --</option>
                  {(cardTeamId === currentMatch.team1Id
                    ? selectedTeam1Players
                    : selectedTeam2Players
                  ).map((p) => (
                    <option key={p.id} value={p.name}>
                      #{p.jerseyNumber} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মিনিট:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={cardMinute}
                    onChange={(e) => setCardMinute(parseInt(e.target.value, 10))}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    কারণ:
                  </label>
                  <input
                    type="text"
                    value={cardDetail}
                    onChange={(e) => setCardDetail(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold"
                >
                  কার্ড যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOTM Modal */}
      {showMOTMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>ম্যান অফ দ্য ম্যাচ নির্বাচন</span>
              </h3>
              <button
                onClick={() => setShowMOTMModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMOTM} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  খেলোয়াড়ের দল:
                </label>
                <select
                  value={motmTeamId}
                  onChange={(e) => {
                    const newTeamId = e.target.value;
                    setMotmTeamId(newTeamId);
                    const players =
                      newTeamId === currentMatch.team1Id
                        ? selectedTeam1Players
                        : selectedTeam2Players;
                    if (players.length > 0) {
                      setMotmPlayerId(players[0].id);
                      setMotmPlayerName(players[0].name);
                    }
                  }}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value={currentMatch.team1Id}>{team1?.name}</option>
                  <option value={currentMatch.team2Id}>{team2?.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সেরা খেলোয়াড় নির্বাচন করুন:
                </label>
                <select
                  value={motmPlayerName}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setMotmPlayerName(selectedName);
                    const allP = [...selectedTeam1Players, ...selectedTeam2Players];
                    const found = allP.find((p) => p.name === selectedName);
                    if (found) setMotmPlayerId(found.id);
                  }}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  {(motmTeamId === currentMatch.team1Id
                    ? selectedTeam1Players
                    : selectedTeam2Players
                  ).map((p) => (
                    <option key={p.id} value={p.name}>
                      #{p.jerseyNumber} - {p.name} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMOTMModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  পুরস্কৃত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
