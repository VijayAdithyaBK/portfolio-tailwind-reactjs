import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw } from 'lucide-react';

const FlappyBird = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);

    // Game constants/refs to avoid stale closure in loop
    const gameState = useRef({
        birdY: 200,
        velocity: 0,
        pipes: [],
        frame: 0
    });

    const requestRef = useRef();

    useEffect(() => {
        const saved = localStorage.getItem('flappyHighScore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const jump = () => {
        if (!isPlaying) return;
        gameState.current.velocity = -8;
    };

    const resetGame = () => {
        gameState.current = {
            birdY: 200,
            velocity: 0,
            pipes: [],
            frame: 0
        };
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameState.current;

        // Physics
        state.velocity += 0.5; // Gravity
        state.birdY += state.velocity;
        state.frame++;

        // Pipe Spawning
        if (state.frame % 100 === 0) {
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
            pipe.x -= 3;

            // Collision Check
            if (
                // Bird within Pipe X range
                100 + 30 > pipe.x && 100 < pipe.x + 50 &&
                // Bird hitting Top Pipe OR Bottom Pipe
                (state.birdY < pipe.topHeight || state.birdY + 30 > pipe.bottomY)
            ) {
                endGame();
            }

            // Score
            if (!pipe.passed && pipe.x + 50 < 100) {
                setScore(s => s + 1);
                pipe.passed = true;
            }
        });

        // Remove off-screen pipes
        state.pipes = state.pipes.filter(p => p.x > -50);

        // Floor/Ceiling Collision
        if (state.birdY > canvas.height - 30 || state.birdY < 0) {
            endGame();
        }

        // Draw
        draw(ctx, canvas, state);

        if (isPlaying) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        cancelAnimationFrame(requestRef.current);

        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappyHighScore', score);
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
    };

    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

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
                <div className="flex flex-col items-center">

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
