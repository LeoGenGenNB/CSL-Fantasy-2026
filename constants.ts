
import { Club, Player, Position, FormationConfig } from './types';

export const SCORING_RULES = {
  PLAYING_60_MINS: 2,
  PLAYING_LESS_60: 1,
  GOAL_GK: 6,
  GOAL_DEF: 6,
  GOAL_MID: 5,
  GOAL_FWD: 4,
  ASSIST: 3,
  CLEAN_SHEET_GK: 4,
  CLEAN_SHEET_DEF: 4,
  CLEAN_SHEET_MID: 1,
  PENALTY_SAVE: 5,
  PENALTY_MISS: -2,
  TWO_GOALS_CONCEDED: -1,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  SAVE_EVERY_3: 1,
};

export const FORMATION_CONFIGS: Record<string, FormationConfig> = {
  '4-4-2': { [Position.GK]: 1, [Position.DEF]: 4, [Position.MID]: 4, [Position.FWD]: 2 },
  '4-3-3': { [Position.GK]: 1, [Position.DEF]: 4, [Position.MID]: 3, [Position.FWD]: 3 },
  '3-5-2': { [Position.GK]: 1, [Position.DEF]: 3, [Position.MID]: 5, [Position.FWD]: 2 },
  '3-4-3': { [Position.GK]: 1, [Position.DEF]: 3, [Position.MID]: 4, [Position.FWD]: 3 },
  '5-3-2': { [Position.GK]: 1, [Position.DEF]: 5, [Position.MID]: 3, [Position.FWD]: 2 },
  '5-4-1': { [Position.GK]: 1, [Position.DEF]: 5, [Position.MID]: 4, [Position.FWD]: 1 },
};

// Full 16 Team CSL Roster (2026 Projected)
export const CLUBS: Club[] = [
  { id: 1, name: '上海海港', shortName: 'SHP', primaryColor: '#D32F2F', secondaryColor: '#B71C1C' },
  { id: 2, name: '上海申花', shortName: 'SHS', primaryColor: '#1976D2', secondaryColor: '#0D47A1' },
  { id: 3, name: '成都蓉城', shortName: 'CDR', primaryColor: '#C62828', secondaryColor: '#FFFFFF' },
  { id: 4, name: '北京国安', shortName: 'BJG', primaryColor: '#388E3C', secondaryColor: '#1B5E20' },
  { id: 5, name: '山东泰山', shortName: 'SDT', primaryColor: '#E64A19', secondaryColor: '#FF5722' },
  { id: 6, name: '天津津门虎', shortName: 'TJT', primaryColor: '#1565C0', secondaryColor: '#FFFFFF' },
  { id: 7, name: '浙江队', shortName: 'ZHP', primaryColor: '#2E7D32', secondaryColor: '#81C784' },
  { id: 8, name: '河南队', shortName: 'HEN', primaryColor: '#D32F2F', secondaryColor: '#1565C0' },
  { id: 9, name: '长春亚泰', shortName: 'CCY', primaryColor: '#B71C1C', secondaryColor: '#FFCDD2' },
  { id: 10, name: '青岛西海岸', shortName: 'QWC', primaryColor: '#FBC02D', secondaryColor: '#303F9F' },
  { id: 11, name: '武汉三镇', shortName: 'WHT', primaryColor: '#1E88E5', secondaryColor: '#FFFFFF' },
  { id: 12, name: '青岛海牛', shortName: 'QHN', primaryColor: '#F57F17', secondaryColor: '#000000' },
  { id: 13, name: '沧州雄狮', shortName: 'CZM', primaryColor: '#0277BD', secondaryColor: '#FFFFFF' },
  { id: 14, name: '深圳新鹏城', shortName: 'SZP', primaryColor: '#00BCD4', secondaryColor: '#FFFFFF' },
  { id: 15, name: '梅州客家', shortName: 'MZH', primaryColor: '#C2185B', secondaryColor: '#FFFFFF' },
  { id: 16, name: '大连英博', shortName: 'DLY', primaryColor: '#000000', secondaryColor: '#FFFFFF' }, // Promoted placeholder
];

// Helper to generate a player
const createPlayer = (id: number, webName: string, pos: Position, clubId: number, price: number): Player => ({
  id,
  firstName: '',
  lastName: '',
  webName,
  position: pos,
  clubId,
  price,
  selectedByPercent: Math.floor(Math.random() * 30),
  form: Math.floor(Math.random() * 10) / 10 + 1,
  totalSeasonPoints: Math.floor(Math.random() * 40),
  isInjured: Math.random() > 0.98,
  stats: {
    minutes: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    goalsConceded: 0,
    ownGoals: 0,
    penaltiesSaved: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    bonus: 0,
    totalPoints: 0,
  }
});

let playerIdCounter = 1;
const PLAYERS_DB: Player[] = [];

// Define star players to ensure realism
const REAL_PLAYERS: Record<number, Array<{name: string, pos: Position, price: number}>> = {
  1: [ // SHP
    { name: '武磊', pos: Position.FWD, price: 12.0 }, { name: '奥斯卡', pos: Position.MID, price: 10.5 },
    { name: '颜骏凌', pos: Position.GK, price: 5.5 }, { name: '蒋光太', pos: Position.DEF, price: 6.0 },
    { name: '巴尔加斯', pos: Position.MID, price: 8.0 }, { name: '古斯塔沃', pos: Position.FWD, price: 9.0 },
    { name: '王燊超', pos: Position.DEF, price: 5.0 }, { name: '李帅', pos: Position.DEF, price: 5.5 }
  ],
  2: [ // SHS
    { name: '马莱莱', pos: Position.FWD, price: 9.0 }, { name: '特谢拉', pos: Position.MID, price: 8.5 },
    { name: '朱辰杰', pos: Position.DEF, price: 5.5 }, { name: '蒋圣龙', pos: Position.DEF, price: 5.5 },
    { name: '安德烈', pos: Position.FWD, price: 9.5 }, { name: '鲍亚雄', pos: Position.GK, price: 5.0 },
    { name: '阿马杜', pos: Position.MID, price: 6.5 }, { name: '吴曦', pos: Position.MID, price: 6.0 }
  ],
  3: [ // CDR
    { name: '韦世豪', pos: Position.MID, price: 7.5 }, { name: '费利佩', pos: Position.FWD, price: 8.5 },
    { name: '罗慕洛', pos: Position.MID, price: 7.5 }, { name: '周定洋', pos: Position.MID, price: 6.5 },
    { name: '蹇韬', pos: Position.GK, price: 4.5 }, { name: '唐淼', pos: Position.DEF, price: 5.0 }
  ],
  4: [ // BJG
    { name: '法比奥', pos: Position.FWD, price: 8.5 }, { name: '张玉宁', pos: Position.FWD, price: 8.0 },
    { name: '张稀哲', pos: Position.MID, price: 6.5 }, { name: '恩加德乌', pos: Position.DEF, price: 6.0 },
    { name: '李磊', pos: Position.DEF, price: 5.0 }, { name: '古加', pos: Position.MID, price: 7.0 }
  ],
  5: [ // SDT
    { name: '克雷桑', pos: Position.MID, price: 9.0 }, { name: '王大雷', pos: Position.GK, price: 5.0 },
    { name: '刘洋', pos: Position.DEF, price: 5.5 }, { name: '高准翼', pos: Position.DEF, price: 5.5 },
    { name: '泽卡', pos: Position.FWD, price: 8.5 }, { name: '李源一', pos: Position.MID, price: 6.0 }
  ]
  // ... other clubs will get generic fillers + maybe 1 star
};

// Generate full roster for all 16 clubs
CLUBS.forEach(club => {
  // 1. Add Real Stars
  const stars = REAL_PLAYERS[club.id] || [];
  stars.forEach(star => {
    PLAYERS_DB.push(createPlayer(playerIdCounter++, star.name, star.pos, club.id, star.price));
  });

  // 2. Fill gaps to reach ~25 players per team
  const counts = { [Position.GK]: 0, [Position.DEF]: 0, [Position.MID]: 0, [Position.FWD]: 0 };
  stars.forEach(s => counts[s.pos]++);

  const fill = (pos: Position, target: number, basePrice: number) => {
    while (counts[pos] < target) {
      counts[pos]++;
      const price = basePrice + (Math.random() * 1.5) - 0.5;
      PLAYERS_DB.push(createPlayer(playerIdCounter++, `${club.shortName} ${pos} ${counts[pos]}`, pos, club.id, Number(price.toFixed(1))));
    }
  };

  fill(Position.GK, 3, 4.0);
  fill(Position.DEF, 8, 4.5);
  fill(Position.MID, 10, 5.0);
  fill(Position.FWD, 4, 5.5);
});

export const MOCK_PLAYERS = PLAYERS_DB;
