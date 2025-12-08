
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import Pitch from './components/Pitch';
import AIAnalysisModal from './components/AIAnalysisModal';
import PlayerPickerModal from './components/PlayerPickerModal';
import MatchCenter from './components/MatchCenter';
import LeagueView from './components/LeagueView';
import { UserTeam, Player, Gameweek, SquadPlayer, Position, Match } from './types';
import { MOCK_PLAYERS, FORMATION_CONFIGS } from './constants';
import { simulateGameweekWithMatches, generateFixtures, calculateTeamValue, generateEmptySquad, isSquadComplete } from './services/gameService';
import { generateTeamAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'setup' | 'building' | 'active'>('setup');
  const [activeTab, setActiveTab] = useState<'pitch' | 'fixtures' | 'leagues'>('pitch');
  const [gameweek, setGameweek] = useState<Gameweek>({ id: 1, name: '第 1 轮', deadline: '周五 19:00', isCurrent: true });
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [myTeam, setMyTeam] = useState<UserTeam>({
    id: 'user-1',
    name: '中超梦之队 2026',
    budget: 100.0,
    transfersMade: 0,
    chipsUsed: [],
    squad: [], 
    formation: '4-4-2',
    leagueIds: ['league-global']
  });

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickingForSlotId, setPickingForSlotId] = useState<string | null>(null);
  const [pickingForPosition, setPickingForPosition] = useState<Position>(Position.GK);

  useEffect(() => {
    const fixtures = generateFixtures(1);
    setMatches(fixtures);
  }, []);

  useEffect(() => {
    if (appState === 'active') {
        recalcTotalPoints();
    }
  }, [players, appState, myTeam.squad]);

  const recalcTotalPoints = () => {
    let pts = 0;
    myTeam.squad.filter(s => s.isStarter && s.playerId).forEach(s => {
      const p = players.find(pl => pl.id === s.playerId);
      if (p) {
        let pPts = p.stats.totalPoints;
        if (s.isCaptain) pPts *= 2;
        pts += pPts;
      }
    });
    setTotalPoints(pts);
  };

  const handleSelectFormation = (fmt: string) => {
    const emptySquad = generateEmptySquad(fmt);
    setMyTeam(prev => ({ ...prev, formation: fmt, squad: emptySquad }));
    setAppState('building');
  };

  const handleSlotClick = (slot: SquadPlayer, player: Player | undefined) => {
    if (appState === 'building' || !player) {
      setPickingForSlotId(slot.id);
      setPickingForPosition(slot.position);
      setPickerOpen(true);
    } else {
        alert(`球员: ${player.webName}\n身价: £${player.price}m\n本轮得分: ${player.stats.totalPoints}`);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (myTeam.squad.some(s => s.playerId === player.id)) {
        alert("该球员已在阵容中！");
        return;
    }

    setMyTeam(prev => {
        const newSquad = prev.squad.map(slot => {
            if (slot.id === pickingForSlotId) {
                return { ...slot, playerId: player.id };
            }
            return slot;
        });

        const hasCaptain = newSquad.some(s => s.isCaptain);
        if (!hasCaptain && newSquad.some(s => s.playerId)) {
           const firstPlayer = newSquad.find(s => s.playerId);
           if (firstPlayer) firstPlayer.isCaptain = true;
        }

        return { ...prev, squad: newSquad };
    });
    setPickerOpen(false);
  };

  const currentTeamValue = calculateTeamValue(myTeam.squad, players);
  const remainingBudget = myTeam.budget - currentTeamValue;

  const handleFinishBuilding = () => {
    if (!isSquadComplete(myTeam.squad)) {
        alert("请选满 15 名球员后再开始赛季。");
        return;
    }
    setAppState('active');
  };

  const handleRunSimulation = useCallback(() => {
    const { updatedPlayers, updatedFixtures } = simulateGameweekWithMatches(players, matches);
    setPlayers(updatedPlayers);
    setMatches(updatedFixtures);
    setActiveTab('fixtures'); 
  }, [players, matches]);

  const handleAskAI = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    if (!aiAnalysis) {
        const result = await generateTeamAnalysis(myTeam);
        setAiAnalysis(result);
    }
    setAiLoading(false);
  };

  if (appState === 'setup') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full text-center shadow-2xl">
                <h1 className="text-3xl font-bold text-[#37003c] mb-2">欢迎来到中超 Fantasy '26</h1>
                <p className="text-gray-500 mb-8">请选择你的初始阵型。</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.keys(FORMATION_CONFIGS).map(fmt => (
                        <button 
                            key={fmt}
                            onClick={() => handleSelectFormation(fmt)}
                            className="p-6 border-2 border-slate-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition flex flex-col items-center gap-2 group"
                        >
                            <span className="font-bold text-2xl text-slate-700 group-hover:text-purple-700">{fmt}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
        
        {/* Navbar */}
        <header className="bg-[#37003c] text-white sticky top-0 z-40 shadow-md">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">CSL</div>
               <h1 className="font-bold text-lg tracking-tight hidden sm:block">中超 Fantasy '26</h1>
             </div>
             
             {appState === 'building' ? (
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <div className="text-xs text-purple-200">预算</div>
                         <div className={`font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-white'}`}>£{remainingBudget.toFixed(1)}m</div>
                     </div>
                     <button 
                        onClick={handleFinishBuilding}
                        disabled={!isSquadComplete(myTeam.squad) || remainingBudget < 0}
                        className="bg-green-500 disabled:bg-gray-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                     >
                        确认阵容
                     </button>
                 </div>
             ) : (
                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="hidden sm:block text-gray-300">
                        <span className="text-white font-bold">{gameweek.name}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        总分: <span className="font-bold text-yellow-400">{totalPoints}</span>
                    </div>
                </div>
             )}
          </div>
        </header>

        {/* Sub-Nav */}
        {appState === 'active' && (
            <div className="bg-white border-b border-slate-200 mb-6">
            <div className="max-w-4xl mx-auto flex">
                {[
                { id: 'pitch', label: '我的阵容' },
                { id: 'fixtures', label: '比赛中心' },
                { id: 'leagues', label: '联赛榜单' }
                ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id 
                        ? 'border-[#37003c] text-[#37003c]' 
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>
            </div>
        )}

        <main className="max-w-4xl mx-auto px-4 mt-6">
          
          {appState === 'active' && activeTab === 'pitch' && (
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">当前阵型</span>
                <span className="font-bold text-xl text-slate-800">{myTeam.formation}</span>
                </div>
                
                <div className="flex gap-2">
                    <button 
                    onClick={handleRunSimulation}
                    disabled={matches.every(m => m.isFinished)}
                    className="bg-green-600 disabled:bg-gray-400 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-2"
                    >
                    {matches.every(m => m.isFinished) ? '本轮已完赛' : '模拟本轮'}
                    </button>
                    <button 
                    onClick={handleAskAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-2"
                    >
                    AI 球探
                    </button>
                </div>
            </div>
          )}

          {appState === 'building' && (
              <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">组建你的球队</h2>
                  <p className="text-slate-500 text-sm">点击场上的空球衣以签入球员。</p>
              </div>
          )}

          {/* Content Views */}
          {(activeTab === 'pitch' || appState === 'building') && (
            <Pitch 
                team={myTeam} 
                players={players} 
                onPlayerClick={handleSlotClick}
                showPoints={matches.some(m => m.isFinished)}
             />
          )}

          {activeTab === 'fixtures' && appState === 'active' && (
              <MatchCenter matches={matches} players={players} />
          )}

          {activeTab === 'leagues' && appState === 'active' && (
              <LeagueView userTeam={myTeam} totalPoints={totalPoints} />
          )}

        </main>

        <AIAnalysisModal 
          isOpen={aiModalOpen} 
          onClose={() => setAiModalOpen(false)} 
          analysis={aiAnalysis} 
          loading={aiLoading} 
        />

        <PlayerPickerModal 
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            position={pickingForPosition}
            players={players}
            onSelect={handlePlayerSelect}
            currentBudget={remainingBudget}
        />

      </div>
    </HashRouter>
  );
};

export default App;
