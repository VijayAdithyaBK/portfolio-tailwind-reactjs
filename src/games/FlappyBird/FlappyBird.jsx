import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const FlappyBird = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Game constants/refs to avoid stale closure in loop
    const gameState = useRef({
        birdY: 200,
        velocity: 0,
        pipes: [],
        frame: 0,
        startedFlying: false // track if user has pressed space to start flying
    });

    // Ref to track if we should keep looping (avoids stale closures)
    const isPlayingRef = useRef(false);
    const requestRef = useRef();
    const scoreRef = useRef(0);

    useEffect(() => {
        const saved = localStorage.getItem('flappyHighScore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        if (isPlaying) {
            // Start loop
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying]);

    const jump = (e) => {
        if (e) e.preventDefault();
        if (!isPlaying) return;

        // On first jump, enable physics
        if (!gameState.current.startedFlying) {
            gameState.current.startedFlying = true;
        }

        gameState.current.velocity = -7; // Jump strength
    };

    const resetGame = () => {
        gameState.current = {
            birdY: 200,
            velocity: 0,
            pipes: [],
            frame: 0,
            startedFlying: false
        };
        setScore(0);
        scoreRef.current = 0;
        setGameOver(false);
        setIsPlaying(true);
    };

    const gameLoop = () => {
        if (!isPlayingRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        // Physics - Only apply if flying has started
        if (state.startedFlying) {
            state.velocity += 0.4; // Gravity
            state.birdY += state.velocity;
            state.frame++;

            // Pipe Spawning
            if (state.frame % 120 === 0) {
                const gapHeight = 150;
                const pipeTopHeight = Math.random() * (canvas.height - gapHeight - 100) + 50;
                state.pipes.push({
                    x: canvas.width,
                    topHeight: pipeTopHeight,
                    bottomY: pipeTopHeight + gapHeight,
                    passed: false
                });
            }

            // Pipe Movement & Collision
            state.pipes.forEach(pipe => {
                pipe.x -= 2;

                // Collision Check
                if (
                    100 + 30 > pipe.x && 100 < pipe.x + 50 &&
                    (state.birdY < pipe.topHeight || state.birdY + 30 > pipe.bottomY)
                ) {
                    endGame();
                }

                // Score
                if (!pipe.passed && pipe.x + 50 < 100) {
                    setScore(s => {
                        const newScore = s + 1;
                        scoreRef.current = newScore;
                        return newScore;
                    });
                    pipe.passed = true;
                }
            });

            // Remove off-screen pipes
            state.pipes = state.pipes.filter(p => p.x > -50);

            // Floor/Ceiling
            if (state.birdY > canvas.height - 30 || state.birdY < 0) {
                endGame();
            }
        } else {
            state.frame++;
            state.birdY = 200 + Math.sin(state.frame * 0.1) * 5;
        }

        draw(ctx, canvas, state);

        if (isPlayingRef.current) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        cancelAnimationFrame(requestRef.current);

        const currentScore = scoreRef.current; // Use ref for latest score

        if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem('flappyHighScore', currentScore);
        }

        if (user && currentScore > 0) {
            addScore('flappy', user.username, currentScore);
        }
    };

    const draw = (ctx, canvas, state) => {
        // Clear
        ctx.fillStyle = '#70c5ce'; // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clouds (Simple decoration)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(100, 350, 40, 0, Math.PI * 2);
        ctx.arc(150, 370, 50, 0, Math.PI * 2);
        ctx.arc(400, 100, 30, 0, Math.PI * 2);
        ctx.fill();

        // Bird
        ctx.fillStyle = '#facc15'; // Yellow
        ctx.beginPath();
        ctx.arc(115, state.birdY + 15, 15, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(122, state.birdY + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        // Wing
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(110, state.birdY + 18, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pipes
        ctx.fillStyle = '#22c55e'; // Green
        state.pipes.forEach(pipe => {
            // Top Pipe
            ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            // Pipe Cap
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, 54, 20);

            // Bottom Pipe
            ctx.fillRect(pipe.x, pipe.bottomY, 50, canvas.height - pipe.bottomY);
            // Pipe Cap
            ctx.fillRect(pipe.x - 2, pipe.bottomY, 54, 20);
        });

        // Ground
        ctx.fillStyle = '#dada98';
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
        ctx.fillStyle = '#65a30d'; // Grass top
        ctx.fillRect(0, canvas.height - 15, canvas.width, 5);

        // "Get Ready" Hint
        if (!state.startedFlying && isPlaying) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Press Space or Click to Fly!", canvas.width / 2, canvas.height / 2 + 50);
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent scrolling
                if (isPlayingRef.current) jump();
                else if (gameOver) resetGame();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            cancelAnimationFrame(requestRef.current);
        }
    }, [gameOver]); // depend on gameOver to allow restart

    return (
        <Layout>
            <GameWrapper
                title="Flappy Bird"
                description="Tap to fly! Avoid the pipes and try to get the highest score."
                instructions={[
                    "Click on the game screen or press Spacebar to flap.",
                    "Gravity pulls you down, flapping pushes you up.",
                    "Navigate through the gaps in the green pipes.",
                    "Don't hit the ground or the pipes!"
                ]}
            >
                <div className="flex flex-col items-center w-full h-full justify-center">

                    <div className="flex justify-between w-full max-w-[400px] mb-4 text-xl font-bold px-4">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-slate-700">Score: {score}</div>
                        <div className="bg-yellow-100 px-4 py-2 rounded-full shadow-sm text-yellow-700">High: {highScore}</div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={500}
                            onClick={jump}
                            style={{ maxHeight: '80vmin', width: 'auto', height: 'auto', aspectRatio: '4/5' }}
                            className="cursor-pointer bg-sky-300 max-w-full block"
                        />

                        {!isPlaying && !gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <Button onClick={resetGame} className="animate-pulse scale-125 shadow-xl">
                                    <Play size={24} fill="white" /> Start Game
                                </Button>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="bg-white p-6 rounded-xl text-center animate-bounce mb-6">
                                    <h2 className="text-3xl font-black text-slate-800 mb-2">GAME OVER</h2>
                                    <p className="text-xl text-blue-500 font-bold">Score: {score}</p>
                                    {user && (
                                        <div className="flex items-center justify-center gap-2 text-yellow-500 mt-2 font-bold text-sm">
                                            <Trophy size={14} /> Score Saved!
                                        </div>
                                    )}
                                </div>
                                <Button onClick={resetGame} variant="primary" className="px-8 py-3 text-lg">
                                    <RotateCcw size={20} /> Try Again
                                </Button>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-slate-500 font-medium">Tap screen or Spacebar to jump</p>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default FlappyBird;
