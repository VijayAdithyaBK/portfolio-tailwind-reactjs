import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Crosshair, Target, Waves, RotateCcw } from 'lucide-react';

const GRID_SIZE = 6;
const SHIP_SIZES = [3, 2, 2, 1]; // 4 ships

const Battleship = () => {
    // 0: empty, 1: ship, 2: miss, 3: hit
    const [playerBoard, setPlayerBoard] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    const [computerBoard, setComputerBoard] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    const [computerVisibleBoard, setComputerVisibleBoard] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));

    const [gameState, setGameState] = useState('setup'); // setup, playing, end
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [log, setLog] = useState(["Welcome! Place your fleet."]);

    useEffect(() => {
        if (gameState === 'playing' && !isPlayerTurn) {
            const timer = setTimeout(computerTurn, 1000);
            return () => clearTimeout(timer);
        }
    }, [gameState, isPlayerTurn]);

    const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 4));

    // --- Setup ---
    const placeShipsRandomly = (board) => {
        let newBoard = board.map(r => [...r].fill(0));
        for (let size of SHIP_SIZES) {
            let placed = false;
            while (!placed) {
                const vertical = Math.random() < 0.5;
                const r = Math.floor(Math.random() * (vertical ? GRID_SIZE - size + 1 : GRID_SIZE));
                const c = Math.floor(Math.random() * (vertical ? GRID_SIZE : GRID_SIZE - size + 1));

                // Check collision
                let clear = true;
                for (let i = 0; i < size; i++) {
                    if (vertical) { if (newBoard[r + i][c] !== 0) clear = false; }
                    else { if (newBoard[r][c + i] !== 0) clear = false; }
                }

                if (clear) {
                    for (let i = 0; i < size; i++) {
                        if (vertical) newBoard[r + i][c] = 1;
                        else newBoard[r][c + i] = 1;
                    }
                    placed = true;
                }
            }
        }
        return newBoard;
    };

    const startGame = () => {
        setPlayerBoard(placeShipsRandomly(playerBoard)); // Auto place for player for speed
        setComputerBoard(placeShipsRandomly(computerBoard));
        setGameState('playing');
        setIsPlayerTurn(true);
        addLog("Game Started! Fire at enemy waters.");
    };

    // --- Gameplay ---
    const handlePlayerFire = (r, c) => {
        if (gameState !== 'playing' || !isPlayerTurn || computerVisibleBoard[r][c]) return;

        const isHit = computerBoard[r][c] === 1;
        const newVisible = computerVisibleBoard.map(row => [...row]);
        newVisible[r][c] = isHit ? 'hit' : 'miss';
        setComputerVisibleBoard(newVisible);

        addLog(isHit ? `You HIT at ${String.fromCharCode(65 + r)}${c + 1}!` : `You Missed at ${String.fromCharCode(65 + r)}${c + 1}.`);

        if (checkWin(newVisible, computerBoard)) {
            setWinner('Player');
            setGameState('end');
            addLog("VICTORY! Enemy fleet destroyed!");
        } else {
            setIsPlayerTurn(false);
        }
    };

    const computerTurn = () => {
        let options = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (playerBoard[r][c] === 0 || playerBoard[r][c] === 1) options.push({ r, c });
            }
        }

        if (options.length === 0) return;
        const shot = options[Math.floor(Math.random() * options.length)];

        const newPlayerBoard = playerBoard.map(row => [...row]);
        const isHit = playerBoard[shot.r][shot.c] === 1;

        newPlayerBoard[shot.r][shot.c] = isHit ? 3 : 2; // 3 hit, 2 miss
        setPlayerBoard(newPlayerBoard);

        addLog(isHit ? `Enemy HIT your ship at ${String.fromCharCode(65 + shot.r)}${shot.c + 1}!` : `Enemy missed.`);

        if (checkWinPlayerBoard(newPlayerBoard)) {
            setWinner('Computer');
            setGameState('end');
            addLog("DEFEAT! Your fleet was sunk.");
        } else {
            setIsPlayerTurn(true);
        }
    };

    const checkWin = (visible, actual) => {
        let totalShips = SHIP_SIZES.reduce((a, b) => a + b, 0);
        let hits = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (visible[r][c] === 'hit') hits++;
            }
        }
        return hits === totalShips;
    };

    const checkWinPlayerBoard = (board) => {
        return !board.some(row => row.includes(1));
    };

    const resetGame = () => {
        setPlayerBoard(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
        setComputerBoard(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
        setComputerVisibleBoard(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
        setGameState('setup');
        setWinner(null);
        setLog(["Welcome! Place your fleet."]);
    };

    return (
        <Layout>
            <GameWrapper
                title="Battleship"
                description="Sink the enemy fleet before they destroy yours!"
                instructions={[
                    "In Setup, click 'Start Game' to randomize your fleet positions.",
                    "Click on the 'Enemy Waters' grid to fire a shot.",
                    "Red markers indicate Hits, Blue dots indicate Misses.",
                    "Sink all enemy ships to win!"
                ]}
            >
                <div className="flex flex-col items-center">
                    {gameState === 'setup' ? (
                        <div className="text-center py-12">
                            <Waves size={64} className="text-blue-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Deploy Your Fleet</h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Ships are placed randomly. Prepare for combat!</p>
                            <Button onClick={startGame} className="px-12 py-4 text-lg shadow-lg shadow-blue-500/30">Start Game</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start w-full justify-center">
                            {/* Enemy Board */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-bold mb-3 text-red-500 flex items-center gap-2"><Target size={18} /> Enemy Waters</h3>
                                <div className={`p-4 bg-white rounded-xl shadow-lg border border-slate-100 ${isPlayerTurn && !winner ? 'ring-4 ring-green-400/50' : ''}`}>
                                    <div className="grid grid-cols-6 gap-1">
                                        {computerVisibleBoard.map((row, r) => (
                                            row.map((cell, c) => (
                                                <div
                                                    key={`c-${r}-${c}`}
                                                    onClick={() => handlePlayerFire(r, c)}
                                                    className={`
                                                w-10 h-10 sm:w-12 sm:h-12 border border-slate-200 flex items-center justify-center cursor-pointer transition-all rounded
                                                ${cell === null ? 'bg-blue-50 hover:bg-blue-100' : ''}
                                                ${cell === 'hit' ? 'bg-red-500 shadow-md animate-bounce' : ''}
                                                ${cell === 'miss' ? 'bg-slate-200' : ''}
                                            `}
                                                >
                                                    {cell === 'hit' && <Crosshair className="text-white" size={24} />}
                                                    {cell === 'miss' && <div className="w-3 h-3 bg-slate-400 rounded-full" />}
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status / Logs */}
                            <div className="flex flex-col items-center w-full max-w-xs gap-4 order-last lg:order-none">
                                <div className="w-full bg-slate-900 text-slate-200 p-4 rounded-xl shadow-inner h-40 overflow-y-auto border border-slate-700">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Combat Log</div>
                                    <div className="space-y-2">
                                        {log.map((l, i) => (
                                            <div key={i} className={`text-sm ${i === 0 ? 'text-white font-semibold' : 'text-slate-500'}`}>{l}</div>
                                        ))}
                                    </div>
                                </div>

                                {winner && (
                                    <div className={`text-2xl font-black animate-bounce ${winner === 'Player' ? 'text-green-500' : 'text-red-500'}`}>
                                        {winner === 'Player' ? 'VICTORY!' : 'DEFEAT!'}
                                    </div>
                                )}

                                <Button onClick={resetGame} variant="secondary" className="w-full">
                                    <RotateCcw size={18} /> Restart Mission
                                </Button>
                            </div>

                            {/* Player Board */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-bold mb-3 text-blue-500 flex items-center gap-2"><Waves size={18} /> Your Fleet</h3>
                                <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-100 opacity-90">
                                    <div className="grid grid-cols-6 gap-1">
                                        {playerBoard.map((row, r) => (
                                            row.map((cell, c) => (
                                                <div
                                                    key={`p-${r}-${c}`}
                                                    className={`
                                                w-10 h-10 sm:w-12 sm:h-12 border border-slate-200 flex items-center justify-center rounded
                                                ${cell === 0 ? 'bg-slate-50' : ''}
                                                ${cell === 1 ? 'bg-blue-500' : ''}
                                                ${cell === 2 ? 'bg-slate-200' : ''}
                                                ${cell === 3 ? 'bg-red-600' : ''}
                                            `}
                                                >
                                                    {cell === 3 && <Target className="text-white" size={20} />}
                                                    {cell === 2 && <div className="w-2 h-2 bg-slate-400 rounded-full" />}
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Battleship;
