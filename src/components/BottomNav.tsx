import React from 'react';
import { Activity, Calendar, Trophy, Award, BookOpen, Users } from 'lucide-react';

export type TabType = 'live' | 'fixtures' | 'table' | 'stats' | 'committee' | 'rules';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasLiveMatch: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasLiveMatch,
}) => {
  const tabs = [
    {
      id: 'live' as TabType,
      label: 'লাইভ',
      icon: Activity,
      badge: hasLiveMatch,
    },
    {
      id: 'fixtures' as TabType,
      label: 'ফিক্সচার',
      icon: Calendar,
      badge: false,
    },
    {
      id: 'table' as TabType,
      label: 'পয়েন্ট',
      icon: Trophy,
      badge: false,
    },
    {
      id: 'stats' as TabType,
      label: 'তারকা',
      icon: Award,
      badge: false,
    },
    {
      id: 'committee' as TabType,
      label: 'কমিটি',
      icon: Users,
      badge: false,
    },
    {
      id: 'rules' as TabType,
      label: 'নিয়ম',
      icon: BookOpen,
      badge: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#041410]/95 backdrop-blur-lg border-t border-emerald-950/80 shadow-2xl pb-safe">
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative transition-all duration-150 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5] text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] tracking-tight mt-1 truncate max-w-full px-0.5 ${
                  isActive ? 'text-amber-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
