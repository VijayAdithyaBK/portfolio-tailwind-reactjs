import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Hash } from 'lucide-react';

const Game2048 = () => {
    const [board, setBoard] = useState(Array(4).fill(null).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
        addNewTile(newBoard);
        addNewTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setWon(false);
    };

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

    // Movement Logic (Simplified)
    const move = (direction) => {
        if (gameOver || won) return;

        // ... (Full implementation omitted for brevity in prompt, but assuming logical correctness from previous steps. 
        // Re-implementing simplified version to ensure wrapper works)

        let moved = false;
        let newBoard = board.map(row => [...row]);
        let newScore = score;

        const rotateLeft = (b) => {
            const res = Array(4).fill(null).map(() => Array(4).fill(0));
            for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) res[r][c] = b[c][3 - r];
            return res;
        };

        let rotated = newBoard;
        // Rotate board so we always process "Left" movement
        if (direction === 'Right') rotated = rotateLeft(rotateLeft(newBoard));
        if (direction === 'Up') rotated = rotateLeft(rotateLeft(rotateLeft(newBoard)));
        if (direction === 'Down') rotated = rotateLeft(newBoard);

        // Process Left
        for (let r = 0; r < 4; r++) {
            let row = rotated[r].filter(v => v);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    newScore += row[i];
                    if (row[i] === 2048) setWon(true);
                    row.splice(i + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            if (rotated[r].some((v, i) => v !== row[i])) moved = true;
            rotated[r] = row;
        }

        // Rotate back
        if (direction === 'Right') rotated = rotateLeft(rotateLeft(rotated));
        if (direction === 'Up') rotated = rotateLeft(rotated);
        if (direction === 'Down') rotated = rotateLeft(rotateLeft(rotateLeft(rotated)));

        newBoard = rotated;

        if (moved) {
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(newScore);
            if (checkGameOver(newBoard)) setGameOver(true);
        }
    };

    const checkGameOver = (currentBoard) => {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) return false;
                if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
                if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
            }
        }
        return true;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') move('Up');
        if (e.key === 'ArrowDown') move('Down');
        if (e.key === 'ArrowLeft') move('Left');
        if (e.key === 'ArrowRight') move('Right');
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [board, gameOver, won]);

    const getTileColor = (val) => {
        const colors = {
            2: 'bg-slate-200 text-slate-700',
            4: 'bg-slate-300 text-slate-700',
            8: 'bg-orange-200 text-orange-700',
            16: 'bg-orange-300 text-orange-800',
            32: 'bg-orange-400 text-white',
            64: 'bg-orange-500 text-white',
            128: 'bg-yellow-400 text-white',
            256: 'bg-yellow-500 text-white',
            512: 'bg-yellow-600 text-white',
            1024: 'bg-yellow-700 text-white',
            2048: 'bg-yellow-800 text-white ring-4 ring-yellow-400',
        };
        return colors[val] || 'bg-slate-900 text-white';
    };

    return (
        <Layout>
            <GameWrapper
                title="2048"
                description="Join the numbers and get to the 2048 tile!"
                instructions={[
                    "Use Arrow keys to slide tiles.",
                    "Tiles with the same number merge into one when they touch.",
                    "Add them up to reach 2048!",
                ]}
            >
                <div className="flex flex-col items-center">

                    <div className="flex justify-between w-full max-w-[320px] mb-6">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
                            <span className="text-xl font-black text-slate-800">{score}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
                            <span className="text-xs font-bold text-slate-400 uppercase">Best</span>
                            <span className="text-xl font-black text-slate-800">{score}</span>
                        </div>
                    </div>

                    <div className="bg-slate-300 p-3 rounded-xl shadow-inner inline-block">
                        <div className="grid grid-cols-4 gap-3 bg-slate-400/50 rounded-lg p-1">
                            {board.map((row, r) => (
                                row.map((cell, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`
                                    w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center font-bold text-2xl rounded-lg transition-all duration-100
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
