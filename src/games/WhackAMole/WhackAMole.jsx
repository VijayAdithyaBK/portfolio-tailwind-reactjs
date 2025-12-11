import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw, Target, Timer } from 'lucide-react';

const MOLE_COUNT = 9;
const GAME_DURATION = 30;

const WhackAMole = () => {
    const [moles, setMoles] = useState(Array(MOLE_COUNT).fill(false));
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const timerRef = useRef(null);
    const moleTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(moleTimerRef.current);
        };
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setIsPlaying(true);
        setGameOver(false);
        setMoles(Array(MOLE_COUNT).fill(false));

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        popMole();
    };

    const endGame = () => {
        clearInterval(timerRef.current);
        clearTimeout(moleTimerRef.current);
        setIsPlaying(false);
        setGameOver(true);
        setMoles(Array(MOLE_COUNT).fill(false));
    };

    const popMole = () => {
        if (!isPlaying && timeLeft <= 0) return;

        const randomTime = Math.random() * 800 + 400;
        const randomIdx = Math.floor(Math.random() * MOLE_COUNT);

        setMoles(prev => {
            const newMoles = [...prev];
            newMoles[randomIdx] = true;
            return newMoles;
        });

        moleTimerRef.current = setTimeout(() => {
            setMoles(prev => {
                const newMoles = [...prev];
                newMoles[randomIdx] = false;
                return newMoles;
            });
            if (timeLeft > 0) popMole();
        }, randomTime);
    };

    const whack = (index) => {
        if (!moles[index] || !isPlaying) return;

        setScore(s => s + 10);
        setMoles(prev => {
            const newMoles = [...prev];
            newMoles[index] = false;
            return newMoles;
        });
    };


    return (
        <Layout>
            <GameWrapper
                title="Whack-a-Mole"
                description="Fast-paced arcade action. Hit the moles before they hide!"
                instructions={[
                    "Click on the moles as they pop up from the grass.",
                    "Each mole is worth 10 points.",
                    "You have 30 seconds to get the highest score possible!",
                    "Be quick!"
                ]}
            >
                <div className="flex flex-col items-center">

                    <div className="flex gap-8 mb-8 text-2xl font-bold bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 text-amber-500">
                            <Target /> <span className="text-slate-700">{score}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500">
                            <Timer /> <span className="text-slate-700">{timeLeft}s</span>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/20 border-b-8 border-slate-900">
                        <div className="grid grid-cols-3 gap-4">
                            {moles.map((isUp, i) => (
                                <div
                                    key={i}
                                    onMouseDown={() => whack(i)}
                                    className={`
                                w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 relative overflow-hidden cursor-pointer select-none transition-all duration-100
                                ${isUp
                                            ? 'bg-amber-400 border-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.6)] z-10 scale-105'
                                            : 'bg-slate-900 border-slate-950 shadow-inner scale-100'}
                            `}
                                >
                                    {isUp && (
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                                            🐹
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {gameOver && (
                        <div className="mt-8 text-center animate-bounce">
                            <h3 className="text-3xl font-black text-slate-800 mb-2">TIME'S UP!</h3>
                            <p className="text-xl text-amber-500 font-bold">Final Score: {score}</p>
                        </div>
                    )}

                    <div className="mt-8">
                        {!isPlaying ? (
                            <Button onClick={startGame} className="animate-pulse px-12 py-3 text-lg shadow-xl shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white">
                                <Play size={24} /> Play Now
                            </Button>
                        ) : (
                            <Button onClick={endGame} variant="danger" className="px-8 shadow-lg shadow-red-500/20">
                                Stop Game
                            </Button>
                        )}
                    </div>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default WhackAMole;
