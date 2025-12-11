import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { Scissors, Hand, Circle, RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard } from '../../context/LeaderboardContext';

const CHOICES = [
    { name: 'Rock', icon: Circle, color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Paper', icon: Hand, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Scissors', icon: Scissors, color: 'text-green-500', bg: 'bg-green-50' }
];

const RockPaperScissors = () => {
    const [playerChoice, setPlayerChoice] = useState(null);
    const [computerChoice, setComputerChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState({ player: 0, computer: 0 });

    const { user } = useAuth();
    const { addScore } = useLeaderboard();

    const handleChoice = (choice) => {
        const computer = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        setPlayerChoice(choice);
        setComputerChoice(computer);
        calculateWinner(choice.name, computer.name);
    };

    const calculateWinner = (player, computer) => {
        if (player === computer) {
            setResult('Checkmate... wait, Draw!');
        } else if (
            (player === 'Rock' && computer === 'Scissors') ||
            (player === 'Paper' && computer === 'Rock') ||
            (player === 'Scissors' && computer === 'Paper')
        ) {
            setResult('You Win!');
            setScore(s => ({ ...s, player: s.player + 1 }));
        } else {
            setResult('Computer Wins!');
            setScore(s => ({ ...s, computer: s.computer + 1 }));
        }
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
    };

    return (
        <Layout>
            <GameWrapper
                title="Rock Paper Scissors"
                description="Classic hand game. Beat the computer!"
                instructions={[
                    "Choose Rock, Paper, or Scissors.",
                    "Rock beats Scissors.",
                    "Scissors beats Paper.",
                    "Paper beats Rock.",
                    "Try to get a higher score than the computer!"
                ]}
            >
                <div className="flex flex-col items-center">

                    <div className="flex justify-between w-full max-w-sm mb-8 px-8 py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-center">
                            <div className="text-xs font-bold text-slate-400 uppercase">You</div>
                            <div className="text-3xl font-black text-slate-800">{score.player}</div>
                        </div>
                        <div className="text-2xl font-black text-slate-300">VS</div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-slate-400 uppercase">CPU</div>
                            <div className="text-3xl font-black text-slate-800">{score.computer}</div>
                        </div>
                    </div>

                    {!playerChoice ? (
                        <div className="grid grid-cols-3 gap-4 sm:gap-8">
                            {CHOICES.map((choice) => (
                                <button
                                    key={choice.name}
                                    onClick={() => handleChoice(choice)}
                                    className={`
                                    w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2
                                    border-b-4 transition-all hover:-translate-y-1 hover:shadow-xl
                                    bg-white border-slate-200 hover:border-blue-300
                                    `}
                                >
                                    <choice.icon size={40} className={choice.color} />
                                    <span className="font-bold text-slate-600">{choice.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-center gap-8 mb-8">
                                <div className={`p-6 rounded-2xl bg-white shadow-lg border-b-4 border-slate-100 flex flex-col items-center gap-2`}>
                                    <playerChoice.icon size={48} className={playerChoice.color} />
                                    <span className="font-bold text-slate-600">You</span>
                                </div>
                                <div className="flex items-center text-2xl font-bold text-slate-300">VS</div>
                                <div className={`p-6 rounded-2xl bg-white shadow-lg border-b-4 border-slate-100 flex flex-col items-center gap-2`}>
                                    {computerChoice && <computerChoice.icon size={48} className={computerChoice.color} />}
                                    <span className="font-bold text-slate-600">CPU</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-3xl font-black text-slate-800 mb-6">{result}</h2>
                                {result === 'You Win!' && user && (
                                    <div className="flex items-center justify-center gap-2 text-green-500 mb-6 font-bold">
                                        <Trophy size={16} /> Score Updated!
                                    </div>
                                )}
                                <Button onClick={resetGame} className="px-12 py-3 text-lg shadow-lg">Play Again</Button>
                            </div>
                        </div>
                    )}
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default RockPaperScissors;
