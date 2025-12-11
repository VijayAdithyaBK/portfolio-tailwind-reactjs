import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const ConnectFour = () => {
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            setIsThinking(true);
            const timer = setTimeout(() => {
                makeComputerMove();
                setIsThinking(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, winner]);

    const checkWinner = (currentBoard) => {
        // Check horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (currentBoard[r][c] &&
                    currentBoard[r][c] === currentBoard[r][c + 1] &&
                    currentBoard[r][c] === currentBoard[r][c + 2] &&
                    currentBoard[r][c] === currentBoard[r][c + 3]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Check vertical
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS; c++) {
                if (currentBoard[r][c] &&
                    currentBoard[r][c] === currentBoard[r + 1][c] &&
                    currentBoard[r][c] === currentBoard[r + 2][c] &&
                    currentBoard[r][c] === currentBoard[r + 3][c]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Check diagonal down-right
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (currentBoard[r][c] &&
                    currentBoard[r][c] === currentBoard[r + 1][c + 1] &&
                    currentBoard[r][c] === currentBoard[r + 2][c + 2] &&
                    currentBoard[r][c] === currentBoard[r + 3][c + 3]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Check diagonal up-right
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (currentBoard[r][c] &&
                    currentBoard[r][c] === currentBoard[r - 1][c + 1] &&
                    currentBoard[r][c] === currentBoard[r - 2][c + 2] &&
                    currentBoard[r][c] === currentBoard[r - 3][c + 3]) {
                    return currentBoard[r][c];
                }
            }
        }
        return null;
    };

    const getLowestEmptyRow = (currentBoard, col) => {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!currentBoard[r][col]) return r;
        }
        return -1;
    };

    const dropPiece = (col) => {
        if (winner || (isThinking && !isPlayerTurn)) return;

        const row = getLowestEmptyRow(board, col);
        if (row === -1) return; // Column full

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = isPlayerTurn ? 'P' : 'C';
        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
            setWinner(win);
        } else {
            setIsPlayerTurn(!isPlayerTurn);
        }
    };

    const makeComputerMove = () => {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (getLowestEmptyRow(board, c) !== -1) validCols.push(c);
        }

        if (validCols.length === 0) return; // Draw?

        // 1. Win if possible, 2. Block win, 3. Random
        let moveCol = -1;

        // Check Win
        for (let c of validCols) {
            const tempBoard = board.map(r => [...r]);
            const r = getLowestEmptyRow(tempBoard, c);
            tempBoard[r][c] = 'C';
            if (checkWinner(tempBoard) === 'C') {
                moveCol = c;
                break;
            }
        }

        // Check Block
        if (moveCol === -1) {
            for (let c of validCols) {
                const tempBoard = board.map(r => [...r]);
                const r = getLowestEmptyRow(tempBoard, c);
                tempBoard[r][c] = 'P';
                if (checkWinner(tempBoard) === 'P') {
                    moveCol = c;
                    break;
                }
            }
        }

        // Random
        if (moveCol === -1) {
            moveCol = validCols[Math.floor(Math.random() * validCols.length)];
        }

        const row = getLowestEmptyRow(board, moveCol);
        const newBoard = board.map(r => [...r]);
        newBoard[row][moveCol] = 'C';
        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) setWinner(win);
        else setIsPlayerTurn(true);
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setWinner(null);
        setIsPlayerTurn(true);
        setIsThinking(false);
    };

    return (
        <Layout>
            <GameWrapper
                title="Connect Four"
                description="A game of strategy. Be the first to connect 4 discs of your color in a row!"
                instructions={[
                    "Click on a column to drop your red disc.",
                    "Try to connect 4 discs vertically, horizontally, or diagonally.",
                    "Block the yellow computer discs from doing the same!"
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="mb-6 h-8 text-xl font-bold flex items-center justify-center">
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
        </Layout>
    );
};

export default ConnectFour;
