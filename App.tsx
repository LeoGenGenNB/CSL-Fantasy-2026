
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
  // --- State ---
  const [appState, setAppState] = useState<'setup' | 'building' | 'active'>('setup');
  const [activeTab, setActiveTab] = useState<'pitch' | 'fixtures' | 'leagues'>('pitch');
  const [gameweek, setGameweek] = useState<Gameweek>({ id: 1, name: 'GW 1', deadline: 'Fri 19:00', isCurrent: true });
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Initialize with an empty team state
  const [myTeam, setMyTeam] = useState<UserTeam>({
    id: 'user-1',
    name: 'Dragon FC 2026',
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

  // Player Picker State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickingForSlotId, setPickingForSlotId] = useState<string | null>(null);
  const [pickingForPosition, setPickingForPosition] = useState<Position>(Position.GK);

  // --- Effects ---
  useEffect(() => {
    // Generate initial fixtures for GW1
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
    // Only count starters for total points
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

  // --- Handlers ---

  // Phase 1: Formation Selection
  const handleSelectFormation = (fmt: string) => {
    const emptySquad = generateEmptySquad(fmt);
    setMyTeam(prev => ({ ...prev, formation: fmt, squad: emptySquad }));
    setAppState('building');
  };

  // Phase 2: Player Selection
  const handleSlotClick = (slot: SquadPlayer, player: Player | undefined) => {
    // In setup mode, always open picker
    if (appState === 'building' || !player) {
      setPickingForSlotId(slot.id);
      setPickingForPosition(slot.position);
      setPickerOpen(true);
    } else {
        // In active mode, showing details
        alert(`Player: ${player.webName}\nPrice: £${player.price}m\nPoints: ${player.stats.totalPoints}`);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (myTeam.squad.some(s => s.playerId === player.id)) {
        alert("Player already in squad!");
        return;
    }

    setMyTeam(prev => {
        const newSquad = prev.squad.map(slot => {
            if (slot.id === pickingForSlotId) {
                return { ...slot, playerId: player.id };
            }
            return slot;
        });

        // Auto-assign Captain
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
        alert("Please fill all 15 slots before starting the season.");
        return;
    }
    setAppState('active');
  };

  // Phase 3: Game Loop
  const handleRunSimulation = useCallback(() => {
    // Determine which matches haven't been played
    const { updatedPlayers, updatedFixtures } = simulateGameweekWithMatches(players, matches);
    setPlayers(updatedPlayers);
    setMatches(updatedFixtures);
    setActiveTab('fixtures'); // Switch to fixtures to show results
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

  // --- Render ---

  if (appState === 'setup') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full text-center shadow-2xl">
                <h1 className="text-3xl font-bold text-[#37003c] mb-2">Welcome to CSL Fantasy '26</h1>
                <p className="text-gray-500 mb-8">Start by choosing your tactical formation.</p>
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
               <h1 className="font-bold text-lg tracking-tight hidden sm:block">CSL Fantasy '26</h1>
             </div>
             
             {appState === 'building' ? (
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <div className="text-xs text-purple-200">Budget</div>
                         <div className={`font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-white'}`}>£{remainingBudget.toFixed(1)}m</div>
                     </div>
                     <button 
                        onClick={handleFinishBuilding}
                        disabled={!isSquadComplete(myTeam.squad) || remainingBudget < 0}
                        className="bg-green-500 disabled:bg-gray-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                     >
                        Confirm Squad
                     </button>
                 </div>
             ) : (
                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="hidden sm:block text-gray-300">
                        <span className="text-white font-bold">{gameweek.name}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        PTS: <span className="font-bold text-yellow-400">{totalPoints}</span>
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
                { id: 'pitch', label: 'My Team' },
                { id: 'fixtures', label: 'Match Center' },
                { id: 'leagues', label: 'Leagues' }
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
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Formation</span>
                <span className="font-bold text-xl text-slate-800">{myTeam.formation}</span>
                </div>
                
                <div className="flex gap-2">
                    <button 
                    onClick={handleRunSimulation}
                    disabled={matches.every(m => m.isFinished)}
                    className="bg-green-600 disabled:bg-gray-400 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-2"
                    >
                    {matches.every(m => m.isFinished) ? 'GW Finished' : 'Simulate GW'}
                    </button>
                    <button 
                    onClick={handleAskAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-2"
                    >
                    AI Scout
                    </button>
                </div>
            </div>
          )}

          {appState === 'building' && (
              <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Build Your Squad</h2>
                  <p className="text-slate-500 text-sm">Tap on the empty shirts to sign players.</p>
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

        {/* Modals */}
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
