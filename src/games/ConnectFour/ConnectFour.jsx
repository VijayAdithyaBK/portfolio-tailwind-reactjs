import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const ROWS = 6;
const COLS = 7;

const ConnectFour = () => {
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [timer, setTimer] = useState(0);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Timer Logic
    useEffect(() => {
        let interval;
        if (!winner) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [winner]);

    // Check for Win
    useEffect(() => {
        if (winner === 'P' && user) {
            addScore('connect4', user.username, timer);
        }
    }, [winner]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Check for Win
    const checkWin = (boardState) => {
        // Horizontal, Vertical, Diagonal checks
        const checkLine = (a, b, c, d) => {
            return (a && a === b && a === c && a === d) ? a : null;
        };

        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (checkLine(boardState[r][c], boardState[r][c + 1], boardState[r][c + 2], boardState[r][c + 3])) return boardState[r][c];
            }
        }
        // Vertical
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS; c++) {
                if (checkLine(boardState[r][c], boardState[r + 1][c], boardState[r + 2][c], boardState[r + 3][c])) return boardState[r][c];
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (checkLine(boardState[r][c], boardState[r + 1][c + 1], boardState[r + 2][c + 2], boardState[r + 3][c + 3])) return boardState[r][c];
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (checkLine(boardState[r][c], boardState[r - 1][c + 1], boardState[r - 2][c + 2], boardState[r - 3][c + 3])) return boardState[r][c];
            }
        }
        return null;
    };

    const dropPiece = (colIndex) => {
        if (!isPlayerTurn || winner) return;

        let rowIndex = -1;
        const newBoard = board.map(row => [...row]);

        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][colIndex]) {
                newBoard[r][colIndex] = 'P';
                rowIndex = r;
                break;
            }
        }

        if (rowIndex === -1) return; // Column full

        setBoard(newBoard);

        const win = checkWin(newBoard);
        if (win) {
            setWinner(win);
        } else {
            setIsPlayerTurn(false);
        }
    };

    const makeComputerMove = () => {
        if (winner) return;

        // Simple AI: Random valid move
        const availableCols = [];
        for (let c = 0; c < COLS; c++) {
            if (!board[0][c]) availableCols.push(c);
        }

        if (availableCols.length === 0) return; // Draw?

        const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];

        const newBoard = board.map(row => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][randomCol]) {
                newBoard[r][randomCol] = 'C';
                break;
            }
        }

        setBoard(newBoard);
        const win = checkWin(newBoard);
        if (win) {
            setWinner(win);
        } else {
            setIsPlayerTurn(true);
        }
    };

    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            const timeout = setTimeout(makeComputerMove, 500);
            return () => clearTimeout(timeout);
        }
    }, [isPlayerTurn, winner]);

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setWinner(null);
        setIsPlayerTurn(true);
        setTimer(0);
    };

    // In JSX:
    return (
        <Layout>
            <GameWrapper
                title="Connect Four"
                description="Connect four discs of your color in a row to win!"
                instructions={[
                    "Click on a column to drop your disc.",
                    "Try to connect 4 discs horizontally, vertically, or diagonally.",
                    "Block your opponent from doing the same!",
                    "The game ends when the board is full or someone wins."
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="mb-6 flex flex-col items-center gap-2">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 font-mono text-xl font-bold text-blue-600">
                            {formatTime(timer)}
                        </div>

                        <div className="h-8 text-xl font-bold flex items-center justify-center">
                            {winner ? (
                                <span className={`px-6 py-2 rounded-full ${winner === 'P' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'} animate-bounce`}>
                                    {winner === 'P' ? 'You Win!' : 'Computer Wins!'}
                                </span>
                            ) : (
                                <span className="text-slate-500 font-medium">
                                    {isPlayerTurn ? "Your Turn (Red)" : "Computer thinking..."}
                                </span>
                            )}
                        </div>

                        {winner === 'P' && user && (
                            <span className="flex items-center gap-2 text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                <Trophy size={14} /> Time Saved!
                            </span>
                        )}
                    </div>

                    <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/30 border-4 border-blue-700">
                        <div className="grid grid-cols-7 gap-2 sm:gap-3">
                            {Array(COLS).fill(null).map((_, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-2 sm:gap-3 group cursor-pointer" onClick={() => dropPiece(colIndex)}>
                                    {board.map((row, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className={`
                            w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow-inner border border-black/10
                            ${row[colIndex] === 'P' ? 'bg-red-500' :
                                                    row[colIndex] === 'C' ? 'bg-yellow-400' :
                                                        'bg-blue-800/40'}
                            `}
                                        />
                                    ))}
                                    {/* Hover indicator */}
                                    {!winner && isPlayerTurn && (
                                        <div className="w-full h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button onClick={resetGame} variant="primary" className="px-8 shadow-lg">
                            <RotateCcw size={20} /> Restart Game
                        </Button>
                    </div>
                </div>
            </GameWrapper>
        </Layout >
    );
};

export default ConnectFour;
