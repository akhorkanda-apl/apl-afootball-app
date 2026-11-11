import React from 'react';
import { BookOpen, MapPin, Award, Users, Sparkles, HeartHandshake } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { AplLogo } from './AplLogo';
import { getTournamentFormatLabel } from '../utils/bengali';

export const NoticeView: React.FC = () => {
  const { activeTournament, orgSettings } = useTournament();

  return (
    <div className="space-y-4 pb-20">
      {/* Official Banner Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#092b21] via-[#061e18] to-[#041510] border border-emerald-800/60 p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-3">
          <AplLogo size="md" customUrl={orgSettings.customLogoUrl} />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              {orgSettings.orgName}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
              {activeTournament.name}
            </h2>
            <p className="text-xs text-amber-400 font-semibold truncate mt-0.5">
              {activeTournament.subtitle} · {getTournamentFormatLabel(activeTournament.format)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-900/40 flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ডিফল্ট ভেন্যু / মাঠ: <strong className="text-white">{activeTournament.defaultVenue}</strong></span>
        </div>
      </div>

      {/* Tournament Awards Hall of Fame (if set) */}
      {(activeTournament.playerOfTournament || activeTournament.bestGoalkeeper) && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/50 via-[#07241c] to-[#041510] border border-amber-500/40 p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2.5 border-b border-amber-900/30 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">টুর্নামেন্ট সেরা পুরস্কার ও ট্রফি</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeTournament.playerOfTournament && (
              <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  টুর্নামেন্ট সেরা খেলোয়াড়
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {activeTournament.playerOfTournament}
                </div>
                {activeTournament.playerOfTournamentTeam && (
                  <div className="text-xs text-slate-400">
                    {activeTournament.playerOfTournamentTeam}
                  </div>
                )}
              </div>
            )}

            {activeTournament.bestGoalkeeper && (
              <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  সেরা গোলরক্ষক (গোল্ডেন গ্লাভস)
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {activeTournament.bestGoalkeeper}
                </div>
                {activeTournament.bestGoalkeeperTeam && (
                  <div className="text-xs text-slate-400">
                    {activeTournament.bestGoalkeeperTeam}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prize Money & Trophies Card (100% Admin Editable) */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-emerald-950/40 to-[#061c16] border border-amber-500/30 p-4 shadow-md">
        <div className="flex items-center gap-2 pb-2.5 border-b border-amber-900/30 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300">পুরস্কার ও প্রাইজমানি</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
            <span className="text-xl">🏆</span>
            <div className="text-xs font-bold text-amber-400 mt-1">চ্যাম্পিয়ন সম্মাননা</div>
            <div className="text-[11px] text-slate-200 font-semibold mt-0.5">
              {activeTournament.championPrize || 'চ্যাম্পিয়ন ট্রফি'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700">
            <span className="text-xl">🥈</span>
            <div className="text-xs font-bold text-slate-300 mt-1">রানার্স-আপ সম্মাননা</div>
            <div className="text-[11px] text-slate-200 font-semibold mt-0.5">
              {activeTournament.runnerUpPrize || 'রানার্স-আপ ট্রফি'}
            </div>
          </div>
        </div>
      </div>

      {/* Official Sponsors & Partners Gallery */}
      {activeTournament.sponsors && activeTournament.sponsors.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-b from-[#08221b] to-[#041510] border border-emerald-800/50 p-4 shadow-md space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900/40">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              টুর্নামেন্ট পৃষ্ঠপোষক ও সহযোগী (Official Sponsors)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeTournament.sponsors.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-[#061e18] border border-emerald-900/40 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center font-bold text-amber-400 text-sm border border-emerald-800/40 shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {s.category}
                  </span>
                  <div className="text-xs font-bold text-white truncate">{s.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules & Directives Card */}
      <div className="rounded-2xl bg-[#071f19] border border-emerald-900/60 p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900/40">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            অফিসিয়াল টুর্নামেন্ট নিয়মাবলী ও জরুরি নোটিশ
          </h3>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2 font-normal">
          {activeTournament.rulesNotice || 'কোনো নিয়মাবলী নথিভুক্ত করা হয়নি।'}
        </div>
      </div>

      {/* Organizer Committee Note (100% Admin Editable) */}
      <div className="rounded-2xl bg-[#061813] border border-emerald-900/40 p-4 text-xs text-slate-400 flex items-start gap-3">
        <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-200 mb-0.5">আয়োজক ও পরিচালনা কমিটি</h4>
          <p className="leading-relaxed text-slate-300">
            {activeTournament.committeeNote || 'আখরকান্দা প্রিমিয়ার লিগ (APL) কেন্দ্রীয় পরিচালনা পরিষদ ও শৃঙ্খলা কমিটি।'}
          </p>
        </div>
      </div>
    </div>
  );
};
