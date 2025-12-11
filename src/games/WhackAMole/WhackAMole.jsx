import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw, Target, Timer, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const MOLE_COUNT = 9;
const GAME_DURATION = 30;

const WhackAMole = () => {
    const [moles, setMoles] = useState(Array(MOLE_COUNT).fill(false));
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Refs for mutable state accessible in timers
    const timerRef = useRef(null);
    const moleTimerRef = useRef(null);
    const isPlayingRef = useRef(false);
    const timeLeftRef = useRef(GAME_DURATION);

    const scoreRef = useRef(0);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(moleTimerRef.current);
            setMoles(Array(MOLE_COUNT).fill(false));
        };
    }, []);

    const startGame = () => {
        setScore(0);
        scoreRef.current = 0;
        setTimeLeft(GAME_DURATION);
        timeLeftRef.current = GAME_DURATION;
        setIsPlaying(true);
        isPlayingRef.current = true;
        setGameOver(false);
        setMoles(Array(MOLE_COUNT).fill(false));

        // Game Timer
        timerRef.current = setInterval(() => {
            if (timeLeftRef.current <= 1) {
                endGame();
            } else {
                timeLeftRef.current -= 1;
                setTimeLeft(timeLeftRef.current);
            }
        }, 1000);

        popMole();
    };

    const endGame = () => {
        clearInterval(timerRef.current);
        clearTimeout(moleTimerRef.current);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setGameOver(true);
        setMoles(Array(MOLE_COUNT).fill(false));

        if (user && scoreRef.current > 0) {
            addScore('whack', user.username, scoreRef.current);
        }
    };

    const popMole = () => {
        // Check Ref instead of State to avoid stale closure
        if (!isPlayingRef.current || timeLeftRef.current <= 0) return;

        const randomTime = Math.random() * 800 + 400;
        const randomIdx = Math.floor(Math.random() * MOLE_COUNT);

        setMoles(prev => {
            const newMoles = [...prev];
            newMoles[randomIdx] = true;
            return newMoles;
        });

        moleTimerRef.current = setTimeout(() => {
            if (!isPlayingRef.current) return;

            setMoles(prev => {
                const newMoles = [...prev];
                newMoles[randomIdx] = false;
                return newMoles;
            });

            if (timeLeftRef.current > 0) popMole();
        }, randomTime);
    };

    const whack = (index) => {
        if (!moles[index] || !isPlaying) return;

        setScore(s => {
            const newScore = s + 10;
            scoreRef.current = newScore;
            return newScore;
        });
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

                    <div className="p-6 bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/20 border-b-8 border-slate-900 w-full max-w-[80vmin]">
                        <div className="grid grid-cols-3 gap-4">
                            {moles.map((isUp, i) => (
                                <div
                                    key={i}
                                    onMouseDown={() => whack(i)}
                                    className={`
                                w-full aspect-square rounded-full border-4 relative overflow-hidden cursor-pointer select-none transition-all duration-100
                                ${isUp
                                            ? 'bg-amber-400 border-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.6)] z-10 scale-105'
                                            : 'bg-slate-900 border-slate-950 shadow-inner scale-100'}
                            `}
                                >
                                    {isUp && (
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce">
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
                            {user && (
                                <div className="flex items-center justify-center gap-2 text-amber-600 mt-2 font-bold text-sm">
                                    <Trophy size={14} /> Score Saved!
                                </div>
                            )}
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
