import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Trophy, Check, X, Shield, ArrowRight } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { Tournament, TournamentFormat } from '../../types/tournament';
import { getTournamentFormatLabel } from '../../utils/bengali';

export const AdminTournaments: React.FC = () => {
  const {
    tournaments,
    activeTournamentId,
    setActiveTournamentId,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournament();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('8_teams');
  const [defaultVenue, setDefaultVenue] = useState('আখরকান্দা হাই স্কুল মাঠ');
  const [halfDuration, setHalfDuration] = useState(25);
  const [championPrize, setChampionPrize] = useState('চ্যাম্পিয়ন ট্রফি + ৫০,০০০ টাকা');
  const [runnerUpPrize, setRunnerUpPrize] = useState('রানার্স-আপ ট্রফি + ৩০,০০০ টাকা');
  const [committeeNote, setCommitteeNote] = useState('টুর্নামেন্ট পরিচালনা পরিষদ');

  const resetForm = () => {
    setName('');
    setSubtitle('');
    setFormat('8_teams');
    setDefaultVenue('আখরকান্দা হাই স্কুল মাঠ');
    setHalfDuration(25);
    setChampionPrize('চ্যাম্পিয়ন ট্রফি');
    setRunnerUpPrize('রানার্স-আপ ট্রফি');
    setCommitteeNote('টুর্নামেন্ট পরিচালনা পরিষদ');
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleStartEdit = (t: Tournament) => {
    setEditingId(t.id);
    setName(t.name);
    setSubtitle(t.subtitle);
    setFormat(t.format);
    setDefaultVenue(t.defaultVenue);
    setHalfDuration(t.halfDurationMinutes);
    setChampionPrize(t.championPrize);
    setRunnerUpPrize(t.runnerUpPrize);
    setCommitteeNote(t.committeeNote);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateTournament(editingId, {
        name: name.trim(),
        subtitle: subtitle.trim(),
        format,
        defaultVenue: defaultVenue.trim(),
        halfDurationMinutes: Number(halfDuration) || 25,
        championPrize: championPrize.trim(),
        runnerUpPrize: runnerUpPrize.trim(),
        committeeNote: committeeNote.trim(),
      });
    } else {
      createTournament({
        name: name.trim(),
        subtitle: subtitle.trim() || 'ফুটবল টুর্নামেন্ট',
        format,
        defaultVenue: defaultVenue.trim() || 'আখরকান্দা খেলার মাঠ',
        halfDurationMinutes: Number(halfDuration) || 25,
        championPrize: championPrize.trim(),
        runnerUpPrize: runnerUpPrize.trim(),
        committeeNote: committeeNote.trim(),
        groups: format === 'friendly' ? ['প্রীতি ম্যাচ'] : ['গ্রুপ ক', 'গ্রুপ খ'],
        status: 'active',
        rulesNotice: 'ফিফার আন্তর্জাতিক নিয়ম অনুযায়ী ম্যাচ পরিচালিত হবে।',
      });
    }
    resetForm();
  };

  const handleDelete = (id: string, tName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে '${tName}' টুর্নামেন্ট এবং এর সকল ম্যাচ মুছে ফেলতে চান?`)) {
      deleteTournament(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between bg-[#061e18] p-3.5 rounded-2xl border border-emerald-900/60">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>মাল্টি-টুর্নামেন্ট হাব ম্যানেজার</span>
          </h3>
          <p className="text-xs text-slate-400">
            নতুন টুর্নামেন্ট বা প্রীতি ম্যাচ সিরিজ তৈরি করুন ও সক্রিয় টুর্নামেন্ট পরিবর্তন করুন
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন টুর্নামেন্ট</span>
        </button>
      </div>

      {/* Tournaments List */}
      <div className="space-y-3">
        {tournaments.map((t) => {
          const isActive = t.id === activeTournamentId;
          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition shadow-sm ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/80 via-[#07241c] to-[#051712] border-emerald-500/70 ring-1 ring-emerald-500/30'
                  : 'bg-[#061c16] border-emerald-900/50 hover:border-emerald-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {t.name}
                    </h4>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-sm">
                        সক্রিয়
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    {t.subtitle} · {getTournamentFormatLabel(t.format)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ডিফল্ট মাঠ: <strong className="text-slate-300">{t.defaultVenue}</strong> · দল: {t.teams.length}টি · ম্যাচ: {t.matches.length}টি
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => setActiveTournamentId(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow"
                    >
                      <span>সক্রিয় করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                    title="সম্পাদনা"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {tournaments.length > 1 && (
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-red-400 hover:text-red-300 bg-red-950/60 rounded-xl"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Tournament Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{editingId ? 'টুর্নামেন্ট তথ্য সম্পাদনা' : 'নতুন টুর্নামেন্ট তৈরি করুন'}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টুর্নামেন্টের পূর্ণ নাম:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আরাফাত রহমান কোকো স্মৃতি টুর্নামেন্ট"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সাবটাইটেল / আসর:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ঐতিহ্যবাহী ১৬ দলীয় ফুটবল টুর্নামেন্ট ২০২৬"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    টুর্নামেন্ট ফরম্যাট:
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-2.5 text-xs text-white"
                  >
                    <option value="16_teams">১৬ দলীয় টুর্নামেন্ট</option>
                    <option value="8_teams">৮ দলীয় টুর্নামেন্ট</option>
                    <option value="6_teams">৬ দলীয় টুর্নামেন্ট</option>
                    <option value="friendly">প্রীতি ম্যাচ / ফ্রেন্ডলি সিরিজ</option>
                    <option value="custom_group_knockout">কাস্টম গ্রুপ ও নকআউট</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    অর্ধের সময় (মিনিট):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="45"
                    value={halfDuration}
                    onChange={(e) => setHalfDuration(parseInt(e.target.value, 10))}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ডিফল্ট ভেন্যু / মাঠের নাম:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আখরকান্দা হাই স্কুল মাঠ"
                  value={defaultVenue}
                  onChange={(e) => setDefaultVenue(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    চ্যাম্পিয়ন পুরস্কার:
                  </label>
                  <input
                    type="text"
                    placeholder="চ্যাম্পিয়ন ট্রফি + প্রাইজমানি"
                    value={championPrize}
                    onChange={(e) => setChampionPrize(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    রানার্স-আপ পুরস্কার:
                  </label>
                  <input
                    type="text"
                    placeholder="রানার্স-আপ ট্রফি"
                    value={runnerUpPrize}
                    onChange={(e) => setRunnerUpPrize(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আয়োজক ও পরিচালনা কমিটি নোট:
                </label>
                <input
                  type="text"
                  value={committeeNote}
                  onChange={(e) => setCommitteeNote(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
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
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {editingId ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
