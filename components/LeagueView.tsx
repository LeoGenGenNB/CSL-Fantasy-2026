
import React, { useState, useEffect } from 'react';
import { League, UserTeam } from '../types';
import { createLeague, joinLeague, getLeagueDetails } from '../services/gameService';

interface LeagueViewProps {
  userTeam: UserTeam;
  totalPoints: number;
}

const LeagueView: React.FC<LeagueViewProps> = ({ userTeam, totalPoints }) => {
  const [view, setView] = useState<'list' | 'create' | 'join'>('list');
  const [activeLeagueId, setActiveLeagueId] = useState<string>('league-global');
  const [leaguesList, setLeaguesList] = useState<League[]>([]);
  
  // Form States
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Initial Load
  useEffect(() => {
    // In a real app, fetch user's leagues from API
    // Here we just load the global one + any in userTeam.leagueIds (mocked locally)
    const globalLeague = getLeagueDetails('league-global');
    if (globalLeague) setLeaguesList([globalLeague]);
  }, []);

  const activeLeague = leaguesList.find(l => l.id === activeLeagueId);

  // Sorting members by Total Points
  const sortedMembers = activeLeague 
    ? [...activeLeague.members].sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  const handleCreate = () => {
    if (!createName) return;
    const newLeague = createLeague(createName, 'You', userTeam.name);
    setLeaguesList(prev => [...prev, newLeague]);
    setActiveLeagueId(newLeague.id);
    setView('list');
    setCreateName('');
  };

  const handleJoin = () => {
    if (!joinCode) return;
    const joined = joinLeague(joinCode, 'You', userTeam.name);
    if (joined) {
        setLeaguesList(prev => {
            if (prev.find(l => l.id === joined.id)) return prev;
            return [...prev, joined];
        });
        setActiveLeagueId(joined.id);
        setView('list');
        setJoinCode('');
    } else {
        alert('Invalid League Code');
    }
  };

  return (
    <div className="space-y-6">
      {/* League Selector Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Select League</label>
           <select 
             value={activeLeagueId}
             onChange={(e) => setActiveLeagueId(e.target.value)}
             className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 min-w-[200px]"
           >
             {leaguesList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
           </select>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => setView('create')} className="px-3 py-2 bg-[#37003c] text-white text-xs font-bold rounded hover:bg-purple-900">Create League</button>
            <button onClick={() => setView('join')} className="px-3 py-2 bg-white border border-[#37003c] text-[#37003c] text-xs font-bold rounded hover:bg-slate-50">Join League</button>
        </div>
      </div>

      {view === 'create' && (
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 animate-fade-in">
              <h3 className="font-bold text-[#37003c] mb-4">Create New League</h3>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="League Name" 
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <button onClick={handleCreate} className="bg-green-600 text-white font-bold px-4 rounded">Create</button>
                  <button onClick={() => setView('list')} className="text-slate-500 px-2">Cancel</button>
              </div>
          </div>
      )}

      {view === 'join' && (
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 animate-fade-in">
              <h3 className="font-bold text-[#37003c] mb-4">Join Private League</h3>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code (e.g. XY72A)" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="flex-1 p-2 border rounded uppercase"
                  />
                  <button onClick={handleJoin} className="bg-green-600 text-white font-bold px-4 rounded">Join</button>
                  <button onClick={() => setView('list')} className="text-slate-500 px-2">Cancel</button>
              </div>
          </div>
      )}

      {/* Leaderboard */}
      {view === 'list' && activeLeague && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">{activeLeague.name}</h3>
               <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-mono">Code: {activeLeague.code}</span>
           </div>
           
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-slate-500">
                   <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                       <tr>
                           <th className="px-6 py-3">Rank</th>
                           <th className="px-6 py-3">Team & Manager</th>
                           <th className="px-6 py-3 text-center">GW</th>
                           <th className="px-6 py-3 text-center">Total</th>
                       </tr>
                   </thead>
                   <tbody>
                       {sortedMembers.map((member, idx) => {
                           const isMe = member.userId === 'user-1'; // Mock ID check
                           return (
                               <tr key={member.userId} className={`bg-white border-b hover:bg-slate-50 ${isMe ? 'bg-purple-50' : ''}`}>
                                   <td className="px-6 py-4 font-bold text-slate-800">{idx + 1}</td>
                                   <td className="px-6 py-4">
                                       <div className="font-bold text-slate-900">{member.teamName}</div>
                                       <div className="text-xs">{member.managerName} {isMe && '(You)'}</div>
                                   </td>
                                   <td className="px-6 py-4 text-center font-bold text-slate-800">
                                       {isMe ? totalPoints : member.gameweekPoints}
                                   </td>
                                   <td className="px-6 py-4 text-center font-bold text-[#37003c]">
                                       {isMe ? totalPoints + 50 : member.totalPoints} {/* Mock total for demo */}
                                   </td>
                               </tr>
                           );
                       })}
                   </tbody>
               </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeagueView;
