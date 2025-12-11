import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Check, Eraser, Settings, Grid3x3, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const BASE_SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const DIFFICULTIES = {
    Easy: 30,    // Remove 30 numbers
    Medium: 45,  // Remove 45 numbers
    Hard: 55     // Remove 55 numbers
};

const Sudoku = () => {
    const [solution, setSolution] = useState([]);
    const [initialBoard, setInitialBoard] = useState([]);
    const [board, setBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [error, setError] = useState(null);
    const [won, setWon] = useState(false);
    const [difficulty, setDifficulty] = useState('Medium');
    const [isPlaying, setIsPlaying] = useState(false);

    const [timer, setTimer] = useState(0);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isPlaying && !won) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, won]);

    // Submit score on Win
    useEffect(() => {
        if (won && user) {
            addScore('sudoku', user.username, timer);
        }
    }, [won]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ... (Keep existing generation logic)
    const generateNewGame = () => {
        // Simplified Sudoku generation (using base solution + shuffling for now to ensure validity)
        // In a real app, you'd use a backtracking generator.

        // 1. Shuffle Rows/Cols within bands
        let newSolution = BASE_SOLUTION.map(row => [...row]);
        // (Skipping complex shuffle for stability, just using base for now or simple permutation)

        // 2. Create Puzzle by removing numbers
        const numToRemove = DIFFICULTIES[difficulty];
        let newBoard = newSolution.map(row => row.map(val => ({ value: val, isFixed: true, isError: false })));

        let removed = 0;
        while (removed < numToRemove) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (newBoard[r][c].value !== 0) {
                newBoard[r][c] = { value: 0, isFixed: false, isError: false };
                removed++;
            }
        }

        setSolution(newSolution);
        setInitialBoard(newBoard);
        // Deep copy for playable board
        setBoard(newBoard.map(row => row.map(cell => ({ ...cell }))));

        setTimer(0);
        setWon(false);
        setError(null);
        setSelectedCell(null);
        setIsPlaying(true);
    };

    const backToMenu = () => {
        setIsPlaying(false);
        setTimer(0);
    };

    const handleCellClick = (r, c) => {
        if (won) return;
        setSelectedCell({ r, c });
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || won) return;
        const { r, c } = selectedCell;

        if (initialBoard[r][c].isFixed) return;

        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[r][c].value = num;
        newBoard[r][c].isError = false; // Reset error on change

        setBoard(newBoard);

        // Check if full
        checkCompletion(newBoard);
    };

    const checkCompletion = (currentBoard) => {
        let isFull = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentBoard[r][c].value === 0) {
                    isFull = false;
                    break;
                }
            }
        }

        if (isFull) {
            // Validate
            let isValid = true;
            const finalBoard = currentBoard.map(row => row.map(cell => ({ ...cell })));

            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (finalBoard[r][c].value !== solution[r][c]) {
                        isValid = false;
                        finalBoard[r][c].isError = true;
                    }
                }
            }

            if (isValid) {
                setWon(true);
            } else {
                setBoard(finalBoard);
                setError("Some numbers are incorrect!");
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || won || !selectedCell) return;

            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleNumberInput(0);
            }

            // Arrow Navigation
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                const { r, c } = selectedCell;
                if (e.key === 'ArrowUp') setSelectedCell({ r: Math.max(0, r - 1), c });
                if (e.key === 'ArrowDown') setSelectedCell({ r: Math.min(8, r + 1), c });
                if (e.key === 'ArrowLeft') setSelectedCell({ r, c: Math.max(0, c - 1) });
                if (e.key === 'ArrowRight') setSelectedCell({ r, c: Math.min(8, c + 1) });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, won, selectedCell, board]);

    // In JSX, inside the game wrapper, add Timer display:
    return (
        <Layout>
            <GameWrapper
                title="Sudoku"
                description="Fill the grid so that every row, column, and 3x3 box contains digits 1-9."
                instructions={[
                    "Select a cell to highlight it.",
                    "Use the number pad or keyboard to fill in a number.",
                    "Each number 1-9 must appear exactly once in each row, column, and box.",
                    "Use the 'Draft' mode to make notes."
                ]}
            >
                <div className="flex flex-col items-center">
                    {/* ... New Game Setup ... */}
                    {!isPlaying ? (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full text-center">
                            <Grid3x3 className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Start New Game</h2>

                            <div className="mb-6">
                                <p className="text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Select Difficulty</p>
                                <div className="flex justify-center gap-2">
                                    {Object.keys(DIFFICULTIES).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === level
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={generateNewGame} className="w-full justify-center py-3 text-lg">
                                Start Puzzle
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start w-full justify-center">

                            {/* Board */}
                            <div className="bg-slate-800 p-2 rounded-xl shadow-2xl overflow-hidden self-center w-full max-w-[80vmin] aspect-square flex flex-col">
                                <div className="grid grid-cols-9 gap-[1px] bg-slate-400 border-4 border-slate-800 flex-1">
                                    {board.map((row, r) => (
                                        row.map((cell, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                onClick={() => handleCellClick(r, c)}
                                                className={`
                                                    w-full h-full flex items-center justify-center text-base sm:text-xl md:text-2xl font-bold cursor-pointer select-none
                                                    ${(r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-slate-800' : ''}
                                                    ${(c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-slate-800' : ''}
                                                    ${cell.isFixed ? 'bg-slate-200 text-slate-900' : 'bg-white text-blue-600'}
                                                    ${selectedCell?.r === r && selectedCell?.c === c ? 'bg-blue-100 ring-inset ring-2 sm:ring-4 ring-blue-400' : ''}
                                                    ${cell.isError ? 'bg-red-100 text-red-500' : ''}
                                                    ${!cell.isFixed && cell.value === 0 ? 'hover:bg-slate-50' : ''}
                                                `}
                                            >
                                                {cell.value !== 0 ? cell.value : ''}
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 w-full max-w-xs">
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex justify-between items-center">
                                    <span className="font-bold text-slate-500">Time</span>
                                    <span className="font-mono text-xl font-bold text-blue-600">{formatTime(timer)}</span>
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => handleNumberInput(num)}
                                                className="aspect-square rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xl transition-colors border border-slate-200"
                                            >
                                                {num}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleNumberInput(0)}
                                            className="col-span-3 mt-2 flex items-center justify-center gap-2 py-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-bold transition-colors"
                                        >
                                            <Eraser size={18} /> Clear Cell
                                        </button>
                                    </div>
                                </div>

                                {won && (
                                    <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-xl animate-bounce border border-green-200">
                                        🎉 Puzzle Solved!
                                        <div className="text-sm">Time: {formatTime(timer)}</div>
                                        {user && <div className="text-sm mt-2 flex items-center justify-center gap-1"><Trophy size={14} /> Time Saved!</div>}
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-semibold text-sm border border-red-100 animate-shake">
                                        {error}
                                    </div>
                                )}

                                <Button onClick={backToMenu} variant="outline" className="w-full">
                                    <Settings size={18} /> Change Difficulty
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Sudoku;
