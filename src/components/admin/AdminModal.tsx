import React, { useState } from 'react';
import {
  X,
  LogOut,
  Flame,
  Calendar,
  Users,
  Settings,
  ShieldCheck,
  Trophy,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { AdminLogin } from './AdminLogin';
import { AdminTournaments } from './AdminTournaments';
import { AdminLiveController } from './AdminLiveController';
import { AdminFixtures } from './AdminFixtures';
import { AdminTeams } from './AdminTeams';
import { AdminCommittee } from './AdminCommittee';
import { AdminSettings } from './AdminSettings';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMatchIdForLive?: string;
}

type AdminTab = 'tournaments' | 'live' | 'fixtures' | 'teams' | 'committee' | 'settings';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialMatchIdForLive,
}) => {
  const { isAdmin, adminUser, isAuthChecking, logoutAdmin, activeTournament } = useTournament();
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>(
    initialMatchIdForLive ? 'live' : 'live'
  );
  const [targetMatchIdForLive, setTargetMatchIdForLive] = useState<string | undefined>(
    initialMatchIdForLive
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#051712] border border-emerald-600/40 shadow-2xl text-slate-100 overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#04130e] border-b border-emerald-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                সুপার অ্যাডমিন কন্ট্রোল প্যানেল
              </h2>
              <p className="text-[10px] text-amber-400 font-semibold truncate">
                {isAdmin && adminUser?.email
                  ? `অ্যাডমিন: ${adminUser.email} · ${activeTournament.name}`
                  : `সক্রিয় টুর্নামেন্ট: ${activeTournament.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="min-h-[40px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                title="অ্যাডমিন থেকে লগআউট করুন"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isAuthChecking ? (
          <div className="p-8 flex-1 flex flex-col items-center justify-center gap-2 text-slate-300 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>অ্যাডমিন সেশন যাচাই করা হচ্ছে...</span>
          </div>
        ) : !isAdmin ? (
          <div className="p-4 flex-1 flex items-center justify-center">
            <AdminLogin onSuccess={() => {}} onCancel={onClose} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Admin Tabs */}
            <div className="grid grid-cols-6 bg-[#061e18] border-b border-emerald-900/60 shrink-0">
              <button
                onClick={() => setActiveAdminTab('live')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'live'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">লাইভ</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('fixtures')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'fixtures'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ম্যাচ</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('tournaments')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'tournaments'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">টুর্নামেন্ট</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('teams')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'teams'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">দল</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('committee')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'committee'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">কমিটি</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('settings')}
                className={`min-h-[46px] py-2 px-1 text-xs font-bold transition flex items-center justify-center gap-1 border-b-2 ${
                  activeAdminTab === 'settings'
                    ? 'border-amber-400 text-amber-400 bg-emerald-950/60'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">সেটিংস</span>
              </button>
            </div>

            {/* Scrollable Admin Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeAdminTab === 'live' && (
                <AdminLiveController initialMatchId={targetMatchIdForLive} />
              )}
              {activeAdminTab === 'fixtures' && (
                <AdminFixtures
                  onGoToLiveController={(mId) => {
                    setTargetMatchIdForLive(mId);
                    setActiveAdminTab('live');
                  }}
                />
              )}
              {activeAdminTab === 'tournaments' && <AdminTournaments />}
              {activeAdminTab === 'teams' && <AdminTeams />}
              {activeAdminTab === 'committee' && <AdminCommittee />}
              {activeAdminTab === 'settings' && <AdminSettings />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
