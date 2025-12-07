import React, { useMemo, useState } from 'react';
import { Player, Position, Club } from '../types';
import { CLUBS } from '../constants';

interface PlayerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  players: Player[];
  onSelect: (player: Player) => void;
  currentBudget: number;
}

const PlayerPickerModal: React.FC<PlayerPickerModalProps> = ({ 
  isOpen, onClose, position, players, onSelect, currentBudget 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState<number | 'all'>('all');

  // Filter players by position, availability (not implemented but could be here), and search
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchPos = p.position === position;
      const matchSearch = p.webName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClub = clubFilter === 'all' || p.clubId === clubFilter;
      return matchPos && matchSearch && matchClub;
    }).sort((a, b) => b.price - a.price); // Sort by price descending
  }, [players, position, searchTerm, clubFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-[#37003c] p-4 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Select {position}</h2>
            <p className="text-xs text-gray-300">Budget Remaining: £{currentBudget.toFixed(1)}m</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-gray-50 border-b flex gap-2">
            <input 
              type="text" 
              placeholder="Search name..." 
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Clubs</option>
              {CLUBS.map(c => <option key={c.id} value={c.id}>{c.shortName}</option>)}
            </select>
        </div>

        {/* List */}
        <div className="overflow-y-auto custom-scrollbar bg-slate-50 flex-1">
           {filteredPlayers.length === 0 ? (
             <div className="p-8 text-center text-gray-400">No players found</div>
           ) : (
             <ul className="divide-y divide-gray-200">
               {filteredPlayers.map(p => {
                 const club = CLUBS.find(c => c.id === p.clubId);
                 const canAfford = p.price <= currentBudget;
                 return (
                   <li 
                      key={p.id} 
                      onClick={() => canAfford && onSelect(p)}
                      className={`flex items-center justify-between p-3 hover:bg-purple-50 transition cursor-pointer ${!canAfford ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm`} style={{backgroundColor: club?.primaryColor}}>
                            {club?.shortName}
                         </div>
                         <div>
                            <div className="font-bold text-gray-800 text-sm">{p.webName}</div>
                            <div className="text-xs text-gray-500">Points: {p.totalSeasonPoints}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`font-bold ${canAfford ? 'text-[#37003c]' : 'text-red-500'}`}>£{p.price.toFixed(1)}m</div>
                         <div className="text-[10px] text-gray-400">Price</div>
                      </div>
                   </li>
                 );
               })}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPickerModal;
