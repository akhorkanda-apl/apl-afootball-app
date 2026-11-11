import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Clock, MapPin, X, UserCheck } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { Match } from '../../types/tournament';
import { formatBengaliDate, formatBengaliTime, getMatchStatusLabel } from '../../utils/bengali';

interface AdminFixturesProps {
  onGoToLiveController: (matchId: string) => void;
}

export const AdminFixtures: React.FC<AdminFixturesProps> = ({ onGoToLiveController }) => {
  const { matches, teams, activeTournament, addMatch, updateMatch, deleteMatch } = useTournament();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Form State
  const [team1Id, setTeam1Id] = useState<string>(teams[0]?.id || '');
  const [team2Id, setTeam2Id] = useState<string>(teams[1]?.id || '');
  const [round, setRound] = useState<string>('গ্রুপ পর্ব');
  const [group, setGroup] = useState<string>(activeTournament.groups[0] || 'গ্রুপ ক');
  const [date, setDate] = useState<string>('2026-11-15');
  const [time, setTime] = useState<string>('15:30');
  const [venue, setVenue] = useState<string>(activeTournament.defaultVenue || 'আখরকান্দা হাই স্কুল মাঠ');
  const [referee, setReferee] = useState<string>('');

  // Reset Form
  const resetForm = () => {
    setTeam1Id(teams[0]?.id || '');
    setTeam2Id(teams[1]?.id || '');
    setRound('গ্রুপ পর্ব');
    setGroup(activeTournament.groups[0] || 'গ্রুপ ক');
    setDate('2026-11-15');
    setTime('15:30');
    setVenue(activeTournament.defaultVenue || 'আখরকান্দা হাই স্কুল মাঠ');
    setReferee('');
    setShowAddForm(false);
    setEditingMatchId(null);
  };

  const handleStartEdit = (m: Match) => {
    setEditingMatchId(m.id);
    setTeam1Id(m.team1Id);
    setTeam2Id(m.team2Id);
    setRound(m.round);
    setGroup(m.group || activeTournament.groups[0] || '');
    setDate(m.date);
    setTime(m.time);
    setVenue(m.venue || activeTournament.defaultVenue);
    setReferee(m.referee || '');
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1Id || !team2Id) {
      alert('অনুগ্রহ করে দুটি ভিন্ন দল নির্বাচন করুন।');
      return;
    }
    if (team1Id === team2Id) {
      alert('দুটি একই দল নিয়ে ম্যাচ হতে পারে না!');
      return;
    }

    if (editingMatchId) {
      updateMatch(editingMatchId, {
        team1Id,
        team2Id,
        round,
        group: round === 'গ্রুপ পর্ব' ? group : undefined,
        date,
        time,
        venue: venue.trim() || activeTournament.defaultVenue,
        referee: referee.trim() || undefined,
      });
    } else {
      addMatch({
        team1Id,
        team2Id,
        team1Score: 0,
        team2Score: 0,
        round,
        group: round === 'গ্রুপ পর্ব' ? group : undefined,
        date,
        time,
        venue: venue.trim() || activeTournament.defaultVenue,
        referee: referee.trim() || undefined,
        status: 'upcoming',
        currentHalf: '1st_half',
      });
    }
    resetForm();
  };

  const handleDelete = (matchId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ম্যাচটি মুছে ফেলতে চান?')) {
      deleteMatch(matchId);
    }
  };

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  return (
    <div className="space-y-4">
      {/* Header and Add Match Trigger */}
      <div className="flex items-center justify-between bg-[#061e18] p-3.5 rounded-2xl border border-emerald-900/60">
        <div>
          <h3 className="text-sm font-bold text-white">ফিক্সচার ও ম্যাচ শিডিউলার</h3>
          <p className="text-xs text-slate-400">
            টুর্নামেন্ট: <strong className="text-amber-400">{activeTournament.name}</strong>
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'বন্ধ করুন' : 'নতুন ম্যাচ তৈরি'}</span>
        </button>
      </div>

      {/* Add / Edit Match Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#07241c] border border-emerald-600/50 p-4 shadow-xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/40">
            <h4 className="text-xs font-bold text-amber-400">
              {editingMatchId ? 'ম্যাচ তথ্য সম্পাদনা করুন' : 'নতুন ম্যাচ যুক্ত করুন'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                দল ১ (স্বাগতিক):
              </label>
              <select
                value={team1Id}
                onChange={(e) => setTeam1Id(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
                required
              >
                <option value="">দল নির্বাচন করুন</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                দল ২ (অতিথি):
              </label>
              <select
                value={team2Id}
                onChange={(e) => setTeam2Id(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
                required
              >
                <option value="">দল নির্বাচন করুন</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                টুর্নামেন্ট পর্ব (Round):
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
              >
                <option value="গ্রুপ পর্ব">গ্রুপ পর্ব</option>
                <option value="কোয়ার্টার ফাইনাল">কোয়ার্টার ফাইনাল</option>
                <option value="সেমিফাইনাল">সেমিফাইনাল</option>
                <option value="ফাইনাল">ফাইনাল</option>
                <option value="প্রীতি ম্যাচ">প্রীতি ম্যাচ</option>
              </select>
            </div>

            {round === 'গ্রুপ পর্ব' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  গ্রুপ:
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
                >
                  {activeTournament.groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                তারিখ:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                সময়:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Editable Match Venue & Referee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                ম্যাচ ভেন্যু (মাঠের নাম - এডিটেবল):
              </label>
              <input
                type="text"
                placeholder="যেমন: সোনারায় খেলার মাঠ বা আখরকান্দা মাঠ"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                রেফারির নাম (অপশনাল):
              </label>
              <input
                type="text"
                placeholder="যেমন: মোঃ মিজানুর রহমান"
                value={referee}
                onChange={(e) => setReferee(e.target.value)}
                className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
            >
              {editingMatchId ? 'আপডেট করুন' : 'ম্যাচ সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Match List */}
      <div className="space-y-2.5">
        {matches.length === 0 ? (
          <div className="rounded-2xl bg-[#061813] border border-emerald-900/50 p-6 text-center text-slate-400 text-xs">
            এই টুর্নামেন্টে এখনও কোনো ম্যাচ তৈরি করা হয়নি। উপরের বাটনে চাপ দিয়ে ম্যাচ যুক্ত করুন।
          </div>
        ) : (
          matches.map((m) => {
            const t1 = getTeam(m.team1Id);
            const t2 = getTeam(m.team2Id);

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#061d17] border border-emerald-900/60 shadow flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{m.round}</span>
                    {m.group && <span className="text-slate-400">· {m.group}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'live'
                          ? 'bg-red-950 text-red-400 border border-red-500/40'
                          : m.status === 'completed'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {getMatchStatusLabel(m.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm py-1 font-semibold">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t1?.color }}
                    />
                    <span className="text-white truncate">{t1?.name || 'দল ১'}</span>
                  </div>

                  <div className="flex flex-col items-center shrink-0 mx-2">
                    <div className="px-3 py-0.5 bg-slate-900 font-display font-bold text-amber-400 rounded-md border border-slate-800">
                      {m.team1Score} - {m.team2Score}
                    </div>
                    {m.hasPenaltyShootout && (
                      <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                        পেনাল্টি: {m.team1PenaltyScore}-{m.team2PenaltyScore}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end min-w-0 text-right">
                    <span className="text-white truncate">{t2?.name || 'দল ২'}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t2?.color }}
                    />
                  </div>
                </div>

                {/* Venue and Referee Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                  <span className="flex items-center gap-1 truncate text-slate-300">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </span>
                  {m.referee && (
                    <span className="flex items-center gap-1 shrink-0 text-amber-400/90">
                      <UserCheck className="w-3 h-3" />
                      <span>রেফারি: {m.referee}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px] truncate">
                    <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{formatBengaliDate(m.date)}</span>
                    <Clock className="w-3 h-3 text-emerald-500 shrink-0 ml-1" />
                    <span>{formatBengaliTime(m.time)}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onGoToLiveController(m.id)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow"
                    >
                      লাইভ কন্ট্রোল
                    </button>
                    <button
                      onClick={() => handleStartEdit(m)}
                      className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/80 rounded-lg"
                      title="সম্পাদনা"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="min-h-[32px] min-w-[32px] flex items-center justify-center text-red-400 hover:text-red-300 bg-red-950/60 rounded-lg"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
