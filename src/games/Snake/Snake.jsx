import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { RotateCcw, Play, Pause, Settings, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Up

const DIFFICULTIES = {
    Easy: 200,
    Medium: 140,
    Hard: 80
};

const Snake = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [difficulty, setDifficulty] = useState('Medium');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const directionRef = useRef(INITIAL_DIRECTION);
    const gameLoopRef = useRef(null);

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        const saved = localStorage.getItem('snakeIdx');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeIdx', score);
        }
    }, [score, highScore]);

    // Handle Game Over Score Submission
    useEffect(() => {
        if (gameOver && user && score > 0) {
            addScore('snake', user.username, score);
        }
    }, [gameOver]);

    useEffect(() => {
        if (isPlaying) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            stopGameLoop();
        };
    }, [isPlaying]);

    useEffect(() => {
        if (isPlaying && !gameOver && !isPaused) {
            startGameLoop();
        } else {
            stopGameLoop();
        }
    }, [isPlaying, gameOver, isPaused, snake]);

    const startGameLoop = () => {
        stopGameLoop();
        gameLoopRef.current = setInterval(moveSnake, DIFFICULTIES[difficulty]);
    };

    const stopGameLoop = () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const handleKeyDown = (e) => {
        const currentDir = directionRef.current;
        switch (e.key) {
            case 'ArrowUp':
                if (currentDir.y !== 1) setDirection({ x: 0, y: -1 }); break;
            case 'ArrowDown':
                if (currentDir.y !== -1) setDirection({ x: 0, y: 1 }); break;
            case 'ArrowLeft':
                if (currentDir.x !== 1) setDirection({ x: -1, y: 0 }); break;
            case 'ArrowRight':
                if (currentDir.x !== -1) setDirection({ x: 1, y: 0 }); break;
            case ' ':
                setIsPaused(p => !p); break;
        }
    };

    const moveSnake = () => {
        const head = snake[0];
        const newHead = {
            x: head.x + directionRef.current.x,
            y: head.y + directionRef.current.y
        };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            setGameOver(true);
            return;
        }

        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            setGameOver(true);
            return;
        }

        const newSnake = [newHead, ...snake];

        if (newHead.x === food.x && newHead.y === food.y) {
            setScore(s => s + 10);
            placeFood(newSnake);
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    const placeFood = (currentSnake) => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
                break;
            }
        }
        setFood(newFood);
    };

    const startGame = () => {
        resetGame();
        setIsPlaying(true);
    };

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        directionRef.current = INITIAL_DIRECTION;
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        placeFood(INITIAL_SNAKE);
    };

    const backToMenu = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setGameOver(false);
    };

    return (
        <Layout>
            <GameWrapper
                title="Snake"
                description="Grow your snake by eating food, but don't crash into yourself or the walls!"
                instructions={[
                    "Use Arrow keys to control the snake's direction.",
                    "Eat the red food to grow and earn points.",
                    "Avoid hitting the walls or your own tail.",
                    "Choose a higher speed for a greater challenge!"
                ]}
            >
                <div className="flex flex-col items-center w-full h-full justify-center">

                    {!isPlaying ? (
                        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-sm w-full">
                            <div className="flex justify-center mb-6">
                                <Trophy className="text-yellow-400 w-16 h-16" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">High Score: {highScore}</h3>

                            <div className="mb-6">
                                <p className="text-slate-400 mb-2 text-sm font-bold uppercase tracking-wider">Select Speed</p>
                                <div className="flex justify-center gap-2">
                                    {Object.keys(DIFFICULTIES).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === level
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={startGame} className="w-full justify-center py-3 text-lg shadow-xl shadow-emerald-500/20">Start Game</Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex gap-8 text-xl font-bold text-slate-600">
                                <div>Score: <span className="text-emerald-500">{score}</span></div>
                                {gameOver && <div className="text-red-500 animate-bounce">GAME OVER</div>}
                                {isPaused && !gameOver && <div className="text-amber-500 animate-pulse">PAUSED</div>}
                            </div>

                            <div className="p-4 bg-emerald-900 rounded-xl border-8 border-emerald-800 shadow-2xl relative">
                                <div
                                    className="grid bg-emerald-950/50"
                                    style={{
                                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                                        width: 'min(80vmin, 600px)',
                                        height: 'min(80vmin, 600px)'
                                    }}
                                >
                                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                                        const x = i % GRID_SIZE;
                                        const y = Math.floor(i / GRID_SIZE);
                                        const isSnakeHead = snake[0].x === x && snake[0].y === y;
                                        const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
                                        const isFood = food.x === x && food.y === y;

                                        return (
                                            <div key={i} className={`
                                    w-full h-full border-[0.5px] border-emerald-900/20
                                    ${isSnakeHead ? 'bg-emerald-400 rounded-sm z-10' : ''}
                                    ${isSnakeBody ? 'bg-emerald-600/80 rounded-sm' : ''}
                                    ${isFood ? 'bg-red-500 rounded-full scale-75 shadow-[0_0_10px_red] animate-pulse' : ''}
                                `} />
                                        );
                                    })}
                                </div>

                                {gameOver && (
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 backdrop-blur-sm rounded-lg text-center">
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-wide">CRASHED!</h3>
                                        <p className="text-xl text-emerald-400 mb-6 font-bold">Final Score: {score}</p>

                                        {user && (
                                            <div className="flex items-center gap-2 text-yellow-400 mb-6 font-bold bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                                                <Trophy size={16} /> Score Submitted!
                                            </div>
                                        )}
                                        {!user && (
                                            <p className="text-slate-400 text-sm mb-6">Log in to save your high score!</p>
                                        )}

                                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                                            <Button onClick={resetGame}>Try Again</Button>
                                            <Button onClick={backToMenu} variant="secondary">Change Difficulty</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-4">
                                <Button onClick={() => setIsPaused(!isPaused)} variant="secondary" disabled={gameOver} className="px-6">
                                    {isPaused ? <Play size={20} /> : <Pause size={20} />} {isPaused ? "Resume" : "Pause"}
                                </Button>
                                <Button onClick={backToMenu} variant="outline" className="px-6">
                                    Quit
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default Snake;
