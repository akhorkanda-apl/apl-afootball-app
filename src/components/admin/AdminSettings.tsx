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
  ShieldCheck,
  LogOut,
  Smartphone,
  Copy,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { AplLogo } from '../AplLogo';
import { Sponsor } from '../../types/tournament';
import { compressImageFile } from '../../utils/image';

const SUPABASE_OWNER_SQL = `-- ১. আপনার অ্যাসিস্ট্যান্ট/অ্যাডমিনকে 'admin' রোল দিতে (Supabase SQL Editor-এ চালান):
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'assistant@example.com';

-- ২. পাবলিক শুধু পড়তে পারবে (A to Z), আর শুধুমাত্র 'admin' রোল এডিট করতে পারবে:
ALTER TABLE public.apl_app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON public.apl_app_state FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admin role can insert"
ON public.apl_app_state FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Only admin role can update"
ON public.apl_app_state FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');`;

export const AdminSettings: React.FC = () => {
  const {
    orgSettings,
    activeTournament,
    adminUser,
    logoutAdmin,
    changeAdminPassword,
    updateOrgSettings,
    updateActiveTournamentSettings,
    exportBackupJson,
    importBackupJson,
    resetAllData,
    restoreDemoData,
  } = useTournament();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

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

  // Supabase Admin Password & Owner Guide State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showOwnerGuide, setShowOwnerGuide] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 256, 0.85);
      setCustomLogoUrl(compressed);
    } catch {
      setBackupNotice('লোগো ছবিটি আপলোড করতে ব্যর্থ হয়েছে।');
      setTimeout(() => setBackupNotice(null), 3000);
    } finally {
      e.target.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'নতুন পাসওয়ার্ড দুটি মেলেনি!', isError: true });
      return;
    }
    setIsUpdatingPassword(true);
    const res = await changeAdminPassword(newPassword);
    setIsUpdatingPassword(false);
    setPasswordMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleCopyOwnerSql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_OWNER_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    } catch {
      // ignore
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

        {/* Custom Logo URL or Gallery Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            কাস্টম লোগো (গ্যালারি থেকে আপলোড অথবা ইমেজ লিঙ্ক - অপশনাল):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="https://example.com/apl-logo.png"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              className="flex-1 min-h-[44px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white placeholder-slate-600"
            />
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              className="min-h-[44px] px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition"
            >
              <ImageIcon className="w-4 h-4 text-amber-300" />
              <span>গ্যালারি থেকে আপলোড</span>
            </button>
          </div>
        </div>

        {/* Logo & Phone Install App Icon Preview */}
        <div className="p-3 bg-[#051510] rounded-xl border border-emerald-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AplLogo size="md" customUrl={customLogoUrl} />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block">অ্যাপ হেডার ও ক্রেস্ট লোগো</span>
              <span className="text-[11px] text-slate-400">
                {customLogoUrl ? 'কাস্টম ইমেজ ব্যবহৃত হচ্ছে' : 'অফিসিয়াল APL ভেক্টর ক্রেস্ট সক্রিয়'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#061e18] px-3 py-2 rounded-xl border border-emerald-900/60">
            <img
              src={customLogoUrl || '/pwa-192x192.png'}
              alt="ফোন ইনস্টল আইকন"
              className="w-9 h-9 rounded-xl object-cover border border-amber-400/50 shadow"
            />
            <div className="text-[11px]">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>ফোন অ্যাপ আইকন</span>
              </span>
              <span className="text-slate-400 block">APL Football</span>
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

      {/* 2. Supabase Admin Account, Password & Owner Access Control */}
      <div className="rounded-2xl bg-[#061e18] border border-emerald-900/60 p-4 sm:p-5 shadow space-y-3">
        <div className="pb-2 border-b border-emerald-900/40 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>অ্যাডমিন অ্যাকাউন্ট ও অ্যাক্সেস নিয়ন্ত্রণ</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              নতুন সহকারী অ্যাডমিন যুক্ত, বন্ধ বা ডিলিট সরাসরি আপনার মূল Supabase অ্যাকাউন্ট থেকে নিয়ন্ত্রিত হয়
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role: admin</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#051510] border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block">বর্তমানে লগইনকৃত অ্যাডমিন ইমেইল:</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 truncate block">
              {adminUser?.email || 'যাচাইকৃত অ্যাডমিন'}
            </span>
          </div>

          <button
            type="button"
            onClick={logoutAdmin}
            className="min-h-[40px] px-4 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-700/50 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট করুন</span>
          </button>
        </div>

        {/* Update own Supabase password */}
        <form onSubmit={handleChangePassword} className="pt-2 border-t border-emerald-900/40 space-y-2.5">
          <span className="text-xs font-bold text-white block">নিজের পাসওয়ার্ড পরিবর্তন করুন</span>

          {passwordMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                passwordMessage.isError
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {passwordMessage.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="password"
              required
              minLength={6}
              placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full min-h-[42px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="পুনরায় নতুন পাসওয়ার্ড"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full min-h-[42px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full min-h-[40px] rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition shadow disabled:opacity-60"
          >
            {isUpdatingPassword ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
          </button>
        </form>

        {/* Owner Supabase Assistant Management & RLS Guide */}
        <div className="pt-2 border-t border-emerald-900/40">
          <button
            type="button"
            onClick={() => setShowOwnerGuide(!showOwnerGuide)}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-300 hover:text-amber-300 py-1.5 transition"
          >
            <span>মূল মালিকের জন্য: অ্যাসিস্ট্যান্ট/অ্যাডমিন নিয়োগ ও ডিলিট গাইড</span>
            {showOwnerGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showOwnerGuide && (
            <div className="mt-2 p-3 rounded-xl bg-[#04140f] border border-emerald-800/50 space-y-2.5 text-xs text-slate-300">
              <p className="leading-relaxed">
                ১. আপনার <strong className="text-white">Supabase Dashboard → Authentication → Users</strong> থেকে যেকোনো অ্যাসিস্ট্যান্টের জন্য <strong className="text-amber-300">Email ও Password</strong> দিয়ে ইউজার তৈরি করুন।<br />
                ২. তাকে অ্যাডমিন ক্ষমতা দিতে নিচের SQL-টি Supabase SQL Editor-এ চালিয়ে <strong className="text-emerald-300">admin</strong> রোল দিন এবং নিরাপত্তা পলিসি (RLS) চালু করুন।<br />
                ৩. যেকোনো সময় Supabase Dashboard থেকে ইউজারটিকে <strong className="text-red-300">Ban বা Delete</strong> করলে সাথে সাথে তার অ্যাপ এডিট ক্ষমতা বন্ধ হয়ে যাবে।
              </p>

              <div className="relative">
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto leading-relaxed font-mono">
                  {SUPABASE_OWNER_SQL}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyOwnerSql}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'SQL কপি হয়েছে!' : 'SQL কোড কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
