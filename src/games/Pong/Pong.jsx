import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { Play, Pause, Trophy } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const WIN_SCORE = 10;

const Pong = () => {
    const canvasRef = useRef(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [paused, setPaused] = useState(false);
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [waitingForServe, setWaitingForServe] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    const scoreRef = useRef({ player: 0, computer: 0 }); // Refs for sync access

    // Game State Refs
    const state = useRef({
        playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 0, dy: 0 },
        keys: { ArrowUp: false, ArrowDown: false }
    });

    const gameStartedRef = useRef(false);
    const pausedRef = useRef(false);
    const waitingForServeRef = useRef(true);
    const animationFrameId = useRef(null);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (gameStarted && !paused && !gameOver && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleGameOver();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStarted, paused, gameOver, timeLeft]);

    // Sync state to refs for use in loop
    useEffect(() => {
        gameStartedRef.current = gameStarted;
        pausedRef.current = paused;
        waitingForServeRef.current = waitingForServe;
    }, [gameStarted, paused, waitingForServe]);

    useEffect(() => {
        const handleResize = () => {
            // Optional: Handle resize if needed, but we have fixed canvas size
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (gameStarted) {
            animationFrameId.current = requestAnimationFrame(render);
        } else {
            cancelAnimationFrame(animationFrameId.current);
        }
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [gameStarted, paused]);

    const handleGameOver = () => {
        setGameOver(true);
        setGameStarted(false);
        setPaused(false);
        const finalScore = scoreRef.current;
        const winName = finalScore.player > finalScore.computer ? 'Player' : finalScore.player < finalScore.computer ? 'Computer' : 'Draw';
        setWinner(winName);

        if (user) {
            addScore('pong', user.username, finalScore.player * 100);
        }
    };

    const restartGame = () => {
        setScore({ player: 0, computer: 0 });
        scoreRef.current = { player: 0, computer: 0 };
        setGameOver(false);
        setWinner(null);
        setGameStarted(true);
        setTimeLeft(120);
        resetBall();
    };

    const resetBall = () => {
        state.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 0, dy: 0 };
        setWaitingForServe(true);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver) return;
            if (e.code === 'ArrowUp') state.current.keys.ArrowUp = true;
            if (e.code === 'ArrowDown') state.current.keys.ArrowDown = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (waitingForServeRef.current && gameStarted && !paused) {
                    setWaitingForServe(false);
                    // Launch ball
                    const dirX = Math.random() > 0.5 ? 1 : -1;
                    const dirY = (Math.random() - 0.5) * 2;
                    state.current.ball.dx = dirX * 5;
                    state.current.ball.dy = dirY * 5;
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'ArrowUp') state.current.keys.ArrowUp = false;
            if (e.code === 'ArrowDown') state.current.keys.ArrowDown = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted, paused, gameOver]);

    const update = () => {
        const s = state.current;
        const waiting = waitingForServeRef.current;

        if (gameOver) return;

        // Player Movement
        if (s.keys.ArrowUp) s.playerY = Math.max(0, s.playerY - 6);
        if (s.keys.ArrowDown) s.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, s.playerY + 6);

        // Computer AI
        if (!waiting) {
            const targetY = s.ball.y - PADDLE_HEIGHT / 2;
            const aiSpeed = 3.5;
            if (targetY < s.computerY) s.computerY -= aiSpeed;
            if (targetY > s.computerY) s.computerY += aiSpeed;
            s.computerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, s.computerY));
        }

        // Ball Movement
        if (!waiting) {
            s.ball.x += s.ball.dx;
            s.ball.y += s.ball.dy;

            // Wall Collision
            if (s.ball.y <= 0 || s.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
                s.ball.dy *= -1;
            }

            // Paddle Collision
            if (s.ball.x <= PADDLE_WIDTH + 10 &&
                s.ball.y + BALL_SIZE >= s.playerY &&
                s.ball.y <= s.playerY + PADDLE_HEIGHT) {
                s.ball.dx = Math.abs(s.ball.dx) + 0.5;
            }

            if (s.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - 10 &&
                s.ball.y + BALL_SIZE >= s.computerY &&
                s.ball.y <= s.computerY + PADDLE_HEIGHT) {
                s.ball.dx = -(Math.abs(s.ball.dx) + 0.5);
            }

            // Score Logic
            if (s.ball.x < 0) {
                setScore(prev => {
                    const newS = { ...prev, computer: prev.computer + 1 };
                    scoreRef.current = newS;
                    return newS;
                });
                resetBall();
            }
            if (s.ball.x > CANVAS_WIDTH) {
                setScore(prev => {
                    const newS = { ...prev, player: prev.player + 1 };
                    scoreRef.current = newS;
                    return newS;
                });
                resetBall();
            }
        }
    };

    // ... (Draw and Render functions unchanged)
    const draw = (ctx) => {
        const s = state.current;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(10, s.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, s.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.ball.x, s.ball.y, BALL_SIZE, BALL_SIZE);
        if (waitingForServeRef.current && gameStarted && !paused) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Press SPACE to Serve", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        }
    };

    const render = () => {
        if (!gameStartedRef.current || pausedRef.current) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            update();
            draw(ctx);
        }
        animationFrameId.current = requestAnimationFrame(render);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Layout>
            <GameWrapper
                title="Ping Pong"
                description="The original arcade tennis game! Score as many points as possible in 2 minutes."
                instructions={[
                    "Use UP Arrow key to move paddle up.",
                    "Use DOWN Arrow key to move paddle down.",
                    "Hit the ball past the Computer paddle to score.",
                    "Press Spacebar to serve the ball.",
                    "Get the highest score before time runs out!"
                ]}
            >
                <div className="flex flex-col items-center w-full h-full justify-center">
                    <div className="mb-4 bg-slate-800 text-slate-100 px-6 py-2 rounded-full font-mono text-xl font-bold border border-slate-700 shadow-sm">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="flex justify-between w-full max-w-[600px] mb-4 text-2xl font-bold px-4">
                        <span className="text-sky-500 drop-shadow-sm">Player: {score.player}</span>
                        <span className="text-pink-500 drop-shadow-sm">CPU: {score.computer}</span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            style={{ width: '100%', height: '100%', maxHeight: '85vmin', objectFit: 'contain', aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
                            className="bg-slate-900 block rounded-xl"
                        />

                        {!gameStarted && !gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Button onClick={() => setGameStarted(true)} className="animate-pulse scale-125 shadow-xl">
                                    Start Game
                                </Button>
                            </div>
                        )}

                        {paused && gameStarted && !gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <h2 className="text-5xl font-black text-white tracking-widest drop-shadow-lg">PAUSED</h2>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
                                <h2 className={`text-4xl font-black mb-2 ${winner === 'Player' ? 'text-green-400' : 'text-red-400'}`}>
                                    {winner === 'Player' ? 'YOU WON!' : 'GAME OVER'}
                                </h2>
                                <p className="text-white text-lg mb-6">
                                    Final Score: {score.player} - {score.computer}
                                </p>
                                {winner === 'Player' && user && (
                                    <div className="flex items-center gap-2 text-yellow-400 mb-6 font-bold bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                                        <Trophy size={16} /> Score Submitted!
                                    </div>
                                )}
                                {winner === 'Player' && !user && (
                                    <p className="text-slate-400 text-sm mb-6">Log in to save your high score!</p>
                                )}
                                <Button onClick={restartGame} className="scale-110 shadow-xl">
                                    Play Again
                                </Button>
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
                        to move • Space to serve
                    </p>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Pong;
