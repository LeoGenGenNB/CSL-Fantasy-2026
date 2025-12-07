
import React from 'react';
import { Match, Player } from '../types';
import { getClubById, getPlayerById } from '../services/gameService';

interface MatchCenterProps {
  matches: Match[];
  players: Player[];
}

const MatchCenter: React.FC<MatchCenterProps> = ({ matches, players }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
         <h2 className="font-bold text-slate-800 text-lg">Gameweek Fixtures</h2>
         <p className="text-slate-500 text-sm">Live scores and updates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map(match => {
          const homeClub = getClubById(match.homeTeamId);
          const awayClub = getClubById(match.awayTeamId);
          
          const goals = match.events.filter(e => e.type === 'goal').sort((a,b) => a.minute - b.minute);
          const homeGoals = goals.filter(e => getPlayerById(e.playerId)?.clubId === match.homeTeamId);
          const awayGoals = goals.filter(e => getPlayerById(e.playerId)?.clubId === match.awayTeamId);

          return (
            <div key={match.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Score Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{backgroundColor: homeClub?.primaryColor}}>
                    {homeClub?.shortName}
                  </div>
                  <span className="font-bold text-slate-800 truncate">{homeClub?.name}</span>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  {match.isFinished ? (
                    <div className="text-2xl font-black text-slate-900 bg-white px-3 py-1 rounded border border-slate-100 shadow-sm">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">
                      VS
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1">{match.isFinished ? 'FT' : '19:30'}</span>
                </div>

                <div className="flex items-center gap-3 w-1/3 justify-end">
                  <span className="font-bold text-slate-800 truncate text-right">{awayClub?.name}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{backgroundColor: awayClub?.primaryColor}}>
                    {awayClub?.shortName}
                  </div>
                </div>
              </div>

              {/* Events */}
              {match.isFinished && (
                <div className="p-3 text-xs bg-white border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="text-right space-y-1">
                    {homeGoals.map((g, i) => {
                       const p = getPlayerById(g.playerId);
                       return <div key={i} className="text-slate-600">{p?.webName} {g.minute}'</div>
                    })}
                  </div>
                  <div className="text-left space-y-1">
                    {awayGoals.map((g, i) => {
                       const p = getPlayerById(g.playerId);
                       return <div key={i} className="text-slate-600">{p?.webName} {g.minute}'</div>
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {matches.length === 0 && (
          <div className="text-center py-10 text-slate-400">
              No fixtures loaded.
          </div>
      )}
    </div>
  );
};

export default MatchCenter;
