import React, { useRef, useState } from 'react';
import {
  Save,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Award,
  Sparkles,
  MapPin,
  Building,
  HeartHandshake,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { AplLogo } from '../AplLogo';
import { Sponsor } from '../../types/tournament';

export const AdminSettings: React.FC = () => {
  const {
    orgSettings,
    activeTournament,
    updateOrgSettings,
    updateActiveTournamentSettings,
    changeAdminPin,
    exportBackupJson,
    importBackupJson,
    resetAllData,
    restoreDemoData,
  } = useTournament();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Organization Settings Form
  const [orgName, setOrgName] = useState(orgSettings.orgName);
  const [customLogoUrl, setCustomLogoUrl] = useState(orgSettings.customLogoUrl || '');

  // Active Tournament Settings Form
  const [tournamentName, setTournamentName] = useState(activeTournament.name);
  const [subtitle, setSubtitle] = useState(activeTournament.subtitle);
  const [defaultVenue, setDefaultVenue] = useState(activeTournament.defaultVenue);
  const [halfDuration, setHalfDuration] = useState(activeTournament.halfDurationMinutes);
  const [championPrize, setChampionPrize] = useState(activeTournament.championPrize || '');
  const [runnerUpPrize, setRunnerUpPrize] = useState(activeTournament.runnerUpPrize || '');
  const [committeeNote, setCommitteeNote] = useState(activeTournament.committeeNote || '');
  const [rulesNotice, setRulesNotice] = useState(activeTournament.rulesNotice || '');

  // Sponsors & Partners State
  const [sponsors, setSponsors] = useState<Sponsor[]>(activeTournament.sponsors || []);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorCategory, setNewSponsorCategory] = useState('টাইটেল স্পন্সর');

  // Tournament Awards Form (টুর্নামেন্ট সেরা সম্মাননা)
  const [playerOfTournament, setPlayerOfTournament] = useState(
    activeTournament.playerOfTournament || ''
  );
  const [playerOfTournamentTeam, setPlayerOfTournamentTeam] = useState(
    activeTournament.playerOfTournamentTeam || ''
  );
  const [bestGoalkeeper, setBestGoalkeeper] = useState(activeTournament.bestGoalkeeper || '');
  const [bestGoalkeeperTeam, setBestGoalkeeperTeam] = useState(
    activeTournament.bestGoalkeeperTeam || ''
  );

  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Change PIN Form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Confirmation Modals
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Org Settings
    updateOrgSettings({
      orgName: orgName.trim(),
      customLogoUrl: customLogoUrl.trim(),
    });

    // 2. Update Active Tournament Settings
    updateActiveTournamentSettings({
      name: tournamentName.trim(),
      subtitle: subtitle.trim(),
      defaultVenue: defaultVenue.trim(),
      halfDurationMinutes: Number(halfDuration) || 25,
      championPrize: championPrize.trim(),
      runnerUpPrize: runnerUpPrize.trim(),
      committeeNote: committeeNote.trim(),
      rulesNotice: rulesNotice.trim(),
      sponsors: sponsors,
      playerOfTournament: playerOfTournament.trim() || undefined,
      playerOfTournamentTeam: playerOfTournamentTeam.trim() || undefined,
      bestGoalkeeper: bestGoalkeeper.trim() || undefined,
      bestGoalkeeperTeam: bestGoalkeeperTeam.trim() || undefined,
    });

    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleAddSponsor = () => {
    if (!newSponsorName.trim()) return;
    const newSp: Sponsor = {
      id: `sp-${Date.now()}`,
      name: newSponsorName.trim(),
      category: newSponsorCategory.trim() || 'পৃষ্ঠপোষক',
    };
    setSponsors((prev) => [...prev, newSp]);
    setNewSponsorName('');
  };

  const handleRemoveSponsor = (id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'নতুন পিন দুটি মেলেনি!', isError: true });
      return;
    }
    const res = changeAdminPin(currentPin, newPin);
    setPinMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APL_TournamentHub_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupNotice('পূর্ণ ব্যাকআপ JSON ডাউনলোড সম্পন্ন হয়েছে!');
    setTimeout(() => setBackupNotice(null), 3500);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJson(content);
        setBackupNotice(result.message);
        if (result.success) {
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim() !== 'RESET') {
      alert("সঠিকভাবে 'RESET' শব্দটি টাইপ করুন");
      return;
    }
    resetAllData();
    setShowResetConfirmModal(false);
    setResetConfirmInput('');
    setBackupNotice('সমস্ত টুর্নামেন্ট ডেটা পরিষ্কার করা হয়েছে!');
    setTimeout(() => setBackupNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Tournament & Organization Settings */}
      <form
        onSubmit={handleSaveSettings}
        className="rounded-2xl bg-[#061e18] border border-emerald-900/60 p-4 sm:p-5 shadow space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>সংগঠন ও সক্রিয় টুর্নামেন্ট সেটিংস</span>
          </h3>
          {settingsSavedMessage && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>সংরক্ষিত হয়েছে!</span>
            </span>
          )}
        </div>

        {/* Permanent Organization Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            স্থায়ী প্রধান সংগঠন / ব্র্যান্ডের নাম:
          </label>
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs sm:text-sm text-white"
          />
        </div>

        {/* Custom Logo URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            কাস্টম লোগো ইমেজ লিঙ্ক (URL - অপশনাল):
          </label>
          <input
            type="url"
            placeholder="https://example.com/apl-logo.png"
            value={customLogoUrl}
            onChange={(e) => setCustomLogoUrl(e.target.value)}
            className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white placeholder-slate-600"
          />
        </div>

        {/* Logo Preview */}
        <div className="p-3 bg-[#051510] rounded-xl border border-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AplLogo size="md" customUrl={customLogoUrl} />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block">লোগো প্রিভিউ</span>
              <span className="text-[11px] text-slate-400">
                {customLogoUrl ? 'কাস্টম ইমেজ ব্যবহৃত হচ্ছে' : 'অফিসিয়াল APL ভেক্টর ক্রেস্ট সক্রিয়'}
              </span>
            </div>
          </div>
          {customLogoUrl && (
            <button
              type="button"
              onClick={() => setCustomLogoUrl('')}
              className="text-xs text-amber-400 hover:underline"
            >
              ডিফল্ট ক্রেস্টে ফিরুন
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-emerald-900/40">
          <h4 className="text-xs font-bold text-amber-400 mb-2">
            সক্রিয় টুর্নামেন্টের তথ্য ({activeTournament.name})
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              টুর্নামেন্টের নাম:
            </label>
            <input
              type="text"
              required
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              সাবটাইটেল:
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>
        </div>

        {/* 100% Editable Default Venue and Half Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ডিফল্ট ভেন্যু / মাঠের নাম (১০০% এডিটেবল):
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: আখরকান্দা হাই স্কুল মাঠ"
              value={defaultVenue}
              onChange={(e) => setDefaultVenue(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ম্যাচ প্রতি অর্ধের সময় (মিনিট):
            </label>
            <input
              type="number"
              min="10"
              max="45"
              value={halfDuration}
              onChange={(e) => setHalfDuration(parseInt(e.target.value, 10))}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>
        </div>

        {/* 100% Editable Prizes & Committee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              চ্যাম্পিয়ন পুরস্কার (প্রাইজমানি ও ট্রফি):
            </label>
            <input
              type="text"
              placeholder="চ্যাম্পিয়ন ট্রফি + ৫০,০০০ টাকা"
              value={championPrize}
              onChange={(e) => setChampionPrize(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              রানার্স-আপ পুরস্কার (প্রাইজমানি ও ট্রফি):
            </label>
            <input
              type="text"
              placeholder="রানার্স-আপ ট্রফি + ৩০,০০০ টাকা"
              value={runnerUpPrize}
              onChange={(e) => setRunnerUpPrize(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            আয়োজক ও পরিচালনা কমিটি নোট (১০০% এডিটেবল):
          </label>
          <input
            type="text"
            placeholder="যেমন: আখরকান্দা যুব সমাজ ও টুর্নামেন্ট পরিচালনা পরিষদ"
            value={committeeNote}
            onChange={(e) => setCommitteeNote(e.target.value)}
            className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
          />
        </div>

        {/* Tournament Awards Section (টুর্নামেন্ট সেরা পুরস্কার) */}
        <div className="pt-3 border-t border-emerald-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-400">
              টুর্নামেন্ট সেরা পুরস্কার নির্ধারণ (হল অব ফেম)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 p-3 rounded-xl bg-[#051611] border border-amber-500/30">
              <label className="block text-xs font-bold text-amber-300">
                টুর্নামেন্ট সেরা খেলোয়াড় (Player of the Tournament):
              </label>
              <input
                type="text"
                placeholder="খেলোয়াড়ের নাম"
                value={playerOfTournament}
                onChange={(e) => setPlayerOfTournament(e.target.value)}
                className="w-full min-h-[40px] bg-[#07241c] border border-slate-700 rounded-lg px-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="দলের নাম"
                value={playerOfTournamentTeam}
                onChange={(e) => setPlayerOfTournamentTeam(e.target.value)}
                className="w-full min-h-[40px] bg-[#07241c] border border-slate-700 rounded-lg px-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-[#051611] border border-emerald-500/30">
              <label className="block text-xs font-bold text-emerald-300">
                সেরা গোলরক্ষক (Golden Glove):
              </label>
              <input
                type="text"
                placeholder="গোলরক্ষকের নাম"
                value={bestGoalkeeper}
                onChange={(e) => setBestGoalkeeper(e.target.value)}
                className="w-full min-h-[40px] bg-[#07241c] border border-slate-700 rounded-lg px-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="দলের নাম"
                value={bestGoalkeeperTeam}
                onChange={(e) => setBestGoalkeeperTeam(e.target.value)}
                className="w-full min-h-[40px] bg-[#07241c] border border-slate-700 rounded-lg px-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Sponsors & Partners Management Section */}
        <div className="pt-3 border-t border-emerald-900/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">
              টুর্নামেন্ট পৃষ্ঠপোষক ও সহযোগী (Official Sponsors)
            </h4>
          </div>

          <div className="space-y-2">
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#051813] border border-emerald-900/50 text-xs"
              >
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {s.category}
                  </span>
                  <span className="font-bold text-white">{s.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSponsor(s.id)}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center text-red-400 hover:text-red-300 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              placeholder="পৃষ্ঠপোষক / প্রতিষ্ঠানের নাম"
              value={newSponsorName}
              onChange={(e) => setNewSponsorName(e.target.value)}
              className="flex-1 min-h-[40px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
            <select
              value={newSponsorCategory}
              onChange={(e) => setNewSponsorCategory(e.target.value)}
              className="min-h-[40px] bg-[#051813] border border-emerald-800 rounded-xl px-2.5 text-xs text-white"
            >
              <option value="টাইটেল স্পন্সর">টাইটেল স্পন্সর</option>
              <option value="কো-স্পন্সর">কো-স্পন্সর</option>
              <option value="জার্সি পার্টনার">জার্সি পার্টনার</option>
              <option value="মিডিয়া পার্টনার">মিডিয়া পার্টনার</option>
              <option value="সহযোগী প্রতিষ্ঠান">সহযোগী প্রতিষ্ঠান</option>
            </select>
            <button
              type="button"
              onClick={handleAddSponsor}
              className="min-h-[40px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            টুর্নামেন্টের নিয়মাবলী ও নোটিশ টেক্সট:
          </label>
          <textarea
            rows={4}
            value={rulesNotice}
            onChange={(e) => setRulesNotice(e.target.value)}
            className="w-full bg-[#051813] border border-emerald-800 rounded-xl p-3 text-xs text-white leading-relaxed placeholder-slate-600"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow"
        >
          <Save className="w-4 h-4" />
          <span>সেটিংস ও পুরস্কার সংরক্ষণ করুন</span>
        </button>
      </form>

      {/* 2. Admin PIN Management */}
      <form
        onSubmit={handleChangePin}
        className="rounded-2xl bg-[#061e18] border border-emerald-900/60 p-4 sm:p-5 shadow space-y-3"
      >
        <div className="pb-2 border-b border-emerald-900/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>অ্যাডমিন পিন পরিবর্তন</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            অননুমোদিত প্রবেশ রোধে ৪-৬ সংখ্যার পিন কোড সেট করুন
          </p>
        </div>

        {pinMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              pinMessage.isError
                ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {pinMessage.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{pinMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              বর্তমান পিন:
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="বর্তমান পিন"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              নতুন পিন:
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="নতুন পিন"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              নতুন পিন নিশ্চিত করুন:
            </label>
            <input
              type="password"
              required
              maxLength={8}
              placeholder="পুনরায় নতুন পিন"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition shadow"
        >
          পিন আপডেট করুন
        </button>
      </form>

      {/* 3. Export / Import Backup JSON */}
      <div className="rounded-2xl bg-[#061e18] border border-emerald-900/60 p-4 sm:p-5 shadow space-y-3">
        <div className="pb-2 border-b border-emerald-900/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>টুর্নামেন্ট হাব ডেটা ব্যাকআপ ও রিস্টোর</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            সকল টুর্নামেন্ট ও ম্যাচের হিস্ট্রি সহ সম্পূর্ণ ব্যাকআপ JSON ডাউনলোড বা রিস্টোর করুন
          </p>
        </div>

        {backupNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
            {backupNotice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="min-h-[44px] rounded-xl bg-[#082a20] hover:bg-[#0b382b] text-emerald-300 border border-emerald-700/60 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>সম্পূর্ণ ব্যাকআপ ডাউনলোড (Export)</span>
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] rounded-xl bg-[#082a20] hover:bg-[#0b382b] text-emerald-300 border border-emerald-700/60 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>ব্যাকআপ ফাইল আপলোড (Import)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Reset & Restore Tools */}
      <div className="rounded-2xl bg-red-950/20 border border-red-900/50 p-4 sm:p-5 shadow space-y-3">
        <div className="pb-2 border-b border-red-900/40">
          <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>ডেটা রিসেট ও ডেমো টেস্ট টুল</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            আসল টুর্নামেন্ট শুরুর পূর্বে টেস্ট ডেটা পরিষ্কার করার জন্য
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="w-full sm:flex-1 min-h-[44px] rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>সব ডেটা রিসেট করুন (Wipe Data)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('আপনি কি পূর্বনির্ধারিত ডেমো ডেটা পুনরায় লোড করতে চান?')) {
                restoreDemoData();
                setBackupNotice('ডেমো ডেটা সফলভাবে রিস্টোর হয়েছে!');
                setTimeout(() => setBackupNotice(null), 3000);
              }
            }}
            className="w-full sm:flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            ডেমো ডেটা রিস্টোর করুন
          </button>
        </div>
      </div>

      {/* Safety Confirmation Modal for Reset */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-red-500/60 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>সব ডেটা মুছে ফেলার নিশ্চিতকরণ</span>
              </h3>
            </div>

            <div className="mt-3 space-y-3 text-xs text-slate-300">
              <p>
                এই বাটনে চাপ দিলে সমস্ত টুর্নামেন্ট, দল, এবং ম্যাচের ফলাফল স্থায়ীভাবে মুছে যাবে।
              </p>
              <p className="font-semibold text-amber-300">
                নিশ্চিত হতে নিচের ঘরে বড় হাতের অক্ষরে <strong className="text-white">RESET</strong> লিখুন:
              </p>

              <input
                type="text"
                placeholder="RESET"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full min-h-[44px] bg-slate-800 border border-red-500/60 rounded-xl px-3 text-sm text-center text-white font-mono uppercase tracking-widest"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow"
                >
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
