
export enum Position {
  GK = 'GK',
  DEF = 'DEF',
  MID = 'MID',
  FWD = 'FWD'
}

export enum ChipType {
  BENCH_BOOST = 'Bench Boost',
  TRIPLE_CAPTAIN = 'Triple Captain',
  FREE_HIT = 'Free Hit',
  WILDCARD = 'Wildcard'
}

export interface Club {
  id: number;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PlayerStats {
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  totalPoints: number;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  webName: string;
  position: Position;
  clubId: number;
  price: number;
  selectedByPercent: number;
  form: number;
  stats: PlayerStats; // Current gameweek stats
  totalSeasonPoints: number;
  isInjured: boolean;
}

export interface SquadPlayer {
  id: string; // Unique instance ID for the slot
  playerId: number | null; // Null implies empty slot
  isCaptain: boolean;
  isViceCaptain: boolean;
  position: Position; // The designated position for this slot
  isStarter: boolean; // Whether this slot is in the starting XI
  orderIndex: number; // 0-14 for sorting
}

export interface UserTeam {
  id: string;
  name: string;
  budget: number;
  transfersMade: number;
  chipsUsed: ChipType[];
  squad: SquadPlayer[];
  formation: string;
  leagueIds: string[];
}

export interface Gameweek {
  id: number;
  deadline: string;
  isCurrent: boolean;
  name: string;
}

export type FormationConfig = {
  [key in Position]: number; // e.g. { DEF: 4, MID: 4, FWD: 2 } (GK is always 1)
};

// --- New Types for Match Center & Leagues ---

export interface MatchEvent {
  playerId: number;
  type: 'goal' | 'assist' | 'red_card' | 'own_goal';
  minute: number;
}

export interface Match {
  id: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null; // null if not played
  awayScore: number | null;
  events: MatchEvent[];
  isFinished: boolean;
}

export interface LeagueMember {
  userId: string;
  teamName: string;
  managerName: string;
  gameweekPoints: number;
  totalPoints: number;
  rank: number;
}

export interface League {
  id: string;
  name: string;
  code: string; // For joining
  members: LeagueMember[];
}
