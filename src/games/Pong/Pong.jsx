import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

const Pong = () => {
    const canvasRef = useRef(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [paused, setPaused] = useState(false);
    const [score, setScore] = useState({ player: 0, computer: 0 });

    // Game State Refs (for animation loop performance)
    const state = useRef({
        playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 4 },
        keys: { ArrowUp: false, ArrowDown: false }
    });

    const animationFrameId = useRef(null);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    useEffect(() => {
        if (gameStarted && !paused) {
            render();
        }
    }, [gameStarted, paused]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            state.current.keys[e.key] = true;
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            state.current.keys[e.key] = false;
        }
    };

    const resetBall = () => {
        state.current.ball = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: (Math.random() > 0.5 ? 4 : -4),
            dy: (Math.random() > 0.5 ? 4 : -4)
        };
    };

    const update = () => {
        const s = state.current;

        // Player Movement
        if (s.keys.ArrowUp) s.playerY = Math.max(0, s.playerY - 6);
        if (s.keys.ArrowDown) s.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, s.playerY + 6);

        // Computer AI (Simple tracking)
        const targetY = s.ball.y - PADDLE_HEIGHT / 2;
        if (targetY < s.computerY) s.computerY -= 4;
        if (targetY > s.computerY) s.computerY += 4;
        s.computerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, s.computerY));

        // Ball Movement
        s.ball.x += s.ball.dx;
        s.ball.y += s.ball.dy;

        // Wall Collision (Top/Bottom)
        if (s.ball.y <= 0 || s.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
            s.ball.dy *= -1;
        }

        // Paddle Collision
        // Player
        if (s.ball.x <= PADDLE_WIDTH + 10 &&
            s.ball.y + BALL_SIZE >= s.playerY &&
            s.ball.y <= s.playerY + PADDLE_HEIGHT) {
            s.ball.dx = Math.abs(s.ball.dx) + 0.5; // Speed up
        }

        // Computer
        if (s.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - 10 &&
            s.ball.y + BALL_SIZE >= s.computerY &&
            s.ball.y <= s.computerY + PADDLE_HEIGHT) {
            s.ball.dx = -(Math.abs(s.ball.dx) + 0.5);
        }

        // Score
        if (s.ball.x < 0) {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            resetBall();
        }
        if (s.ball.x > CANVAS_WIDTH) {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            resetBall();
        }
    };

    const draw = (ctx) => {
        const s = state.current;

        // Clear
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Net
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Paddles
        ctx.fillStyle = '#38bdf8'; // Player (Blue)
        ctx.fillRect(10, s.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.fillStyle = '#f472b6'; // Computer (Pink)
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, s.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Ball
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.ball.x, s.ball.y, BALL_SIZE, BALL_SIZE);
    };

    const render = () => {
        if (!gameStarted || paused) return;

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            update();
            draw(ctx);
        }
        animationFrameId.current = requestAnimationFrame(render);
    };

    return (
        <Layout>
            <GameWrapper
                title="Pong"
                description="The original arcade tennis game! Defend your goal and score against the AI."
                instructions={[
                    "Use UP Arrow key to move paddle up.",
                    "Use DOWN Arrow key to move paddle down.",
                    "Hit the ball past the Computer paddle to score.",
                    "First to 10 points wins! (Endless mode currently)"
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-[600px] mb-4 text-2xl font-bold px-4">
                        <span className="text-sky-500 drop-shadow-sm">Player: {score.player}</span>
                        <span className="text-pink-500 drop-shadow-sm">CPU: {score.computer}</span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            className="bg-slate-900 max-w-full block"
                        />

                        {!gameStarted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Button onClick={() => { setGameStarted(true); render(); }} className="animate-pulse scale-125 shadow-xl">
                                    Start Game
                                </Button>
                            </div>
                        )}

                        {paused && gameStarted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <h2 className="text-5xl font-black text-white tracking-widest drop-shadow-lg">PAUSED</h2>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Button onClick={() => setPaused(!paused)} variant="secondary" disabled={!gameStarted} className="px-8">
                            {paused ? <Play size={20} /> : <Pause size={20} />} {paused ? "Resume" : "Pause"}
                        </Button>
                    </div>

                    <p className="mt-6 text-slate-400 text-sm hidden md:flex items-center gap-2">
                        <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold text-xs">↑</span>
                        <span className="bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold text-xs">↓</span>
                        to move
                    </p>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Pong;
