import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Flag, Bomb, Settings, ChevronDown, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const DIFFICULTIES = {
    Easy: { size: 8, mines: 10 },
    Medium: { size: 10, mines: 15 },
    Hard: { size: 12, mines: 25 }
};

const Minesweeper = () => {
    const [grid, setGrid] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [mineCount, setMineCount] = useState(10);
    const [difficulty, setDifficulty] = useState('Medium');
    const [isPlaying, setIsPlaying] = useState(false);

    const [timer, setTimer] = useState(0);
    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isPlaying && !gameOver && !win) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gameOver, win]);

    // Submit score on Win
    useEffect(() => {
        if (win && user) {
            addScore('minesweeper', user.username, timer);
        }
    }, [win]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isPlaying) initGame();
    }, [isPlaying]);

    const initGame = () => {
        setTimer(0);
        const { size, mines } = DIFFICULTIES[difficulty];

        let newGrid = Array(size).fill().map(() => Array(size).fill({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            count: 0
        }));


        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * size);
            const c = Math.floor(Math.random() * size);
            if (!newGrid[r][c].isMine) {
                newGrid[r][c] = { ...newGrid[r][c], isMine: true };
                minesPlaced++;
            }
        }

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!newGrid[r][c].isMine) {
                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (r + i >= 0 && r + i < size && c + j >= 0 && c + j < size) {
                                if (newGrid[r + i][c + j].isMine) count++;
                            }
                        }
                    }
                    newGrid[r][c] = { ...newGrid[r][c], count };
                }
            }
        }

        setGrid(newGrid);
        setGameOver(false);
        setWin(false);
        setMineCount(mines);
    };

    // ... (rest of helper functions: revealCell, floodFill, etc)
    const revealCell = (r, c) => {
        if (gameOver || win || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        if (newGrid[r][c].isMine) {
            setGameOver(true);
            revealAllMines(newGrid);
            setGrid(newGrid);
        } else {
            floodFill(newGrid, r, c);
            setGrid(newGrid);
            checkWin(newGrid);
        }
    };

    const floodFill = (currentGrid, r, c) => {
        const size = DIFFICULTIES[difficulty].size;
        if (r < 0 || r >= size || c < 0 || c >= size || currentGrid[r][c].isRevealed || currentGrid[r][c].isFlagged) return;

        currentGrid[r][c].isRevealed = true;

        if (currentGrid[r][c].count === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    floodFill(currentGrid, r + i, c + j);
                }
            }
        }
    };

    const toggleFlag = (e, r, c) => {
        e.preventDefault();
        if (gameOver || win || grid[r][c].isRevealed) return;

        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;

        setGrid(newGrid);
        setMineCount(prev => newGrid[r][c].isFlagged ? prev - 1 : prev + 1);
    };

    const revealAllMines = (currentGrid) => {
        currentGrid.forEach(row => row.forEach(cell => {
            if (cell.isMine) cell.isRevealed = true;
        }));
    };

    const checkWin = (currentGrid) => {
        const allNonMinesRevealed = currentGrid.every(row =>
            row.every(cell => cell.isMine || cell.isRevealed)
        );
        if (allNonMinesRevealed) {
            setWin(true);
            setGameOver(true);
        }
    };

    const getCellColor = (cell) => {
        if (!cell.isRevealed) return 'bg-slate-300 hover:bg-slate-200 border-b-4 border-r-4 border-slate-400';
        if (cell.isMine) return 'bg-red-500 border border-red-600';
        return 'bg-slate-50 border border-slate-100';
    };

    const getTextColor = (count) => {
        const colors = ['text-transparent', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-yellow-600', 'text-pink-500', 'text-teal-500', 'text-black'];
        return colors[count] || 'text-black';
    };

    const backToMenu = () => {
        setIsPlaying(false);
    };

    const currentSize = DIFFICULTIES[difficulty].size;

    return (
        <Layout>
            <GameWrapper
                title="Minesweeper"
                description="Clear the board without detonating any mines!"
                instructions={[
                    "Click on a cell to reveal it.",
                    "Numbers indicate how many mines are adjacent to that cell.",
                    "Right-click (or hold) to place a flag on suspected mines.",
                    "Clear all non-mine cells to win!"
                ]}
            >
                <div className="flex flex-col items-center">
                    {!isPlaying ? (
                        // ... (Menu)
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full text-center">
                            <Bomb className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Start New Game</h2>
                            <div className="mb-6">
                                <p className="text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Select Difficulty</p>
                                <div className="flex justify-center gap-2">
                                    {Object.keys(DIFFICULTIES).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === level
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={() => setIsPlaying(true)} className="w-full justify-center py-3 text-lg">Play Now</Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-2 text-xl font-bold text-slate-700">
                                    <div className="bg-red-100 p-2 rounded-lg">
                                        <Flag className="text-red-500 w-6 h-6" />
                                    </div>
                                    <span>{mineCount}</span>
                                </div>
                                <div className="font-mono text-2xl font-black text-slate-800">
                                    {formatTime(timer)}
                                </div>
                                {win && (
                                    <div className="text-green-500 font-black animate-bounce text-xl flex flex-col items-center leading-none">
                                        CLEARED!
                                        {user && <span className="text-xs flex items-center gap-1 mt-1"><Trophy size={10} /> Saved</span>}
                                    </div>
                                )}
                                {gameOver && !win && <div className="text-red-500 font-black animate-pulse text-xl">BOOM!</div>}
                                <Button onClick={initGame} variant="secondary" className="p-2 aspect-square rounded-full">
                                    <RotateCcw size={20} />
                                </Button>
                            </div>

                            <div className="p-4 bg-slate-200 rounded-xl shadow-inner inline-block border-4 border-slate-300">
                                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${currentSize}, minmax(0, 1fr))` }}>
                                    {grid.map((row, r) => (
                                        row.map((cell, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                onClick={() => revealCell(r, c)}
                                                onContextMenu={(e) => toggleFlag(e, r, c)}
                                                className={`
                                            w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base cursor-pointer select-none transition-all rounded-[4px]
                                            ${getCellColor(cell)}
                                            active:scale-95
                                        `}
                                            >
                                                {cell.isRevealed ? (
                                                    cell.isMine ? <Bomb size={20} className="text-white animate-workshop" /> :
                                                        <span className={getTextColor(cell.count)}>{cell.count > 0 ? cell.count : ''}</span>
                                                ) : (
                                                    cell.isFlagged ? <Flag size={18} className="text-red-500 drop-shadow-sm" /> : ''
                                                )}
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <Button onClick={backToMenu} variant="outline" className="px-6">
                                    <Settings size={20} /> Menu
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Minesweeper;
