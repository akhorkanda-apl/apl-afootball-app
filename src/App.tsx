/**
 * Akhorkanda Premier League (APL) - Football Tournament Management & Live Score
 */

import React, { useEffect, useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { LiveMatchView } from './components/LiveMatchView';
import { FixturesView } from './components/FixturesView';
import { PointsTableView } from './components/PointsTableView';
import { StatsView } from './components/StatsView';
import { CommitteeView } from './components/CommitteeView';
import { NoticeView } from './components/NoticeView';
import { AdminModal } from './components/admin/AdminModal';
import { AplLogo } from './components/AplLogo';

function MainTournamentApp() {
  const { matches } = useTournament();
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedMatchForAdminLive, setSelectedMatchForAdminLive] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Connectivity monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const hasLiveMatch = matches.some((m) => m.status === 'live');

  const handleOpenLiveController = (matchId: string) => {
    setSelectedMatchForAdminLive(matchId);
    setIsAdminOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#061410] text-slate-100 flex flex-col font-bengali stadium-glow selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenAdmin={() => {
          setSelectedMatchForAdminLive(undefined);
          setIsAdminOpen(true);
        }}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        {activeTab === 'live' && (
          <LiveMatchView onOpenLiveController={handleOpenLiveController} />
        )}
        {activeTab === 'fixtures' && (
          <FixturesView
            onSelectLiveMatch={(mId) => {
              setActiveTab('live');
            }}
          />
        )}
        {activeTab === 'table' && <PointsTableView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'committee' && <CommitteeView />}
        {activeTab === 'rules' && <NoticeView />}
      </main>

      {/* Mobile-First Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        hasLiveMatch={hasLiveMatch}
      />

      {/* Super Admin Control Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        initialMatchIdForLive={selectedMatchForAdminLive}
      />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <MainTournamentApp />
    </TournamentProvider>
  );
}
