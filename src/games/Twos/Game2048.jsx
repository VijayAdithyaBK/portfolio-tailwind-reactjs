import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Hash, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const Game2048 = () => {
    const [board, setBoard] = useState(Array(4).fill(null).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const [timer, setTimer] = useState(0);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Timer Logic
    useEffect(() => {
        let interval;
        if (!gameOver && !won) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameOver, won]);

    // Save score on Win OR Game Over
    useEffect(() => {
        if ((won || gameOver) && user) {
            addScore('2048', user.username, score, { time: timer });
        }
    }, [won, gameOver]);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
        addNewTile(newBoard);
        addNewTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setMoves(0);
        setTimer(0);
        setGameOver(false);
        setWon(false);
    };

    // ... (addNewTile) ...
    const addNewTile = (currentBoard) => {
        const emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) emptyTiles.push({ r, c });
            }
        }
        if (emptyTiles.length === 0) return;

        const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    };


    // Key Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver || won) return;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                move(e.key.replace('Arrow', ''));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [board, gameOver, won]);

    // Check Game Over
    const checkGameOver = (currentBoard) => {
        // 1. Check for empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) return false;
            }
        }
        // 2. Check for possible merges
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false; // Horizontal
                if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false; // Vertical
            }
        }
        return true;
    };

    // Movement Logic
    const move = (direction) => {
        if (gameOver || won) return;

        // Helper to rotate board 90deg clockwise
        const rotateRight = (b) => {
            const res = Array(4).fill(null).map(() => Array(4).fill(0));
            // Transpose and reverse rows
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    res[c][3 - r] = b[r][c];
                }
            }
            return res;
        };

        let newBoard = board.map(row => [...row]);
        let angle = 0;

        // Standardize to "Left" movement by rotating board
        if (direction === 'Up') angle = 270;
        if (direction === 'Right') angle = 180;
        if (direction === 'Down') angle = 90;

        // Apply Rotations
        for (let i = 0; i < (angle / 90); i++) newBoard = rotateRight(newBoard);

        // Process Left Movement (Standard)
        let moved = false;
        let newScore = score;

        for (let r = 0; r < 4; r++) {
            let row = newBoard[r].filter(v => v); // Remove zeros

            // Merge
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    newScore += row[i];
                    if (row[i] === 2048) setWon(true);
                    row.splice(i + 1, 1);
                    moved = true; // Merge counts as move
                }
            }

            // Pad with zeros
            while (row.length < 4) row.push(0);

            // Check if changed
            if (newBoard[r].some((v, i) => v !== row[i])) moved = true;
            newBoard[r] = row;
        }

        // Rotate Back
        let backAngle = (360 - angle) % 360;
        for (let i = 0; i < (backAngle / 90); i++) newBoard = rotateRight(newBoard);

        if (moved) {
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(newScore);
            setMoves(m => m + 1);

            if (checkGameOver(newBoard)) {
                setGameOver(true);
            }
        }
    };

    const getTileColor = (value) => {
        const colors = {
            2: 'bg-slate-100 text-slate-800',
            4: 'bg-slate-200 text-slate-800',
            8: 'bg-orange-200 text-white',
            16: 'bg-orange-300 text-white',
            32: 'bg-orange-400 text-white',
            64: 'bg-orange-500 text-white',
            128: 'bg-orange-600 text-white',
            256: 'bg-yellow-400 text-white',
            512: 'bg-yellow-500 text-white',
            1024: 'bg-yellow-600 text-white',
            2048: 'bg-yellow-700 text-white',
        };
        return colors[value] || 'bg-slate-900 text-white';
    };

    return (
        <Layout>
            <GameWrapper
                title="2048 Puzzle"
                description="Join the numbers and get to the 2048 tile!"
                instructions={[
                    "Use Arrow keys to slide tiles.",
                    "Tiles with the same number merge into one when they touch.",
                    "Add them up to reach 2048!",
                ]}
            >
                <div className="flex flex-col items-center">

                    <div className="flex justify-between w-full max-w-[320px] mb-6">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[80px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
                            <span className="text-xl font-black text-slate-800">{score}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[80px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Time</span>
                            <span className="text-xl font-black text-slate-800">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[80px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Best</span>
                            <span className="text-xl font-black text-slate-800">{score}</span>
                        </div>
                    </div>

                    <div className="bg-slate-300 p-2 sm:p-3 rounded-xl shadow-inner w-full max-w-[80vmin] aspect-square flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 bg-slate-400/50 rounded-lg p-1 w-full h-full">
                            {board.map((row, r) => (
                                row.map((cell, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`
                                    w-full h-full aspect-square flex items-center justify-center font-bold text-xl sm:text-3xl rounded-lg transition-all duration-100
                                    ${cell === 0 ? 'bg-slate-200/50' : getTileColor(cell)}
                                    ${cell > 0 ? 'scale-100' : 'scale-95'}
                                `}
                                    >
                                        {cell > 0 ? cell : ''}
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>

                    {gameOver && (
                        <div className="mt-8 text-2xl font-black text-red-500 animate-bounce">
                            GAME OVER!
                        </div>
                    )}

                    {gameOver && user && (
                        <div className="flex items-center gap-2 text-yellow-600 mt-2 font-bold bg-yellow-100 px-4 py-2 rounded-full">
                            <Trophy size={16} /> Score Submitted!
                        </div>
                    )}

                    {won && (
                        <div className="mt-8 text-2xl font-black text-green-500 animate-bounce">
                            YOU WIN! 2048!
                        </div>
                    )}

                    <Button onClick={initializeGame} className="mt-8 px-8 shadow-lg">
                        <RotateCcw size={20} /> New Game
                    </Button>

                    <p className="mt-6 text-slate-400 text-sm hidden md:block">Use Arrow Keys</p>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Game2048;
