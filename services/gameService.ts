
import { MOCK_PLAYERS, CLUBS, SCORING_RULES, FORMATION_CONFIGS } from '../constants';
import { Player, Position, UserTeam, SquadPlayer, Club, Match, MatchEvent, League, LeagueMember } from '../types';

export const getPlayerById = (id: number): Player | undefined => {
  return MOCK_PLAYERS.find(p => p.id === id);
};

export const getClubById = (id: number): Club | undefined => {
  return CLUBS.find(c => c.id === id);
};

// --- League System ---

const MOCK_LEAGUES: League[] = [
  {
    id: 'league-global',
    name: '中超全球总联赛',
    code: 'GLOBAL',
    members: [
      { userId: 'bot-1', teamName: '北京银河队', managerName: '机器 1 号', gameweekPoints: 45, totalPoints: 120, rank: 1 },
      { userId: 'bot-2', teamName: '上海星辰队', managerName: '机器 2 号', gameweekPoints: 32, totalPoints: 105, rank: 2 },
      { userId: 'bot-3', teamName: '四川火辣队', managerName: '机器 3 号', gameweekPoints: 58, totalPoints: 98, rank: 3 },
    ]
  }
];

export const createLeague = (name: string, managerName: string, teamName: string): League => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newLeague: League = {
    id: `league-${Date.now()}`,
    name,
    code,
    members: [{
      userId: 'user-1',
      teamName,
      managerName,
      gameweekPoints: 0,
      totalPoints: 0,
      rank: 1
    }]
  };
  MOCK_LEAGUES.push(newLeague);
  return newLeague;
};

export const joinLeague = (code: string, managerName: string, teamName: string): League | null => {
  const league = MOCK_LEAGUES.find(l => l.code === code);
  if (!league) return null;
  
  if (!league.members.some(m => m.userId === 'user-1')) {
    league.members.push({
      userId: 'user-1',
      teamName,
      managerName,
      gameweekPoints: 0,
      totalPoints: 0,
      rank: league.members.length + 1
    });
  }
  return league;
};

export const getLeagueDetails = (leagueId: string): League | undefined => {
  return MOCK_LEAGUES.find(l => l.id === leagueId);
};

// --- Fixtures & Simulation ---

export const generateFixtures = (gameweekId: number): Match[] => {
  const shuffledClubs = [...CLUBS].sort(() => 0.5 - Math.random());
  const matches: Match[] = [];
  
  for (let i = 0; i < shuffledClubs.length; i += 2) {
    matches.push({
      id: `gw${gameweekId}-m${i/2}`,
      homeTeamId: shuffledClubs[i].id,
      awayTeamId: shuffledClubs[i+1].id,
      homeScore: null,
      awayScore: null,
      events: [],
      isFinished: false
    });
  }
  return matches;
};

export const simulateGameweekWithMatches = (players: Player[], fixtures: Match[]): { updatedPlayers: Player[], updatedFixtures: Match[] } => {
  const updatedPlayersMap = new Map<number, Player>(players.map(p => [p.id, p]));
  const updatedFixtures: Match[] = [];

  for (const match of fixtures) {
    if (match.isFinished) {
        updatedFixtures.push(match);
        continue;
    }

    const homeGoals = Math.floor(Math.random() * 4); // 0-3
    const awayGoals = Math.floor(Math.random() * 3); // 0-2
    
    const events: MatchEvent[] = [];
    
    const homePlayers = players.filter(p => p.clubId === match.homeTeamId);
    const awayPlayers = players.filter(p => p.clubId === match.awayTeamId);

    const assignGoals = (count: number, teamPlayers: Player[]) => {
      for (let k = 0; k < count; k++) {
         const scorer = teamPlayers[Math.floor(Math.random() * teamPlayers.length)]; 
         events.push({ playerId: scorer.id, type: 'goal', minute: Math.floor(Math.random() * 90) + 1 });
         
         if (Math.random() > 0.4) {
            const assister = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
            if (assister.id !== scorer.id) {
               events.push({ playerId: assister.id, type: 'assist', minute: Math.floor(Math.random() * 90) + 1 });
            }
         }
      }
    };

    assignGoals(homeGoals, homePlayers);
    assignGoals(awayGoals, awayPlayers);

    [...homePlayers, ...awayPlayers].forEach(p => {
        const stats = { ...p.stats };
        
        stats.minutes = 0;
        stats.goals = 0;
        stats.assists = 0;
        stats.cleanSheets = 0;
        stats.goalsConceded = 0;
        stats.yellowCards = 0;
        stats.totalPoints = 0;

        const played = Math.random() > 0.3; 
        if (played) {
            stats.minutes = Math.random() > 0.1 ? 90 : Math.floor(Math.random() * 90);
            
            stats.goals = events.filter(e => e.playerId === p.id && e.type === 'goal').length;
            stats.assists = events.filter(e => e.playerId === p.id && e.type === 'assist').length;
            
            if (p.clubId === match.homeTeamId) {
                stats.goalsConceded = awayGoals;
                if (awayGoals === 0 && (p.position === Position.GK || p.position === Position.DEF || p.position === Position.MID)) {
                     stats.cleanSheets = 1;
                }
            } else {
                stats.goalsConceded = homeGoals;
                if (homeGoals === 0 && (p.position === Position.GK || p.position === Position.DEF || p.position === Position.MID)) {
                     stats.cleanSheets = 1;
                }
            }
            
            if (Math.random() > 0.9) stats.yellowCards = 1;

            const tempPlayer = { ...p, stats }; 
            stats.totalPoints = calculatePlayerPoints(tempPlayer);
            
            updatedPlayersMap.set(p.id, { ...p, stats, totalSeasonPoints: p.totalSeasonPoints + stats.totalPoints });
        } else {
             updatedPlayersMap.set(p.id, { ...p, stats });
        }
    });

    updatedFixtures.push({
        ...match,
        homeScore: homeGoals,
        awayScore: awayGoals,
        events,
        isFinished: true
    });
  }

  return {
    updatedPlayers: Array.from(updatedPlayersMap.values()),
    updatedFixtures
  };
};

export const calculatePlayerPoints = (player: Player): number => {
  const s = player.stats;
  let points = 0;

  if (s.minutes >= 60) points += SCORING_RULES.PLAYING_60_MINS;
  else if (s.minutes > 0) points += SCORING_RULES.PLAYING_LESS_60;

  if (player.position === Position.GK) points += s.goals * SCORING_RULES.GOAL_GK;
  if (player.position === Position.DEF) points += s.goals * SCORING_RULES.GOAL_DEF;
  if (player.position === Position.MID) points += s.goals * SCORING_RULES.GOAL_MID;
  if (player.position === Position.FWD) points += s.goals * SCORING_RULES.GOAL_FWD;

  points += s.assists * SCORING_RULES.ASSIST;

  if (s.cleanSheets > 0) {
    if (player.position === Position.GK) points += SCORING_RULES.CLEAN_SHEET_GK;
    if (player.position === Position.DEF) points += SCORING_RULES.CLEAN_SHEET_DEF;
    if (player.position === Position.MID) points += SCORING_RULES.CLEAN_SHEET_MID;
  }

  points += Math.floor(s.saves / 3) * SCORING_RULES.SAVE_EVERY_3;
  points += s.penaltiesSaved * SCORING_RULES.PENALTY_SAVE;

  points += Math.floor(s.goalsConceded / 2) * SCORING_RULES.TWO_GOALS_CONCEDED;
  points += s.yellowCards * SCORING_RULES.YELLOW_CARD;
  points += s.redCards * SCORING_RULES.RED_CARD;
  points += s.ownGoals * SCORING_RULES.OWN_GOAL;

  points += s.bonus;

  return points;
};

export const generateEmptySquad = (formation: string): SquadPlayer[] => {
  const config = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS['4-4-2'];
  const squad: SquadPlayer[] = [];
  let idCounter = 0;

  const addSlots = (pos: Position, starterCount: number, totalCount: number) => {
    for (let i = 0; i < totalCount; i++) {
      squad.push({
        id: `slot-${idCounter++}`,
        playerId: null,
        isCaptain: false,
        isViceCaptain: false,
        position: pos,
        isStarter: i < starterCount,
        orderIndex: idCounter
      });
    }
  };

  addSlots(Position.GK, 1, 2);
  addSlots(Position.DEF, config[Position.DEF], 5);
  addSlots(Position.MID, config[Position.MID], 5);
  addSlots(Position.FWD, config[Position.FWD], 3);

  const starters = squad.filter(s => s.isStarter);
  const bench = squad.filter(s => !s.isStarter);
  const posOrder = { [Position.GK]: 0, [Position.DEF]: 1, [Position.MID]: 2, [Position.FWD]: 3 };
  starters.sort((a, b) => posOrder[a.position] - posOrder[b.position]);
  bench.sort((a, b) => posOrder[a.position] - posOrder[b.position]);

  return [...starters, ...bench];
};

export const isSquadComplete = (squad: SquadPlayer[]): boolean => {
  return squad.every(s => s.playerId !== null);
};

export const calculateTeamValue = (squad: SquadPlayer[], allPlayers: Player[]): number => {
  return squad.reduce((total, slot) => {
    if (!slot.playerId) return total;
    const p = allPlayers.find(pl => pl.id === slot.playerId);
    return total + (p ? p.price : 0);
  }, 0);
};
