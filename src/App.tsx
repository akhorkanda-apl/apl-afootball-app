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
  const { matches, orgSettings, setActiveLiveMatchId } = useTournament();
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedMatchForAdminLive, setSelectedMatchForAdminLive] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 950);
    return () => clearTimeout(timer);
  }, []);

  // Sync custom logo to document favicon / apple-touch-icon if customized
  useEffect(() => {
    const customUrl = orgSettings.customLogoUrl?.trim();
    const iconHref = customUrl || '/pwa-192x192.png';
    const appleHref = customUrl || '/apple-touch-icon.png';

    const faviconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="192x192"]');
    const appleEl = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (faviconEl) faviconEl.href = iconHref;
    if (appleEl) appleEl.href = appleHref;
  }, [orgSettings.customLogoUrl]);

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
      {/* Branded Splash Screen */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#04120e] flex flex-col items-center justify-center p-6 text-center cursor-pointer animate-in fade-in"
        >
          <AplLogo size="2xl" customUrl={orgSettings.customLogoUrl} />
          <h1 className="mt-4 text-lg sm:text-xl font-black text-white tracking-tight font-display">
            {orgSettings.orgName}
          </h1>
          <p className="mt-1 text-xs font-semibold text-emerald-400">
            অফিসিয়াল ফুটবল টুর্নামেন্ট ও লাইভ স্কোর হাব
          </p>
        </div>
      )}

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
              setActiveLiveMatchId(mId);
              setActiveTab('live');
            }}
          />
        )}
        {activeTab === 'table' && <PointsTableView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'committee' && <CommitteeView />}
        {activeTab === 'rules' && <NoticeView />}
      </main>

      {/* Organization Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 pt-2 pb-24 text-center border-t border-emerald-950/60">
        <div className="inline-flex items-center justify-center gap-2 text-xs text-slate-400">
          <AplLogo size="xs" customUrl={orgSettings.customLogoUrl} />
          <span className="font-semibold text-emerald-300">{orgSettings.orgName}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          সর্বস্বত্ব সংরক্ষিত · রিয়েল-টাইম ক্লাউড স্কোরবোর্ড ও টুর্নামেন্ট ম্যানেজমেন্ট
        </p>
      </footer>

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
