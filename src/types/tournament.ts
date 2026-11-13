/**
 * Akhorkanda Premier League (APL) - Types
 */

export type MatchHalf = '1st_half' | 'half_time' | '2nd_half' | 'extra_time' | 'finished';
export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type EventType = 'goal' | 'yellow_card' | 'red_card';
export type PlayerPosition = 'গোলকিপার' | 'ডিফেন্ডার' | 'মিডফিল্ডার' | 'ফরওয়ার্ড';
export type TournamentFormat =
  | 'friendly'
  | '6_teams'
  | '8_teams'
  | '16_teams'
  | 'custom_group_knockout';

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: PlayerPosition;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  group: string; // e.g. "গ্রুপ ক", "গ্রুপ খ"
  color: string; // hex color for jersey/badge
  logoUrl?: string;
  managerName?: string; // টিম ম্যানেজারের নাম
  managerPhone?: string; // ম্যানেজারের মোবাইল নং
  players: Player[];
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string; // e.g. সভাপতি, সহ-সভাপতি, সাধারণ সম্পাদক, ইত্যাদি
  phone: string; // e.g. 017xxxxxxxx
  photoUrl?: string; // compressed base64 or URL
  order?: number;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  teamId: string;
  playerId?: string;
  playerName: string;
  minute: number;
  detail?: string; // e.g. "পেনাল্টি" or "অ্যাসিস্ট: ..."
}

export interface MatchCommentary {
  id: string;
  minute: number;
  text: string;
  type: 'goal' | 'card' | 'save' | 'whistle' | 'general' | 'foul' | 'highlight';
  timestamp: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  round: string; // "গ্রুপ পর্ব", "কোয়ার্টার ফাইনাল", "সেমিফাইনাল", "ফাইনাল", "প্রীতি ম্যাচ"
  group?: string; // "গ্রুপ ক", "গ্রুপ খ"
  date: string; // "2026-11-15"
  time: string; // "15:30"
  venue: string; // Custom editable venue
  referee?: string; // Optional referee name
  status: MatchStatus;
  currentHalf: MatchHalf;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  events: MatchEvent[];
  commentary?: MatchCommentary[]; // Live text commentary updates
  
  // Penalty Shootout (টাইব্রেকার)
  hasPenaltyShootout?: boolean;
  team1PenaltyScore?: number;
  team2PenaltyScore?: number;

  manOfTheMatchPlayerId?: string;
  manOfTheMatchPlayerName?: string;
  manOfTheMatchTeamId?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  category: string; // "টাইটেল স্পন্সর", "কো-স্পন্সর", "জার্সি পার্টনার", ইত্যাদি
  tier?: 'প্রধান পৃষ্ঠপোষক' | 'সহযোগী পৃষ্ঠপোষক' | 'মিডিয়া পার্টনার' | 'অফিসিয়াল পার্টনার';
  tagline?: string;
  logoUrl?: string;
}

export interface Tournament {
  id: string;
  name: string;
  subtitle: string;
  format: TournamentFormat;
  defaultVenue: string;
  halfDurationMinutes: number;
  rulesNotice: string;
  championPrize: string;
  runnerUpPrize: string;
  committeeNote: string;
  groups: string[];
  status: 'active' | 'completed' | 'upcoming';

  // Tournament Awards
  playerOfTournament?: string;
  playerOfTournamentTeam?: string;
  bestGoalkeeper?: string;
  bestGoalkeeperTeam?: string;

  // Sponsors
  sponsors?: Sponsor[];

  teams: Team[];
  matches: Match[];
}

export interface OrganizationSettings {
  orgName: string;
  customLogoUrl: string;
  adminPin?: string;
  activeTournamentId: string;
  enableSoundEffects?: boolean;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;
  teamLogoUrl?: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TopScorer {
  playerName: string;
  teamName: string;
  teamColor: string;
  goals: number;
}

export interface TopMoM {
  playerName: string;
  teamName: string;
  teamColor: string;
  awardsCount: number;
}
