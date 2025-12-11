import React, { createContext, useContext, useState, useEffect } from 'react';

const LeaderboardContext = createContext();

export const GAME_CONFIGS = {
    'pong': { name: 'Ping Pong', sortBy: 'desc', format: 'number' },
    'snake': { name: 'Snake', sortBy: 'desc', format: 'number' },
    'flappy': { name: 'Flappy Bird', sortBy: 'desc', format: 'number' },
    'breakout': { name: 'Breakout', sortBy: 'desc', format: 'number' },
    'whack': { name: 'Whack-a-Mole', sortBy: 'desc', format: 'number' },
    'simon': { name: 'Simon Says', sortBy: 'desc', format: 'number' },
    '2048': { name: '2048 Puzzle', sortBy: 'desc_time_asc', format: 'number' }, // Score desc, Time asc
    'minesweeper': { name: 'Minesweeper', sortBy: 'asc', format: 'time' },     // Time: Lower is better
    // 'tictactoe': { name: 'Tic Tac Toe', sortBy: 'desc', format: 'number' },
    'connect4': { name: 'Connect Four', sortBy: 'asc', format: 'time' },       // Time: Lower is better
    'battleship': { name: 'Battleship', sortBy: 'asc', format: 'number', suffix: ' Moves' }, // Moves: Lower is better
    'memory': { name: 'Memory Match', sortBy: 'asc', format: 'time' },         // Time: Lower is better
    'sudoku': { name: 'Sudoku', sortBy: 'asc', format: 'time' },               // Time: Lower is better
    // 'rps': Removed from leaderboard
};

export const useLeaderboard = () => useContext(LeaderboardContext);

export const LeaderboardProvider = ({ children }) => {
    // Structure: { gameId: [ { username, score, date } ] }
    const [leaderboards, setLeaderboards] = useState({});

    useEffect(() => {
        try {
            const stored = localStorage.getItem('globalLeaderboard');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Optional: Clear 2048 scores if format mismatch (user confusion fix)
                // if (parsed['2048'] && parsed['2048'].some(s => !s.metadata?.time)) {
                //    parsed['2048'] = [];
                //    localStorage.setItem('globalLeaderboard', JSON.stringify(parsed));
                // }
                setLeaderboards(parsed);
            }
        } catch (error) {
            console.error("Failed to parse leaderboard", error);
        }
    }, []);

    const addScore = (gameId, username, score, metadata = {}) => {
        if (!GAME_CONFIGS[gameId]) {
            console.warn(`Unknown gameId: ${gameId}`);
            return;
        }

        setLeaderboards(prev => {
            const gameScores = prev[gameId] || [];
            const newScores = [...gameScores, { username, score, metadata, date: new Date().toISOString() }];

            // Dynamic Sorting
            const config = GAME_CONFIGS[gameId];

            if (config.sortBy === 'desc_time_asc') {
                // Custom for 2048: Score Descending, Time Ascending
                newScores.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score; // Higher score first
                    return (a.metadata?.time || 0) - (b.metadata?.time || 0); // Lower time second
                });
            } else if (config.sortBy === 'asc') {
                newScores.sort((a, b) => a.score - b.score); // Lower is better
            } else {
                newScores.sort((a, b) => b.score - a.score); // Higher is better
            }

            const trimmed = newScores.slice(0, 50);

            const updated = { ...prev, [gameId]: trimmed };
            localStorage.setItem('globalLeaderboard', JSON.stringify(updated));
            return updated;
        });
    };

    const getScores = (gameId) => {
        return leaderboards[gameId] || [];
    };

    return (
        <LeaderboardContext.Provider value={{ leaderboards, addScore, getScores }}>
            {children}
        </LeaderboardContext.Provider>
    );
};
