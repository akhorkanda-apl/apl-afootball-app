/**
 * Multi-Tournament State Management Context for APL Hub
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialCommitteeMembers, initialOrgSettings, initialTournaments } from '../data/initialData';
import {
  AdminUserInfo,
  APL_MAIN_ROW_ID,
  APL_STATE_TABLE,
  AplCloudState,
  checkUserHasAdminRole,
  fetchAplCloudState,
  pushAplCloudState,
  signInAdminWithSupabase,
  signOutAdminFromSupabase,
  supabase,
  updateAdminPasswordInSupabase,
  verifyActiveAdminSession,
} from '../lib/supabase';
import {
  CommitteeMember,
  GroupStanding,
  Match,
  MatchCommentary,
  MatchEvent,
  MatchHalf,
  MatchStatus,
  OrganizationSettings,
  Player,
  Team,
  TopMoM,
  TopScorer,
  Tournament,
} from '../types/tournament';

interface TournamentContextType {
  orgSettings: OrganizationSettings;
  tournaments: Tournament[];
  activeTournament: Tournament;
  activeTournamentId: string;
  teams: Team[];
  matches: Match[];
  isAdmin: boolean;
  adminUser: AdminUserInfo | null;
  isAuthChecking: boolean;
  activeLiveMatchId: string | null;
  activeLiveMatch: Match | undefined;
  useBengaliNumerals: boolean;
  standingsByGroup: Record<string, GroupStanding[]>;
  topScorers: TopScorer[];
  topMoMs: TopMoM[];

  // Committee & Directory
  committeeMembers: CommitteeMember[];
  addCommitteeMember: (memberData: Omit<CommitteeMember, 'id'>) => CommitteeMember;
  updateCommitteeMember: (id: string, updates: Partial<CommitteeMember>) => void;
  deleteCommitteeMember: (id: string) => void;
  reorderCommitteeMembers: (members: CommitteeMember[]) => void;

  // Tournament Switcher & Multi-Tournament Management
  setActiveTournamentId: (id: string) => void;
  createTournament: (
    data: Omit<Tournament, 'id' | 'teams' | 'matches'> & { initialTeamsCount?: number }
  ) => Tournament;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;

  // Organization & Active Tournament Settings
  updateOrgSettings: (updates: Partial<OrganizationSettings>) => void;
  updateActiveTournamentSettings: (updates: Partial<Tournament>) => void;
  setUseBengaliNumerals: (enabled: boolean) => void;

  // Admin Authentication (Supabase Email + Password + admin Role)
  loginAdminWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Groups & Teams within Active Tournament
  addGroup: (groupName: string) => void;
  renameGroup: (oldName: string, newName: string) => void;
  deleteGroup: (groupName: string) => void;
  addTeam: (teamData: Omit<Team, 'id' | 'players'>) => Team;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;

  // Players within Active Tournament
  addPlayer: (teamId: string, playerData: Omit<Player, 'id' | 'teamId'>) => Player | null;
  updatePlayer: (teamId: string, playerId: string, updates: Partial<Player>) => void;
  deletePlayer: (teamId: string, playerId: string) => void;

  // Matches & Fixtures
  addMatch: (matchData: Omit<Match, 'id' | 'events' | 'elapsedSeconds' | 'isTimerRunning'>) => Match;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  deleteMatch: (matchId: string) => void;
  setActiveLiveMatchId: (id: string | null) => void;

  // Live Controller & Penalties
  startTimer: (matchId: string) => void;
  pauseTimer: (matchId: string) => void;
  resetTimer: (matchId: string, seconds?: number) => void;
  setMatchHalf: (matchId: string, half: MatchHalf) => void;
  setMatchStatus: (matchId: string, status: MatchStatus) => void;
  addMatchEvent: (matchId: string, eventData: Omit<MatchEvent, 'id'>) => void;
  removeMatchEvent: (matchId: string, eventId: string) => void;
  setManOfTheMatch: (matchId: string, playerId: string, playerName: string, teamId: string) => void;
  updateScoresDirectly: (matchId: string, team1Score: number, team2Score: number) => void;
  updatePenaltyShootout: (
    matchId: string,
    hasPenalty: boolean,
    team1Penalty?: number,
    team2Penalty?: number
  ) => void;
  addMatchCommentary: (
    matchId: string,
    text: string,
    type?: MatchCommentary['type'],
    minute?: number
  ) => void;
  removeMatchCommentary: (matchId: string, commentaryId: string) => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => { success: boolean; message: string };
  resetAllData: () => void;
  restoreDemoData: () => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

const ORG_STORAGE_KEY = 'apl_org_hub_v3';
const TOURNAMENTS_STORAGE_KEY = 'apl_tournaments_v3';
const COMMITTEE_STORAGE_KEY = 'apl_committee_v3';
const NUMERAL_PREF_KEY = 'apl_numeral_pref_v3';

function normalizeOrgName(settings: OrganizationSettings): OrganizationSettings {
  const next = { ...initialOrgSettings, ...settings };
  if (
    !next.orgName ||
    next.orgName === 'আখরকান্দা প্রিমিয়ার লিগ - APL'
  ) {
    next.orgName = 'আখরকান্দা দক্ষিণ পাড়া প্রিমিয়ার লিগ - APL';
  }
  return next;
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clientIdRef = useRef<string>(
    `apl-client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
  const lastLocalMutationAtRef = useRef<number>(0);
  const [localMutationSeq, setLocalMutationSeq] = useState(0);
  const markLocalMutation = useCallback(() => {
    lastLocalMutationAtRef.current = Date.now();
    setLocalMutationSeq((prev) => prev + 1);
  }, []);

  // Load Org Settings with automatic migration to 'আখরকান্দা দক্ষিণ পাড়া প্রিমিয়ার লিগ - APL'
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(() => {
    try {
      const stored = localStorage.getItem(ORG_STORAGE_KEY);
      if (stored) {
        return normalizeOrgName(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load org settings', e);
    }
    return initialOrgSettings;
  });

  // Load All Tournaments
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load tournaments', e);
    }
    return initialTournaments;
  });

  // Load Committee & Directory Members
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    try {
      const stored = localStorage.getItem(COMMITTEE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load committee members', e);
    }
    return initialCommitteeMembers;
  });

  // Supabase Admin Auth Session (Server-verified Email + Password + admin role)
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const isAdmin = !!adminUser;

  // Numeral preference (Bengali by default)
  const [useBengaliNumerals, setUseBengaliNumerals] = useState<boolean>(() => {
    const pref = localStorage.getItem(NUMERAL_PREF_KEY);
    return pref !== null ? pref === 'true' : true;
  });

  // Active Tournament
  const activeTournamentId = orgSettings.activeTournamentId;
  const activeTournament = useMemo(() => {
    const found = tournaments.find((t) => t.id === activeTournamentId);
    return found || tournaments[0] || initialTournaments[0];
  }, [tournaments, activeTournamentId]);

  // Active Live Match Selector
  const [activeLiveMatchId, setActiveLiveMatchId] = useState<string | null>(() => {
    const live = activeTournament.matches.find((m) => m.status === 'live');
    return live ? live.id : (activeTournament.matches[0]?.id || null);
  });

  // When switching tournaments, update active live match default
  useEffect(() => {
    const live = activeTournament.matches.find((m) => m.status === 'live');
    setActiveLiveMatchId(live ? live.id : (activeTournament.matches[0]?.id || null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTournamentId]);

  // Ensure activeLiveMatchId remains valid if a match is deleted
  useEffect(() => {
    if (
      activeLiveMatchId &&
      !activeTournament.matches.some((m) => m.id === activeLiveMatchId)
    ) {
      const live = activeTournament.matches.find((m) => m.status === 'live');
      setActiveLiveMatchId(live ? live.id : (activeTournament.matches[0]?.id || null));
    }
  }, [activeTournament.matches, activeLiveMatchId]);

  // Persist Org Settings (offline fallback cache)
  useEffect(() => {
    try {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgSettings));
    } catch (e) {
      console.error(e);
    }
  }, [orgSettings]);

  // Persist Tournaments (offline fallback cache)
  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(tournaments));
    } catch (e) {
      console.error(e);
    }
  }, [tournaments]);

  // Persist Committee Members (offline fallback cache)
  useEffect(() => {
    try {
      localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(committeeMembers));
    } catch (e) {
      console.error(e);
    }
  }, [committeeMembers]);

  // Verify Supabase Admin Session on mount, auth state changes, and window focus
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const verified = await verifyActiveAdminSession();
      if (!isMounted) return;
      setAdminUser(verified);
      setIsAuthChecking(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          setAdminUser(null);
          return;
        }
        const hasAdminRole = await checkUserHasAdminRole(session.user);
        if (!isMounted) return;
        if (hasAdminRole) {
          setAdminUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'admin',
          });
        } else {
          await signOutAdminFromSupabase();
          if (isMounted) setAdminUser(null);
        }
      }
    );

  // Re-verify live with Supabase when window regains focus (catches deleted/banned assistants)
    const handleFocus = () => {
      verifyActiveAdminSession().then((verified) => {
        if (!isMounted) return;
        setAdminUser(verified);
      });
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Periodically check active session against Supabase server while logged in as admin
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(async () => {
      const verified = await verifyActiveAdminSession();
      if (!verified) {
        setAdminUser(null);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem(NUMERAL_PREF_KEY, useBengaliNumerals ? 'true' : 'false');
  }, [useBengaliNumerals]);

  // Keep ref of latest state for initial seed & cloud sync
  const latestStateRef = useRef({ orgSettings, tournaments, committeeMembers });
  latestStateRef.current = { orgSettings, tournaments, committeeMembers };

  const applyRemoteCloudState = useCallback((remote: AplCloudState) => {
    if (!remote || typeof remote !== 'object') return;
    if (remote.clientId && remote.clientId === clientIdRef.current) return;
    if (Date.now() - lastLocalMutationAtRef.current < 3000) return;

    if (remote.orgSettings) {
      setOrgSettings(normalizeOrgName(remote.orgSettings));
    }
    if (Array.isArray(remote.tournaments) && remote.tournaments.length > 0) {
      setTournaments(remote.tournaments);
    }
    if (Array.isArray(remote.committeeMembers)) {
      setCommitteeMembers(remote.committeeMembers);
    }
  }, []);

  // Initial Supabase Fetch, Realtime Subscription, & Wake/Fallback Sync on `apl_app_state`
  useEffect(() => {
    let isMounted = true;

    const pullLatestFromCloud = async (allowAdminSeed: boolean) => {
      const remote = await fetchAplCloudState();
      if (!isMounted) return;

      if (remote && remote.orgSettings && Array.isArray(remote.tournaments)) {
        applyRemoteCloudState(remote);
      } else if (allowAdminSeed) {
        const verified = await verifyActiveAdminSession();
        if (verified && isMounted) {
          const snapshot = latestStateRef.current;
          await pushAplCloudState({
            orgSettings: snapshot.orgSettings,
            tournaments: snapshot.tournaments,
            committeeMembers: snapshot.committeeMembers,
            updatedAt: new Date().toISOString(),
            clientId: clientIdRef.current,
          });
        }
      }
    };

    pullLatestFromCloud(true);

    const channel = supabase
      .channel('apl-app-state-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: APL_STATE_TABLE,
          filter: `id=eq.${APL_MAIN_ROW_ID}`,
        },
        (payload) => {
          const newRow = payload.new as { id?: string; data?: AplCloudState } | null;
          if (newRow?.data) {
            applyRemoteCloudState(newRow.data);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          pullLatestFromCloud(false);
        }
      });

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        pullLatestFromCloud(false);
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Lightweight fallback sync every 12s while page is visible (ensures live updates even if WS drops)
    const fallbackPoll = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullLatestFromCloud(false);
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(fallbackPoll);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  }, [applyRemoteCloudState]);

  // Push local mutations to Supabase `apl_app_state` (ONLY when verified admin is active)
  useEffect(() => {
    if (localMutationSeq === 0 || !isAdmin) return;

    const timeout = setTimeout(() => {
      const snapshot = latestStateRef.current;
      pushAplCloudState({
        orgSettings: snapshot.orgSettings,
        tournaments: snapshot.tournaments,
        committeeMembers: snapshot.committeeMembers,
        updatedAt: new Date().toISOString(),
        clientId: clientIdRef.current,
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [localMutationSeq, isAdmin]);

  // Running Timer Loop for Active Live Matches
  const hasRunningTimers = useMemo(
    () => tournaments.some((t) => t.matches.some((m) => m.status === 'live' && m.isTimerRunning)),
    [tournaments]
  );

  useEffect(() => {
    if (!hasRunningTimers) return;

    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount += 1;
      setTournaments((prevTourns) =>
        prevTourns.map((t) => {
          const hasLive = t.matches.some((m) => m.status === 'live' && m.isTimerRunning);
          if (!hasLive) return t;

          return {
            ...t,
            matches: t.matches.map((m) => {
              if (m.status === 'live' && m.isTimerRunning) {
                return {
                  ...m,
                  elapsedSeconds: m.elapsedSeconds + 1,
                };
              }
              return m;
            }),
          };
        })
      );

      // Sync timer clock to cloud every 5 seconds while an admin has the timer running
      if (isAdmin && tickCount % 5 === 0) {
        markLocalMutation();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasRunningTimers, isAdmin, markLocalMutation]);

  // Teams & Matches for Active Tournament
  const teams = activeTournament.teams || [];
  const matches = activeTournament.matches || [];

  // Active Live Match
  const activeLiveMatch = useMemo(() => {
    if (activeLiveMatchId) {
      const found = matches.find((m) => m.id === activeLiveMatchId);
      if (found) return found;
    }
    return matches.find((m) => m.status === 'live') || matches[0];
  }, [matches, activeLiveMatchId]);

  // Derive Standings by Group for Active Tournament (Win = 3, Draw = 1, Loss = 0)
  const standingsByGroup = useMemo(() => {
    const result: Record<string, GroupStanding[]> = {};
    const groupList = activeTournament.groups || [];

    groupList.forEach((group) => {
      const groupTeams = teams.filter((t) => t.group === group);
      const teamStats: Record<string, GroupStanding> = {};

      groupTeams.forEach((t) => {
        teamStats[t.id] = {
          teamId: t.id,
          teamName: t.name,
          teamShortName: t.shortName,
          teamColor: t.color,
          teamLogoUrl: t.logoUrl,
          group,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      });

      // Process matches
      matches.forEach((m) => {
        if (m.status !== 'completed') return;
        const t1 = teamStats[m.team1Id];
        const t2 = teamStats[m.team2Id];

        if (t1 && t2) {
          t1.played += 1;
          t2.played += 1;
          t1.goalsFor += m.team1Score;
          t1.goalsAgainst += m.team2Score;
          t2.goalsFor += m.team2Score;
          t2.goalsAgainst += m.team1Score;

          if (m.team1Score > m.team2Score) {
            t1.won += 1;
            t1.points += 3;
            t2.lost += 1;
          } else if (m.team1Score < m.team2Score) {
            t2.won += 1;
            t2.points += 3;
            t1.lost += 1;
          } else {
            // Draw in regular time: if penalty shootout exists, standings count draw or shoot-out
            t1.drawn += 1;
            t1.points += 1;
            t2.drawn += 1;
            t2.points += 1;
          }

          t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
          t2.goalDifference = t2.goalsFor - t2.goalsAgainst;
        }
      });

      // Sort: Points DESC > GD DESC > GF DESC
      const sorted = Object.values(teamStats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });

      result[group] = sorted;
    });

    return result;
  }, [activeTournament.groups, teams, matches]);

  // Derive Top Scorers for Active Tournament
  const topScorers = useMemo(() => {
    const scorerMap: Record<string, { playerName: string; teamName: string; teamColor: string; goals: number }> = {};

    matches.forEach((m) => {
      m.events.forEach((ev) => {
        if (ev.type === 'goal') {
          const key = `${ev.playerName}_${ev.teamId}`;
          const team = teams.find((t) => t.id === ev.teamId);
          if (!scorerMap[key]) {
            scorerMap[key] = {
              playerName: ev.playerName,
              teamName: team ? team.name : 'অজানা দল',
              teamColor: team ? team.color : '#10b981',
              goals: 0,
            };
          }
          scorerMap[key].goals += 1;
        }
      });
    });

    return Object.values(scorerMap).sort((a, b) => b.goals - a.goals);
  }, [matches, teams]);

  // Derive Top Man of the Match Winners for Active Tournament
  const topMoMs = useMemo(() => {
    const momMap: Record<string, { playerName: string; teamName: string; teamColor: string; awardsCount: number }> = {};

    matches.forEach((m) => {
      if (m.manOfTheMatchPlayerName) {
        const team = teams.find((t) => t.id === m.manOfTheMatchTeamId);
        const key = m.manOfTheMatchPlayerName;
        if (!momMap[key]) {
          momMap[key] = {
            playerName: m.manOfTheMatchPlayerName,
            teamName: team ? team.name : '',
            teamColor: team ? team.color : '#f59e0b',
            awardsCount: 0,
          };
        }
        momMap[key].awardsCount += 1;
      }
    });

    return Object.values(momMap).sort((a, b) => b.awardsCount - a.awardsCount);
  }, [matches, teams]);

  // Multi-Tournament Switcher & Management
  const setActiveTournamentId = (id: string) => {
    setOrgSettings((prev) => ({ ...prev, activeTournamentId: id }));
    if (isAdmin) markLocalMutation();
  };

  const createTournament = (
    data: Omit<Tournament, 'id' | 'teams' | 'matches'> & { initialTeamsCount?: number }
  ): Tournament => {
    const newId = `tourn-${Date.now()}`;
    const newTournament: Tournament = {
      ...data,
      id: newId,
      teams: [],
      matches: [],
    };
    setTournaments((prev) => [newTournament, ...prev]);
    setOrgSettings((prev) => ({ ...prev, activeTournamentId: newId }));
    markLocalMutation();
    return newTournament;
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    markLocalMutation();
  };

  const deleteTournament = (id: string) => {
    if (tournaments.length <= 1) {
      alert('সর্বশেষ টুর্নামেন্টটি মুছে ফেলা যাবে না!');
      return;
    }
    const remaining = tournaments.filter((t) => t.id !== id);
    setTournaments(remaining);
    if (activeTournamentId === id) {
      setOrgSettings((prev) => ({ ...prev, activeTournamentId: remaining[0].id }));
    }
    markLocalMutation();
  };

  const updateOrgSettings = (updates: Partial<OrganizationSettings>) => {
    setOrgSettings((prev) => ({ ...prev, ...updates }));
    markLocalMutation();
  };

  const updateActiveTournamentSettings = (updates: Partial<Tournament>) => {
    updateTournament(activeTournamentId, updates);
  };

  // Supabase Admin Authentication (Email, Password & 'admin' role required)
  const loginAdminWithEmail = async (email: string, password: string) => {
    const res = await signInAdminWithSupabase(email, password);
    if (res.success && res.user) {
      setAdminUser(res.user);
      // Seed cloud state if `main_state` doesn't exist yet in Supabase
      const remote = await fetchAplCloudState();
      if (!remote) {
        const snapshot = latestStateRef.current;
        await pushAplCloudState({
          orgSettings: snapshot.orgSettings,
          tournaments: snapshot.tournaments,
          committeeMembers: snapshot.committeeMembers,
          updatedAt: new Date().toISOString(),
          clientId: clientIdRef.current,
        });
      }
    }
    return { success: res.success, message: res.message };
  };

  const logoutAdmin = async () => {
    await signOutAdminFromSupabase();
    setAdminUser(null);
  };

  const changeAdminPassword = async (newPassword: string) => {
    return updateAdminPasswordInSupabase(newPassword);
  };

  // Group Management inside Active Tournament
  const addGroup = (groupName: string) => {
    const trimmed = groupName.trim();
    if (!trimmed || activeTournament.groups.includes(trimmed)) return;
    updateActiveTournamentSettings({
      groups: [...activeTournament.groups, trimmed],
    });
  };

  const renameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    const updatedGroups = activeTournament.groups.map((g) => (g === oldName ? trimmed : g));
    const updatedTeams = teams.map((t) => (t.group === oldName ? { ...t, group: trimmed } : t));
    updateActiveTournamentSettings({
      groups: updatedGroups,
      teams: updatedTeams,
    });
  };

  const deleteGroup = (groupName: string) => {
    updateActiveTournamentSettings({
      groups: activeTournament.groups.filter((g) => g !== groupName),
    });
  };

  // Team Management inside Active Tournament
  const addTeam = (teamData: Omit<Team, 'id' | 'players'>): Team => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      players: [],
    };
    updateActiveTournamentSettings({
      teams: [...teams, newTeam],
    });
    return newTeam;
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    updateActiveTournamentSettings({
      teams: teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
    });
  };

  const deleteTeam = (teamId: string) => {
    updateActiveTournamentSettings({
      teams: teams.filter((t) => t.id !== teamId),
      matches: matches.filter((m) => m.team1Id !== teamId && m.team2Id !== teamId),
    });
  };

  // Player Management inside Active Tournament
  const addPlayer = (teamId: string, playerData: Omit<Player, 'id' | 'teamId'>): Player | null => {
    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId,
    };
    updateActiveTournamentSettings({
      teams: teams.map((t) =>
        t.id === teamId ? { ...t, players: [...t.players, newPlayer] } : t
      ),
    });
    return newPlayer;
  };

  const updatePlayer = (teamId: string, playerId: string, updates: Partial<Player>) => {
    updateActiveTournamentSettings({
      teams: teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          players: t.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
        };
      }),
    });
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    updateActiveTournamentSettings({
      teams: teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          players: t.players.filter((p) => p.id !== playerId),
        };
      }),
    });
  };

  // Match / Fixture Management inside Active Tournament
  const addMatch = (
    matchData: Omit<Match, 'id' | 'events' | 'elapsedSeconds' | 'isTimerRunning'>
  ): Match => {
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}`,
      events: [],
      elapsedSeconds: 0,
      isTimerRunning: false,
      hasPenaltyShootout: false,
      team1PenaltyScore: 0,
      team2PenaltyScore: 0,
    };
    updateActiveTournamentSettings({
      matches: [newMatch, ...matches],
    });
    return newMatch;
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    updateActiveTournamentSettings({
      matches: matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
    });
  };

  const deleteMatch = (matchId: string) => {
    updateActiveTournamentSettings({
      matches: matches.filter((m) => m.id !== matchId),
    });
    if (activeLiveMatchId === matchId) {
      setActiveLiveMatchId(null);
    }
  };

  // Live Match Controller Operations
  const startTimer = (matchId: string) => {
    updateMatch(matchId, { isTimerRunning: true, status: 'live' });
  };

  const pauseTimer = (matchId: string) => {
    updateMatch(matchId, { isTimerRunning: false });
  };

  const resetTimer = (matchId: string, seconds = 0) => {
    updateMatch(matchId, { elapsedSeconds: seconds, isTimerRunning: false });
  };

  const setMatchHalf = (matchId: string, half: MatchHalf) => {
    const isFinished = half === 'finished';
    const target = matches.find((m) => m.id === matchId);
    updateMatch(matchId, {
      currentHalf: half,
      status: isFinished ? 'completed' : target?.status || 'live',
      isTimerRunning: isFinished ? false : target?.isTimerRunning || false,
    });
  };

  const setMatchStatus = (matchId: string, status: MatchStatus) => {
    const target = matches.find((m) => m.id === matchId);
    updateMatch(matchId, {
      status,
      isTimerRunning: status === 'live' ? target?.isTimerRunning || false : false,
      currentHalf: status === 'completed' ? 'finished' : target?.currentHalf || '1st_half',
    });
  };

  const addMatchEvent = (matchId: string, eventData: Omit<MatchEvent, 'id'>) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const newEvent: MatchEvent = {
      ...eventData,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    let t1Score = target.team1Score;
    let t2Score = target.team2Score;
    if (eventData.type === 'goal') {
      if (eventData.teamId === target.team1Id) t1Score += 1;
      else if (eventData.teamId === target.team2Id) t2Score += 1;
    }

    updateMatch(matchId, {
      events: [...target.events, newEvent],
      team1Score: t1Score,
      team2Score: t2Score,
    });
  };

  const removeMatchEvent = (matchId: string, eventId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const ev = target.events.find((e) => e.id === eventId);
    if (!ev) return;

    let t1Score = target.team1Score;
    let t2Score = target.team2Score;
    if (ev.type === 'goal') {
      if (ev.teamId === target.team1Id && t1Score > 0) t1Score -= 1;
      else if (ev.teamId === target.team2Id && t2Score > 0) t2Score -= 1;
    }

    updateMatch(matchId, {
      events: target.events.filter((e) => e.id !== eventId),
      team1Score: t1Score,
      team2Score: t2Score,
    });
  };

  const setManOfTheMatch = (matchId: string, playerId: string, playerName: string, teamId: string) => {
    updateMatch(matchId, {
      manOfTheMatchPlayerId: playerId,
      manOfTheMatchPlayerName: playerName,
      manOfTheMatchTeamId: teamId,
    });
  };

  const updateScoresDirectly = (matchId: string, team1Score: number, team2Score: number) => {
    updateMatch(matchId, {
      team1Score: Math.max(0, team1Score),
      team2Score: Math.max(0, team2Score),
    });
  };

  const updatePenaltyShootout = (
    matchId: string,
    hasPenalty: boolean,
    team1Penalty = 0,
    team2Penalty = 0
  ) => {
    updateMatch(matchId, {
      hasPenaltyShootout: hasPenalty,
      team1PenaltyScore: Math.max(0, team1Penalty),
      team2PenaltyScore: Math.max(0, team2Penalty),
    });
  };

  const addMatchCommentary = (
    matchId: string,
    text: string,
    type: MatchCommentary['type'] = 'general',
    minute?: number
  ) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const currentMin = minute !== undefined ? minute : Math.max(1, Math.floor(target.elapsedSeconds / 60));
    const newComment: MatchCommentary = {
      id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      minute: currentMin,
      text: text.trim(),
      type,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    updateMatch(matchId, {
      commentary: [newComment, ...(target.commentary || [])],
    });
  };

  const removeMatchCommentary = (matchId: string, commentaryId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;
    updateMatch(matchId, {
      commentary: (target.commentary || []).filter((c) => c.id !== commentaryId),
    });
  };

  // Committee & Directory Management
  const addCommitteeMember = (data: Omit<CommitteeMember, 'id'>): CommitteeMember => {
    const newMember: CommitteeMember = {
      ...data,
      id: `cm-${Date.now()}`,
      order: data.order ?? committeeMembers.length + 1,
    };
    setCommitteeMembers((prev) => [...prev, newMember]);
    markLocalMutation();
    return newMember;
  };

  const updateCommitteeMember = (id: string, updates: Partial<CommitteeMember>) => {
    setCommitteeMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    markLocalMutation();
  };

  const deleteCommitteeMember = (id: string) => {
    setCommitteeMembers((prev) => prev.filter((m) => m.id !== id));
    markLocalMutation();
  };

  const reorderCommitteeMembers = (reordered: CommitteeMember[]) => {
    setCommitteeMembers(reordered);
    markLocalMutation();
  };

  // Backup & Reset
  const exportBackupJson = (): string => {
    const backupData = {
      version: '3.1',
      exportedAt: new Date().toISOString(),
      organization: orgSettings.orgName,
      orgSettings,
      tournaments,
      committeeMembers,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.orgSettings || !Array.isArray(data.tournaments)) {
        return { success: false, message: 'অবৈধ ফাইল ফরম্যাট! ব্যাকআপ ডেটা পাওয়া যায়নি।' };
      }
      setOrgSettings(normalizeOrgName(data.orgSettings));
      setTournaments(data.tournaments);
      if (Array.isArray(data.committeeMembers)) {
        setCommitteeMembers(data.committeeMembers);
      }
      markLocalMutation();
      return { success: true, message: 'টুর্নামেন্ট হাব ডেটা সফলভাবে রিস্টোর হয়েছে!' };
    } catch {
      return { success: false, message: 'ফাইলটি পড়তে ত্রুটি হয়েছে। সঠিক JSON ফাইল নির্বাচন করুন।' };
    }
  };

  const resetAllData = () => {
    const blankTournament: Tournament = {
      id: 'tourn-blank',
      name: 'নতুন টুর্নামেন্ট',
      subtitle: 'ফুটবল টুর্নামেন্ট',
      format: '8_teams',
      defaultVenue: 'আখরকান্দা খেলার মাঠ',
      halfDurationMinutes: 25,
      status: 'active',
      championPrize: 'চ্যাম্পিয়ন ট্রফি',
      runnerUpPrize: 'রানার্স-আপ ট্রফি',
      committeeNote: 'টুর্নামেন্ট পরিচালনা পরিষদ',
      groups: ['গ্রুপ ক', 'গ্রুপ খ'],
      rulesNotice: 'ফিফার আন্তর্জাতিক নিয়ম অনুযায়ী খেলা পরিচালিত হবে।',
      teams: [],
      matches: [],
    };
    setTournaments([blankTournament]);
    setCommitteeMembers([]);
    setOrgSettings((prev) => ({
      ...initialOrgSettings,
      adminPin: prev.adminPin,
      activeTournamentId: 'tourn-blank',
    }));
    setActiveLiveMatchId(null);
    markLocalMutation();
  };

  const restoreDemoData = () => {
    setOrgSettings(initialOrgSettings);
    setTournaments(initialTournaments);
    setCommitteeMembers(initialCommitteeMembers);
    setActiveLiveMatchId('match-1');
    markLocalMutation();
  };

  return (
    <TournamentContext.Provider
      value={{
        orgSettings,
        tournaments,
        activeTournament,
        activeTournamentId,
        teams,
        matches,
        isAdmin,
        adminUser,
        isAuthChecking,
        activeLiveMatchId,
        activeLiveMatch,
        useBengaliNumerals,
        standingsByGroup,
        topScorers,
        topMoMs,
        committeeMembers,
        addCommitteeMember,
        updateCommitteeMember,
        deleteCommitteeMember,
        reorderCommitteeMembers,
        setActiveTournamentId,
        createTournament,
        updateTournament,
        deleteTournament,
        updateOrgSettings,
        updateActiveTournamentSettings,
        setUseBengaliNumerals,
        loginAdminWithEmail,
        logoutAdmin,
        changeAdminPassword,
        addGroup,
        renameGroup,
        deleteGroup,
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addMatch,
        updateMatch,
        deleteMatch,
        setActiveLiveMatchId,
        startTimer,
        pauseTimer,
        resetTimer,
        setMatchHalf,
        setMatchStatus,
        addMatchEvent,
        removeMatchEvent,
        setManOfTheMatch,
        updateScoresDirectly,
        updatePenaltyShootout,
        addMatchCommentary,
        removeMatchCommentary,
        exportBackupJson,
        importBackupJson,
        resetAllData,
        restoreDemoData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
