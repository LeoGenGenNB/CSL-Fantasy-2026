import React from 'react';
import { Player, SquadPlayer } from '../types';
import { getClubById } from '../services/gameService';

interface PlayerCardProps {
  player: Player | undefined; // Undefined means empty slot
  squadDetails: SquadPlayer;
  onClick: () => void;
  showPoints?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, squadDetails, onClick, showPoints = false }) => {
  const isCaptain = squadDetails.isCaptain;
  const isVice = squadDetails.isViceCaptain;

  // Empty Slot State
  if (!player) {
    return (
      <div 
        onClick={onClick}
        className="flex flex-col items-center justify-center w-20 sm:w-24 cursor-pointer transition-transform hover:scale-105 active:scale-95 group animate-fade-in"
      >
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-yellow-400 bg-white/20 flex items-center justify-center mb-1 group-hover:bg-white/40 transition-colors">
          <span className="text-white font-bold text-xl drop-shadow-md">+</span>
        </div>
        <div className="bg-yellow-500/90 text-white rounded-sm text-[10px] py-0.5 px-2 font-bold shadow-sm uppercase tracking-wider">
          {squadDetails.position}
        </div>
      </div>
    );
  }

  const club = getClubById(player.clubId);
  const shirtColor = club?.primaryColor || '#999';
  const sleeveColor = club?.secondaryColor || '#666';

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-start w-20 sm:w-24 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
    >
      {/* Shirt Visualization */}
      <div className="relative mb-1">
        <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-md">
           <path d="M20,20 L30,5 L70,5 L80,20 L95,20 L90,40 L80,35 L80,90 L20,90 L20,35 L10,40 L5,20 Z" fill={shirtColor} stroke="#333" strokeWidth="2"/>
           <path d="M20,20 L5,20 L10,40 L20,35 Z" fill={sleeveColor} />
           <path d="M80,20 L95,20 L90,40 L80,35 Z" fill={sleeveColor} />
        </svg>
        
        {player.isInjured && (
          <div className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold px-1 rounded-sm border border-white">
            !
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className={`w-full text-center ${showPoints ? 'bg-white border-green-500 border-2' : 'bg-slate-800/90 text-white'} rounded-sm text-xs py-0.5 px-1 shadow-sm overflow-hidden whitespace-nowrap text-ellipsis z-10 relative`}>
        <div className="font-bold truncate px-1">{player.webName}</div>
        <div className="text-[10px] opacity-90 flex justify-center items-center gap-1">
          {isCaptain && <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[8px] border border-white">C</span>}
          {isVice && <span className="bg-gray-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[8px] border border-white">V</span>}
          <span>{club?.shortName}</span>
        </div>
        {showPoints && (
          <div className="bg-green-100 text-green-800 font-bold border-t border-green-200 mt-0.5">
            {player.stats.totalPoints} pts
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
