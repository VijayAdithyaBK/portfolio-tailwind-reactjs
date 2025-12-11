import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { X, Circle, RotateCcw, Monitor, Users } from 'lucide-react';

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState([]);
    const [vsComputer, setVsComputer] = useState(true);
    const [isComputerThinking, setIsComputerThinking] = useState(false);

    useEffect(() => {
        if (vsComputer && !isXNext && !winner && !board.every(Boolean)) {
            setIsComputerThinking(true);
            const timer = setTimeout(() => {
                makeComputerMove();
                setIsComputerThinking(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isXNext, vsComputer, winner, board]);

    const checkWinner = (currentBoard) => {
        for (let combo of WINNING_COMBINATIONS) {
            const [a, b, c] = combo;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { winner: currentBoard[a], line: combo };
            }
        }
        return null;
    };

    const makeComputerMove = () => {
        const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyIndices.length === 0) return;

        let moveIndex = -1;

        // 1. Try to Win
        for (let i of emptyIndices) {
            let tempBoard = [...board];
            tempBoard[i] = 'O';
            if (checkWinner(tempBoard)?.winner === 'O') {
                moveIndex = i;
                break;
            }
        }

        // 2. Block Player
        if (moveIndex === -1) {
            for (let i of emptyIndices) {
                let tempBoard = [...board];
                tempBoard[i] = 'X';
                if (checkWinner(tempBoard)?.winner === 'X') {
                    moveIndex = i;
                    break;
                }
            }
        }

        // 3. Take Center
        if (moveIndex === -1 && board[4] === null) moveIndex = 4;

        // 4. Random
        if (moveIndex === -1) {
            moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        handleMove(moveIndex, 'O');
    };

    const handleMove = (index, player) => {
        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);
        setIsXNext(!isXNext);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
        } else if (!newBoard.includes(null)) {
            setWinner('Draw');
        }
    };

    const handleClick = (index) => {
        if (board[index] || winner || (vsComputer && !isXNext)) return;
        handleMove(index, isXNext ? 'X' : 'O');
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setWinningLine([]);
        setIsComputerThinking(false);
    };

    const toggleMode = () => {
        setVsComputer(!vsComputer);
        resetGame();
    };

    return (
        <Layout>
            <GameWrapper
                title="Tic Tac Toe"
                description="The classic game of Xs and Os. Challenge your friend or the computer!"
                instructions={[
                    "Click on an empty square to place your symbol (X).",
                    "Get 3 of your symbols in a row, column, or diagonal to win.",
                    "Use the toggle button to switch between Computer or Friend opponents."
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="mb-8">
                        <button
                            onClick={toggleMode}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            {vsComputer ? <Monitor size={20} className="text-purple-500" /> : <Users size={20} className="text-blue-500" />}
                            <span className="font-bold text-slate-700">
                                {vsComputer ? 'Playing vs Computer' : 'Playing vs Friend'}
                            </span>
                        </button>
                    </div>

                    <div className="mb-6 h-12 flex items-center justify-center">
                        {winner ? (
                            winner === 'Draw' ? (
                                <span className="text-2xl font-bold text-slate-500">It's a Draw!</span>
                            ) : (
                                <span className="text-2xl font-bold text-green-500 animate-bounce flex items-center gap-2">
                                    Winner: {winner === 'X' ? <X className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                                </span>
                            )
                        ) : (
                            <span className="text-xl font-medium text-slate-600 flex items-center gap-2">
                                Player Turn: {isXNext ? <X className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6 text-pink-500" />}
                                {isComputerThinking && <span className="text-sm text-slate-400 animate-pulse">(Thinking...)</span>}
                            </span>
                        )}
                    </div>

                    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            {board.map((cell, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleClick(index)}
                                    disabled={!!winner || !!cell || (vsComputer && !isXNext)}
                                    className={`
                        w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl flex items-center justify-center
                        transition-all duration-300 transform 
                        ${cell ? 'bg-slate-50' : 'bg-slate-100 hover:bg-slate-200'}
                        ${winningLine.includes(index) ? 'bg-green-100 ring-4 ring-green-400' : ''}
                        `}
                                >
                                    {cell === 'X' && <X className="w-12 h-12 text-blue-500 drop-shadow-sm" />}
                                    {cell === 'O' && <Circle className="w-10 h-10 text-pink-500 drop-shadow-sm" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button onClick={resetGame} variant="primary" className="px-8 shadow-lg shadow-blue-500/30">
                            <RotateCcw size={20} /> Restart Game
                        </Button>
                    </div>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default TicTacToe;
