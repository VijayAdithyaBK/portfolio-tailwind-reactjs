import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { useLeaderboard, GAME_CONFIGS } from '../context/LeaderboardContext';
import { Trophy, Medal, Calendar } from 'lucide-react';

const Leaderboard = () => {
    const { getScores } = useLeaderboard();
    const [selectedGame, setSelectedGame] = useState('pong');

    const scores = getScores(selectedGame);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatScore = (score, gameId, metadata) => {
        const config = GAME_CONFIGS[gameId];
        if (!config) return score;

        if (config.sortBy === 'desc_time_asc') {
            if (metadata && metadata.time !== undefined) {
                const m = Math.floor(metadata.time / 60);
                const s = metadata.time % 60;
                return `${score} (${m}:${s.toString().padStart(2, '0')})`;
            }
            return score;
        }

        if (config.format === 'time') {
            const m = Math.floor(score / 60);
            const s = score % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        }
        return score + (config.suffix || '');
    };



    return (
        <Layout>
            <div className="h-full w-full overflow-y-auto overflow-x-hidden">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3 mb-2">
                            <Trophy className="text-yellow-400 w-10 h-10" fill="currentColor" />
                            Global Leaderboard
                        </h1>
                        <p className="text-slate-500">Top players across the arcade.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Game Selector Sidebar */}
                        <div className="md:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-0">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Select Game</div>
                                <div className="p-2 space-y-1">
                                    {Object.keys(GAME_CONFIGS).map(gameId => (
                                        <button
                                            key={gameId}
                                            onClick={() => setSelectedGame(gameId)}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedGame === gameId
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {GAME_CONFIGS[gameId].name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Scores List */}
                        <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[500px]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Medal className="text-blue-500" />
                                    {GAME_CONFIGS[selectedGame]?.name} Rankings
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Rank</th>
                                            <th className="px-6 py-4 font-bold">Player</th>
                                            <th className="px-6 py-4 font-bold">
                                                {GAME_CONFIGS[selectedGame]?.format === 'time' ? 'Time' : 'Score'}
                                            </th>
                                            <th className="px-6 py-4 font-bold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {scores.length > 0 ? (
                                            scores.map((entry, index) => (
                                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-500'}
                                                    `}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-700">{entry.username}</td>
                                                    <td className="px-6 py-4 font-mono font-bold text-blue-600 text-lg">
                                                        {formatScore(entry.score, selectedGame, entry.metadata)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {formatDate(entry.date)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                                    <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                                    <p className="font-bold">No scores yet.</p>
                                                    <p className="text-sm">Be the first to set a record!</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Leaderboard;
