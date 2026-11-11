import React, { useState } from 'react';
import { Phone, MessageCircle, User, ShieldCheck, Search, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { AplLogo } from './AplLogo';
import { toBengaliNumber } from '../utils/bengali';

export const CommitteeView: React.FC = () => {
  const { committeeMembers, orgSettings, useBengaliNumerals } = useTournament();
  const [searchTerm, setSearchTerm] = useState('');

  const num = (v: number | string) => (useBengaliNumerals ? toBengaliNumber(v) : String(v));

  const filteredMembers = committeeMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Official Committee Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-b from-[#092b21] via-[#061e18] to-[#041510] border border-emerald-800/60 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-2">
          <AplLogo size="md" customUrl={orgSettings.customLogoUrl} />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              পরিচালনা পরিষদ
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
              কমিটি ও সদস্য ডিরেক্টরি
            </h2>
            <p className="text-xs text-amber-300 font-semibold truncate mt-0.5">
              {orgSettings.orgName}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-emerald-900/50">
          টুর্নামেন্ট পরিচালনা, শৃঙ্খলা রক্ষা এবং সার্বিক সমন্বয়ের দায়িত্বে নিয়োজিত কর্মকর্তা ও সদস্যবৃন্দ।
        </p>
      </div>

      {/* Search & Counter Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[44px] bg-[#061e18] border border-emerald-800/60 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="px-3 py-2.5 rounded-xl bg-[#061e18] border border-emerald-900/60 text-xs text-emerald-300 font-semibold shrink-0">
          মোট সদস্য: {num(filteredMembers.length)} জন
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl bg-[#071d17] border border-emerald-900/60 p-8 text-center text-slate-400">
          <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-70" />
          <p className="text-sm font-semibold text-slate-200">কোনো সদস্য পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? 'অনুসন্ধান পরিবর্তন করে দেখুন' : 'অ্যাডমিন প্যানেল থেকে কমিটি সদস্য যোগ করুন'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMembers.map((member) => {
            const isLeader =
              member.role.includes('সভাপতি') ||
              member.role.includes('সম্পাদক') ||
              member.role.includes('উপদেষ্টা');

            // Format clean phone number for tel: link
            const cleanPhone = member.phone.replace(/[^\d+]/g, '');

            return (
              <div
                key={member.id}
                className={`rounded-2xl bg-gradient-to-b from-[#07241c] to-[#041510] border p-4 shadow transition relative flex flex-col justify-between ${
                  isLeader
                    ? 'border-amber-500/40 hover:border-amber-400/60'
                    : 'border-emerald-900/60 hover:border-emerald-700/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Fixed-size Uniform Profile Photo with Fallback Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shadow flex items-center justify-center">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/80 text-emerald-300">
                          <User className="w-7 h-7 stroke-[1.8]" />
                        </div>
                      )}
                    </div>
                    {isLeader && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                        <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  {/* Member Name & Designation */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase mb-1 border ${
                        isLeader
                          ? 'bg-amber-950/70 text-amber-300 border-amber-600/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                      }`}
                    >
                      {member.role}
                    </span>

                    <h3 className="text-sm font-bold text-white truncate leading-tight">
                      {member.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">
                      {member.phone ? num(member.phone) : 'ফোন নম্বর নেই'}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: One-Tap Call & Message */}
                {member.phone && (
                  <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>কল করুন</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
                      title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">মেসেজ</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
