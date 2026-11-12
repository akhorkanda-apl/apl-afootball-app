import React, { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  User,
  Phone,
  ArrowUp,
  ArrowDown,
  X,
  Upload,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { CommitteeMember } from '../../types/tournament';
import { compressImageFile } from '../../utils/image';
import { toBengaliNumber } from '../../utils/bengali';

export const AdminCommittee: React.FC = () => {
  const {
    committeeMembers,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    reorderCommitteeMembers,
    useBengaliNumerals,
  } = useTournament();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('সদস্য');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  // Role presets for one-tap selection
  const rolePresets = [
    'সভাপতি',
    'সহ-সভাপতি',
    'সাধারণ সম্পাদক',
    'যুগ্ম সাধারণ সম্পাদক',
    'সাংগঠনিক সম্পাদক',
    'অর্থ ও কোষাধ্যক্ষ',
    'প্রচার ও মিডিয়া সম্পাদক',
    'ক্রীড়া ও শৃঙ্খলা সম্পাদক',
    'দপ্তর সম্পাদক',
    'কার্যনির্বাহী সদস্য',
    'প্রধান উপদেষ্টা',
  ];

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setRole('সদস্য');
    setPhone('');
    setPhotoUrl('');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (member: CommitteeMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setPhotoUrl(member.photoUrl || '');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMessage(null);
      // Auto compress photo to ~200px thumbnail WebP/JPEG for lightweight localStorage storage
      const compressed = await compressImageFile(file, 200, 0.8);
      setPhotoUrl(compressed);
    } catch {
      setErrorMessage('ছবি আপলোড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('সদস্যের নাম লিখুন');
      return;
    }

    if (editingId) {
      updateCommitteeMember(editingId, {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl || undefined,
      });
    } else {
      addCommitteeMember({
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl || undefined,
        order: committeeMembers.length + 1,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, memberName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে '${memberName}' কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      deleteCommitteeMember(id);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= committeeMembers.length) return;

    const copy = [...committeeMembers];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Update order property
    const reordered = copy.map((m, idx) => ({ ...m, order: idx + 1 }));
    reorderCommitteeMembers(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>কমিটি ও কর্মকর্তা পরিচালনা ({num(committeeMembers.length)} জন)</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            ক্লাব কর্মকর্তা ও সদস্যদের নাম, পদবি, ফোন ও ছবি যোগ বা পরিবর্তন করুন
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সদস্য</span>
        </button>
      </div>

      {/* Member Items List */}
      {committeeMembers.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#061e18] border border-emerald-900/60 text-slate-400">
          <User className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-slate-200">এখনও কোনো সদস্য যোগ করা হয়নি</p>
          <p className="text-[11px] text-slate-500 mt-1">
            উপরের 'নতুন সদস্য' বাটনে চাপ দিয়ে যোগ করুন
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {committeeMembers.map((member, idx) => (
            <div
              key={member.id}
              className="p-3 rounded-2xl bg-[#061e18] border border-emerald-900/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Photo or Avatar */}
                <div className="w-11 h-11 rounded-full bg-slate-800 border border-emerald-600/40 overflow-hidden shrink-0 flex items-center justify-center">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/30 truncate">
                      {member.role}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm truncate mt-0.5">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {member.phone || 'ফোন নেই'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Reorder, Edit, Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition"
                  title="উপরে নিন"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === committeeMembers.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition"
                  title="নিচে নিন"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 transition"
                  title="সম্পাদনা করুন"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition"
                  title="মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{editingId ? 'সদস্য তথ্য সম্পাদনা' : 'নতুন সদস্য যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/80 text-red-300 text-xs border border-red-500/40 mt-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="mt-4 space-y-3.5">
              {/* Profile Photo Upload with Compression */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/40 shrink-0 flex items-center justify-center relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                      লোড হচ্ছে...
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300 block">
                    প্রোফাইল ছবি (অপশনাল):
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ছবি বাছুন</span>
                    </button>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="px-2 py-1 rounded-lg bg-slate-700 text-red-300 text-xs hover:bg-slate-600 transition"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সদস্যের নাম: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আলহাজ্ব মোঃ রফিকুল ইসলাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-white placeholder-slate-500"
                />
              </div>

              {/* Role / Designation Input & Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  পদবি (Designation):
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সভাপতি / সাধারণ সম্পাদক"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-white placeholder-slate-500 mb-1.5"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                  {rolePresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        role === r
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  মোবাইল নম্বর (এক-ট্যাপে কল বাটনের জন্য):
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01711234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs sm:text-sm text-white placeholder-slate-500 font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
