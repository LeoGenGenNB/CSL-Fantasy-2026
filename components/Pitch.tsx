import React from 'react';
import { UserTeam, Player, Position, SquadPlayer } from '../types';
import PlayerCard from './PlayerCard';

interface PitchProps {
  team: UserTeam;
  players: Player[];
  onPlayerClick: (slot: SquadPlayer, player: Player | undefined) => void;
  showPoints: boolean;
}

const Pitch: React.FC<PitchProps> = ({ team, players, onPlayerClick, showPoints }) => {
  const starters = team.squad.filter(s => s.isStarter);
  const bench = team.squad.filter(s => !s.isStarter);

  const getStartersByPos = (pos: Position) => starters.filter(s => s.position === pos);

  const renderRow = (slots: SquadPlayer[]) => (
    <div className="flex justify-center items-center gap-2 sm:gap-6 w-full min-h-[90px] sm:min-h-[110px]">
      {slots.map((slot) => {
        const player = players.find(p => p.id === slot.playerId);
        return (
          <PlayerCard 
            key={slot.id} 
            player={player} 
            squadDetails={slot} 
            onClick={() => onPlayerClick(slot, player)}
            showPoints={showPoints}
          />
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      {/* Field Area */}
      <div className="relative bg-green-600 border-4 border-white/50 rounded-xl overflow-hidden shadow-xl aspect-[3/4] sm:aspect-[4/5] flex flex-col justify-between py-4 sm:py-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.2) 50%)', backgroundSize: '100% 10%'}}></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/30 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            {renderRow(getStartersByPos(Position.GK))}
            {renderRow(getStartersByPos(Position.DEF))}
            {renderRow(getStartersByPos(Position.MID))}
            {renderRow(getStartersByPos(Position.FWD))}
        </div>
      </div>

      {/* Bench Area */}
      <div className="mt-6 bg-slate-100 rounded-xl p-4 shadow-inner border border-slate-200">
        <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-wider">替补席 / Bench</h3>
        <div className="flex justify-center gap-2 sm:gap-6">
           {bench.map(slot => {
             const player = players.find(p => p.id === slot.playerId);
             return (
               <PlayerCard 
                  key={slot.id} 
                  player={player} 
                  squadDetails={slot} 
                  onClick={() => onPlayerClick(slot, player)}
                  showPoints={showPoints}
               />
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default Pitch;