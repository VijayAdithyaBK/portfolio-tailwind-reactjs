import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Check, Eraser, Settings, Grid3x3 } from 'lucide-react';

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

    // ... (Keep existing generation logic)
    const generateNewGame = () => {
        let newSol = JSON.parse(JSON.stringify(BASE_SOLUTION));
        // Shuffle logic (same as before)
        for (let band = 0; band < 3; band++) {
            for (let i = 0; i < 3; i++) {
                const r1 = band * 3 + Math.floor(Math.random() * 3);
                const r2 = band * 3 + Math.floor(Math.random() * 3);
                [newSol[r1], newSol[r2]] = [newSol[r2], newSol[r1]];
            }
        }
        const map = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        newSol = newSol.map(row => row.map(n => map[n - 1]));
        setSolution(newSol);

        // Create puzzle
        const cellsToRemove = DIFFICULTIES[difficulty];
        const newInit = newSol.map(row => [...row]);
        let removed = 0;
        while (removed < cellsToRemove) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (newInit[r][c] !== 0) {
                newInit[r][c] = 0;
                removed++;
            }
        }

        setInitialBoard(newInit);
        setBoard(JSON.parse(JSON.stringify(newInit)));
        setWon(false);
        setError(null);
        setSelectedCell(null);
        setIsPlaying(true);
    };

    const handleCellClick = (row, col) => {
        if (initialBoard[row][col] === 0) {
            setSelectedCell({ row, col });
            setError(null);
        } else {
            setSelectedCell(null);
        }
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || won) return;
        const { row, col } = selectedCell;
        const newBoard = [...board];
        newBoard[row][col] = num;
        setBoard(newBoard);
        if (!newBoard.flat().includes(0)) checkSolution(newBoard);
    };

    const checkSolution = (currentBoard = board) => {
        const isCorrect = JSON.stringify(currentBoard) === JSON.stringify(solution);
        if (isCorrect) {
            setWon(true);
            setError(null);
        } else {
            setError('Not quite right. Keep trying!');
        }
    };

    const clearCell = () => {
        if (selectedCell) handleNumberInput(0);
    };

    const backToMenu = () => {
        setIsPlaying(false);
        setBoard([]);
    };

    return (
        <Layout>
            <GameWrapper
                title="Sudoku"
                description="Fill the grid so that every row, column, and 3x3 box contains all digits from 1 to 9."
                instructions={[
                    "Select an empty cell to highlight it.",
                    "Choose a number from 1-9 to fill the cell.",
                    "Use 'Check' to verify your solution when full.",
                    "Use 'Clear' or select 0 to remove a number."
                ]}
            >
                <div className="flex flex-col items-center">
                    {!isPlaying ? (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full text-center">
                            <Grid3x3 className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Puzzle</h2>
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
                            <Button onClick={generateNewGame} className="w-full justify-center py-3 text-lg">Generate Puzzle</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start w-full justify-center">
                            <div className="bg-slate-800 p-2 rounded-lg shadow-2xl">
                                <div className="grid grid-cols-9 gap-[1px] bg-slate-600 border-2 border-slate-600">
                                    {board.map((row, r) => (
                                        row.map((cell, c) => {
                                            const isInitial = initialBoard[r] && initialBoard[r][c] !== 0;
                                            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                                            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-500' : '';
                                            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-500' : '';

                                            return (
                                                <div
                                                    key={`${r}-${c}`}
                                                    onClick={() => handleCellClick(r, c)}
                                                    className={`
                                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer transition-colors
                                    ${isInitial ? 'bg-slate-200 text-slate-800' : 'bg-white text-blue-600 hover:bg-blue-50'}
                                    ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : ''}
                                    ${borderRight} ${borderBottom}
                                    ${cell === 0 ? 'text-transparent' : ''}
                                `}
                                                >
                                                    {cell !== 0 ? cell : ''}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 w-full max-w-xs">
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => handleNumberInput(num)}
                                                className="h-10 rounded bg-slate-50 hover:bg-blue-500 hover:text-white text-slate-700 font-bold text-lg transition-colors border border-slate-200"
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button onClick={clearCell} variant="secondary" className="px-2">
                                            <Eraser size={18} /> Clear
                                        </Button>
                                        <Button onClick={() => checkSolution()} variant="primary" className="px-2">
                                            <Check size={18} /> Check
                                        </Button>
                                    </div>
                                </div>

                                {won && (
                                    <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-xl animate-bounce border border-green-200">
                                        🎉 Puzzle Solved!
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
