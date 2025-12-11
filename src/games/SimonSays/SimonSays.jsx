import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const COLORS = [
    { id: 0, color: 'green', bg: 'bg-green-500', active: 'bg-green-400 shadow-[0_0_30px_#4ade80]', sound: 261.6 }, // C4
    { id: 1, color: 'red', bg: 'bg-red-500', active: 'bg-red-400 shadow-[0_0_30px_#f87171]', sound: 329.6 },   // E4
    { id: 2, color: 'yellow', bg: 'bg-yellow-400', active: 'bg-yellow-200 shadow-[0_0_30px_#fef08a]', sound: 392.0 }, // G4
    { id: 3, color: 'blue', bg: 'bg-blue-500', active: 'bg-blue-400 shadow-[0_0_30px_#60a5fa]', sound: 523.2 }  // C5
];

const SimonSays = () => {
    const [sequence, setSequence] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [playingSequence, setPlayingSequence] = useState(false);
    const [userStep, setUserStep] = useState(0);
    const [activeColor, setActiveColor] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    const audioContext = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('simonHighScore');
        if (saved) setHighScore(parseInt(saved));
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }, []);

    const playSound = (freq) => {
        if (!audioContext.current) return;
        const osc = audioContext.current.createOscillator();
        const gain = audioContext.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
        gain.gain.setValueAtTime(0.1, audioContext.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.current.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioContext.current.destination);
        osc.start();
        osc.stop(audioContext.current.currentTime + 0.5);
    };

    const flashColor = (id) => {
        setActiveColor(id);
        playSound(COLORS[id].sound);
        setTimeout(() => setActiveColor(null), 300);
    };

    const playSequence = async (seq) => {
        setPlayingSequence(true);
        // Initial delay
        await new Promise(r => setTimeout(r, 600));

        for (let i = 0; i < seq.length; i++) {
            flashColor(seq[i]);
            await new Promise(r => setTimeout(r, 600)); // Gap between flashes
        }
        setPlayingSequence(false);
    };

    const startGame = () => {
        setSequence([]);
        setScore(0);
        setGameOver(false);
        setPlaying(true);
        addToSequence([]);
    };

    const addToSequence = (currentSeq) => {
        const nextColor = Math.floor(Math.random() * 4);
        const newSeq = [...currentSeq, nextColor];
        setSequence(newSeq);
        setUserStep(0);
        playSequence(newSeq);
    };

    const handleColorClick = (id) => {
        if (gameOver || playingSequence || !playing) return;

        flashColor(id);

        if (id !== sequence[userStep]) {
            // Wrong click
            setGameOver(true);
            setPlaying(false);
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('simonHighScore', score);
            }
            if (user && score > 0) {
                addScore('simon', user.username, score);
            }
            // Failure sound
            const osc = audioContext.current.createOscillator();
            const gain = audioContext.current.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioContext.current.currentTime);
            osc.frequency.linearRampToValueAtTime(100, audioContext.current.currentTime + 0.5);
            gain.gain.setValueAtTime(0.2, audioContext.current.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioContext.current.destination);
            osc.start();
            osc.stop(audioContext.current.currentTime + 0.5);
            return;
        }

        // Right click
        if (userStep === sequence.length - 1) {
            setScore(s => s + 1);
            setUserStep(0);
            setTimeout(() => addToSequence(sequence), 1000);
        } else {
            setUserStep(s => s + 1);
        }
    };

    const resetGame = () => {
        setGameOver(false);
        startGame();
    };

    return (
        <Layout>
            <GameWrapper
                title="Simon Says"
                description="Follow the pattern of lights and sounds. How long can you last?"
                instructions={[
                    "Watch the sequence of flashing lights.",
                    "Repeat the sequence by clicking the colored buttons.",
                    "The sequence gets one step longer each round.",
                    "One wrong move and it's Game Over!"
                ]}
            >
                <div className="flex flex-col items-center">

                    <div className="flex justify-between w-full max-w-[300px] mb-8">
                        <div className="bg-white px-6 py-2 rounded-full shadow-sm text-slate-700 font-bold">Score: {score}</div>
                        <div className="bg-blue-50 px-6 py-2 rounded-full shadow-sm text-blue-700 font-bold">Best: {highScore}</div>
                    </div>

                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-slate-800 rounded-full p-2 shadow-2xl">
                        <div className="grid grid-cols-2 gap-2 h-full w-full rounded-full overflow-hidden">
                            {COLORS.map((btn) => (
                                <div
                                    key={btn.id}
                                    onClick={() => handleColorClick(btn.id)}
                                    className={`
                                ${btn.bg} cursor-pointer transition-all duration-100
                                ${activeColor === btn.id ? btn.active + ' scale-105 z-10' : 'opacity-80 hover:opacity-100'}
                                active:scale-95
                            `}
                                />
                            ))}
                        </div>

                        {/* Center Control */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-slate-900 w-1/3 h-1/3 rounded-full flex items-center justify-center border-4 border-slate-700 pointer-events-auto shadow-xl z-20">
                                {!playing && !gameOver && (
                                    <button onClick={startGame} className="text-white hover:text-green-400 transition-colors animate-pulse">
                                        <Play size={40} fill="currentColor" />
                                    </button>
                                )}
                                {gameOver && (
                                    <button onClick={resetGame} className="text-red-500 hover:text-red-400 transition-colors">
                                        <RotateCcw size={40} />
                                    </button>
                                )}
                                {playing && (
                                    <div className="text-2xl font-black text-white">
                                        {score}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {gameOver && (
                        <div className="mt-8 text-center animate-bounce">
                            <h3 className="text-3xl font-black text-red-500 mb-2">WRONG MOVE!</h3>
                            {user && score > 0 && (
                                <div className="flex items-center justify-center gap-2 text-white mb-2 font-bold text-sm bg-red-500/20 py-1 rounded-full">
                                    <Trophy size={14} /> Score Saved!
                                </div>
                            )}
                            <Button onClick={resetGame} className="mt-4 px-8 shadow-lg shadow-red-500/20">Try Again</Button>
                        </div>
                    )}

                    {playingSequence && (
                        <div className="mt-8 text-slate-400 font-bold animate-pulse">Watch carefully...</div>
                    )}

                    {!playing && !gameOver && (
                        <p className="mt-8 text-slate-400 font-medium">Press Play to Start</p>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default SimonSays;
