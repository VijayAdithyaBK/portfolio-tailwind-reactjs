import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const INITIAL_BRICK_ROWS = 3;
const BRICK_COLUMN_COUNT = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 35;
const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

const Breakout = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);

    // Save score on Game Over
    useEffect(() => {
        if (gameOver && user && score > 0) {
            addScore('breakout', user.username, score);
        }
    }, [gameOver]);
    const [level, setLevel] = useState(1);
    const [levelComplete, setLevelComplete] = useState(false);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    // Game State
    const gameState = useRef({
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 0, dy: 0 },
        paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
        bricks: [],
        rightPressed: false,
        leftPressed: false,
        ballOnPaddle: true,
        baseSpeed: 4
    });

    const requestRef = useRef();
    const isPlayingRef = useRef(false);

    useEffect(() => {
        initBricks(1);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        if (isPlaying && !levelComplete) {
            requestRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
    }, [isPlaying, levelComplete]);

    const initBricks = (currentLevel) => {
        const rowCount = Math.min(INITIAL_BRICK_ROWS + (currentLevel - 1), 8); // Cap at 8 rows
        const newBricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            newBricks[c] = [];
            for (let r = 0; r < rowCount; r++) {
                newBricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        gameState.current.bricks = newBricks;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = true;
        if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = true;

        if (e.code === 'Space') {
            e.preventDefault();
            if (gameState.current.ballOnPaddle && isPlayingRef.current && !levelComplete) {
                launchBall();
            }
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = false;
        if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = false;
    };

    const launchBall = () => {
        const state = gameState.current;
        state.ballOnPaddle = false;
        // Launch angle logic can be improved, but straight up or slight random angle is fine
        const dirX = Math.random() < 0.5 ? -1 : 1;
        state.ball.dx = state.baseSpeed * dirX;
        state.ball.dy = -state.baseSpeed;
    };

    const collisionDetection = () => {
        const { ball, bricks } = gameState.current;
        let activeBricks = 0;

        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < bricks[c].length; r++) { // Use dynamic length
                const b = bricks[c][r];
                if (b.status === 1) {
                    activeBricks++;
                    if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        setScore(s => s + 10);

                        // Progressive Speed Increase
                        const speedIncreaseFactor = 1.02; // 2% faster per brick
                        ball.dx *= speedIncreaseFactor;
                        ball.dy *= speedIncreaseFactor;
                    }
                }
            }
        }

        if (activeBricks === 0 && !gameState.current.ballOnPaddle) {
            handleLevelComplete();
        }
    };

    const handleLevelComplete = () => {
        setLevelComplete(true);
        setIsPlaying(false);
    };

    const nextLevel = () => {
        setLevel(l => {
            const nextOne = l + 1;
            initBricks(nextOne);
            return nextOne;
        });

        gameState.current.ballOnPaddle = true;
        gameState.current.baseSpeed += 0.5; // Base speed gets faster each level
        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 0, dy: 0 };
        gameState.current.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;

        setLevelComplete(false);
        setIsPlaying(true);
    };

    const draw = (ctx) => {
        const { ball, paddleX, bricks } = gameState.current;

        // Clear
        ctx.fillStyle = '#1e293b'; // Slate 800
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Bricks
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < bricks[c].length; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;

                    // Colors based on row
                    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
                    ctx.fillStyle = colors[r % colors.length];
                    ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                    ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Shadow
                    ctx.fillRect(brickX, brickY + BRICK_HEIGHT - 3, BRICK_WIDTH, 3);
                }
            }
        }

        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();

        // Paddle
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

        // "Press Space" Hint
        if (gameState.current.ballOnPaddle && isPlaying) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Press SPACE to Launch", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        }
    };

    const update = () => {
        const { ball, rightPressed, leftPressed, paddleX, ballOnPaddle } = gameState.current;

        // Paddle Movement
        if (rightPressed && paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
            gameState.current.paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            gameState.current.paddleX -= 7;
        }

        if (ballOnPaddle) {
            // Stick ball to paddle
            gameState.current.ball.x = gameState.current.paddleX + PADDLE_WIDTH / 2;
            gameState.current.ball.y = CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS;
        } else {
            // Ball Movement
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall Collision
            if (ball.x + ball.dx > CANVAS_WIDTH - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
                ball.dx = -ball.dx;
            }
            if (ball.y + ball.dy < BALL_RADIUS) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS - 10) {
                // Paddle Collision
                if (ball.x > paddleX && ball.x < paddleX + PADDLE_WIDTH) {
                    // Determine bounce angle
                    let collidePoint = ball.x - (paddleX + PADDLE_WIDTH / 2);
                    collidePoint = collidePoint / (PADDLE_WIDTH / 2);
                    let angle = collidePoint * (Math.PI / 3);

                    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    ball.dx = speed * Math.sin(angle);
                    ball.dy = -speed * Math.cos(angle);
                } else {
                    // Miss
                    if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
                        setLives(l => {
                            const newLives = l - 1;
                            if (newLives === 0) {
                                setGameOver(true);
                                endGame();
                            } else {
                                // Reset ball to paddle
                                gameState.current.ballOnPaddle = true;
                                gameState.current.ball.dx = 0;
                                gameState.current.ball.dy = 0;
                            }
                            return newLives;
                        });
                    }
                }
            }

            collisionDetection();
        }
    };

    const gameLoop = () => {
        if (!isPlayingRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            update();
            draw(ctx);
        }
        if (!gameOver && !levelComplete) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const startGame = () => {
        if (gameOver) resetGame();
        setIsPlaying(true);
    };

    const endGame = () => {
        setIsPlaying(false);
        cancelAnimationFrame(requestRef.current);
    };

    const resetGame = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setLevel(1);
        setLevelComplete(false);

        gameState.current.ballOnPaddle = true;
        gameState.current.baseSpeed = 4;
        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 0, dy: 0 };
        gameState.current.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;

        initBricks(1);
    };

    return (
        <Layout>
            <GameWrapper
                title="Breakout"
                description="Smash all the bricks. Catch the ball. Don't die."
                instructions={[
                    "Use Left/Right Arrow keys to move.",
                    "Press SPACE to launch the ball.",
                    "Clear bricks to advance levels.",
                    "Ball gets faster as you play!"
                ]}
            >
                <div className="flex flex-col items-center w-full h-full justify-center">
                    <div className="flex justify-between w-full max-w-[600px] mb-4 text-xl font-bold px-4">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-slate-700">Score: {score}</div>
                        <div className="bg-blue-100 px-4 py-2 rounded-full shadow-sm text-blue-700">Level: {level}</div>
                        <div className="flex gap-1">
                            {Array(lives).fill(0).map((_, i) => (
                                <div key={i} className="w-4 h-4 rounded-full bg-red-500" />
                            ))}
                        </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            style={{ maxHeight: '80vmin', width: '100%', height: 'auto', objectFit: 'contain', aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
                            className="bg-slate-900 block"
                        />

                        {!isPlaying && !gameOver && !levelComplete && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Button onClick={startGame} className="animate-pulse scale-125 shadow-xl">
                                    <Play size={24} fill="white" /> Start Game
                                </Button>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <h2 className="text-4xl font-black text-red-500 mb-4 tracking-widest">GAME OVER</h2>
                                <p className="text-white text-xl mb-6">Final Score: {score}</p>
                                {user && (
                                    <div className="flex items-center gap-2 text-yellow-400 mb-6 font-bold bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                                        <Trophy size={16} /> Score Submitted!
                                    </div>
                                )}
                                <Button onClick={resetGame} variant="primary" className="px-8 shadow-lg shadow-red-500/20">
                                    <RotateCcw size={20} /> Try Again
                                </Button>
                            </div>
                        )}

                        {levelComplete && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <h2 className="text-4xl font-black text-green-500 mb-2 tracking-widest animate-bounce">LEVEL {level} COMPLETE!</h2>
                                <p className="text-white text-lg mb-6">Ready for the next challenge?</p>
                                <Button onClick={nextLevel} variant="primary" className="px-8 shadow-lg shadow-green-500/20">
                                    <ArrowRight size={20} /> Next Level
                                </Button>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-slate-500 hidden md:block font-medium">Arrow Keys to Move • Space to Launch</p>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex gap-4 mt-6 w-full max-w-[300px]">
                        <button
                            className="flex-1 h-16 bg-slate-200 rounded-xl active:bg-blue-500 active:text-white font-bold text-2xl shadow-sm"
                            onTouchStart={(e) => { e.preventDefault(); gameState.current.leftPressed = true; }}
                            onTouchEnd={(e) => { e.preventDefault(); gameState.current.leftPressed = false; }}
                        >
                            ←
                        </button>

                        {gameState.current.ballOnPaddle && (
                            <button
                                className="flex-1 h-16 bg-yellow-400 rounded-xl active:bg-yellow-500 text-white font-bold text-xl shadow-sm uppercase tracking-wider"
                                onTouchStart={(e) => { e.preventDefault(); launchBall(); }}
                            >
                                FIRE
                            </button>
                        )}

                        <button
                            className="flex-1 h-16 bg-slate-200 rounded-xl active:bg-blue-500 active:text-white font-bold text-2xl shadow-sm"
                            onTouchStart={(e) => { e.preventDefault(); gameState.current.rightPressed = true; }}
                            onTouchEnd={(e) => { e.preventDefault(); gameState.current.rightPressed = false; }}
                        >
                            →
                        </button>
                    </div>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Breakout;
