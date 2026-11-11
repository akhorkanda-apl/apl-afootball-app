import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  WifiOff,
  Languages,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { AplLogo } from './AplLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { getTournamentFormatLabel } from '../utils/bengali';

interface HeaderProps {
  onOpenAdmin: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isOnline }) => {
  const {
    orgSettings,
    tournaments,
    activeTournament,
    activeTournamentId,
    setActiveTournamentId,
    isAdmin,
    useBengaliNumerals,
    setUseBengaliNumerals,
  } = useTournament();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#041410]/95 backdrop-blur-md border-b border-emerald-900/60 shadow-lg">
      {!isOnline && (
        <div className="bg-amber-600/95 text-white text-[11px] font-medium py-1 px-3 text-center flex items-center justify-center gap-1.5 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>অফলাইন মোড — ক্যাশ করা পূর্ববর্তী তথ্য প্রদর্শিত হচ্ছে</span>
        </div>
      )}

      {/* Row 1: Permanent Organization Header (আখরকান্দা প্রিমিয়ার লিগ - APL) */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 border-b border-emerald-950/70">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <AplLogo size="sm" customUrl={orgSettings.customLogoUrl} />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate leading-tight font-display flex items-center gap-1.5">
              <span>{orgSettings.orgName}</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold truncate leading-none mt-0.5">
              অফিসিয়াল স্পোর্টস ও টুর্নামেন্ট হাব
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Numeral Toggle */}
          <button
            onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
            className="min-h-[38px] px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-[11px] font-semibold text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition flex items-center gap-1"
            title="সংখ্যা পরিবর্তন (বাংলা / ইংরেজি)"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{useBengaliNumerals ? '১২৩' : '123'}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Admin Panel Trigger */}
          <button
            onClick={onOpenAdmin}
            className={`min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition shadow-sm active:scale-95 ${
              isAdmin
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 font-bold'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
            }`}
            title="অ্যাডমিন প্যানেল"
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">অ্যাডমিন সক্রিয়</span>
                <span className="sm:hidden">অ্যাডমিন</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span>অ্যাডমিন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Multi-Tournament Switcher Bar */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-1.5 bg-[#03110d] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="relative flex-1 max-w-xs sm:max-w-md">
            <select
              value={activeTournamentId}
              onChange={(e) => setActiveTournamentId(e.target.value)}
              className="w-full bg-[#07241b] border border-emerald-700/60 text-amber-300 font-bold text-xs sm:text-sm rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 appearance-none truncate cursor-pointer shadow-inner"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1">
                  🏆 {t.name} ({getTournamentFormatLabel(t.format)})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-medium truncate max-w-[200px]">
            {activeTournament.defaultVenue}
          </span>
          <span>·</span>
          <span className="text-amber-400 font-semibold">
            {getTournamentFormatLabel(activeTournament.format)}
          </span>
        </div>
      </div>
    </header>
  );
};
