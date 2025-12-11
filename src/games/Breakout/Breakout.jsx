import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Play, RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
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
    const [won, setWon] = useState(false);

    // Game State
    const gameState = useRef({
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 4, dy: -4 },
        paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
        bricks: [],
        rightPressed: false,
        leftPressed: false
    });

    const requestRef = useRef();

    useEffect(() => {
        initBricks();
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const initBricks = () => {
        const newBricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            newBricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                newBricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        gameState.current.bricks = newBricks;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = true;
        if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = true;
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = false;
        if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = false;
    };

    const collisionDetection = () => {
        const { ball, bricks } = gameState.current;
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        setScore(s => s + 10);
                        if (score + 10 === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                            setWon(true);
                            endGame();
                        }
                    }
                }
            }
        }
    };

    const draw = (ctx) => {
        const { ball, paddleX, bricks } = gameState.current;

        // Clear
        ctx.fillStyle = '#1e293b'; // Slate 800
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Bricks
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;

                    // Colors based on row
                    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
                    ctx.fillStyle = colors[r];
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
    };

    const update = () => {
        const { ball, rightPressed, leftPressed, paddleX } = gameState.current;

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
                // Determine bounce angle based on where hit
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
                            // Reset ball
                            ball.x = CANVAS_WIDTH / 2;
                            ball.y = CANVAS_HEIGHT - 30;
                            ball.dx = 4;
                            ball.dy = -4;
                            gameState.current.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
                        }
                        return newLives;
                    });
                }
            }
        }

        // Paddle Movement
        if (rightPressed && paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
            gameState.current.paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            gameState.current.paddleX -= 7;
        }

        collisionDetection();
    };

    const gameLoop = () => {
        if (!isPlaying) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            update();
            draw(ctx);
        }
        if (!gameOver && !won) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const startGame = () => {
        if (gameOver || won) resetGame();
        setIsPlaying(true);
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const endGame = () => {
        setIsPlaying(false);
        cancelAnimationFrame(requestRef.current);
    };

    const resetGame = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setWon(false);
        initBricks();
        gameState.current.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 4, dy: -4 };
        gameState.current.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    };

    return (
        <Layout>
            <GameWrapper
                title="Breakout"
                description="Smash all the bricks with the ball. Don't let the ball drop!"
                instructions={[
                    "Use Left/Right Arrow keys to move the paddle.",
                    "Bounce the ball to hit the bricks.",
                    "Destroy all bricks to win.",
                    "You have 3 lives."
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-[600px] mb-4 text-xl font-bold px-4">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm text-slate-700">Score: {score}</div>
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
                            className="bg-slate-900 max-w-full block"
                        />

                        {!isPlaying && !gameOver && !won && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <Button onClick={startGame} className="animate-pulse scale-125 shadow-xl">
                                    <Play size={24} fill="white" /> Start Game
                                </Button>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <h2 className="text-4xl font-black text-red-500 mb-4 tracking-widest">GAME OVER</h2>
                                <Button onClick={resetGame} variant="primary" className="px-8 shadow-lg shadow-red-500/20">
                                    <RotateCcw size={20} /> Try Again
                                </Button>
                            </div>
                        )}

                        {won && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <h2 className="text-4xl font-black text-green-500 mb-4 tracking-widest animate-bounce">YOU WIN!</h2>
                                <p className="text-white text-xl mb-6">Score: {score}</p>
                                <Button onClick={resetGame} variant="primary" className="px-8 shadow-lg shadow-green-500/20">
                                    <RotateCcw size={20} /> Play Again
                                </Button>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-slate-500 hidden md:block">Use Arrow Keys to Move</p>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex gap-4 mt-6 w-full max-w-[300px]">
                        <button
                            className="flex-1 h-16 bg-slate-200 rounded-xl active:bg-blue-500 active:text-white font-bold text-2xl shadow-sm"
                            onTouchStart={(e) => { e.preventDefault(); gameState.current.leftPressed = true; }}
                            onTouchEnd={(e) => { e.preventDefault(); gameState.current.leftPressed = false; }}
                        >
                            ←
                        </button>
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
