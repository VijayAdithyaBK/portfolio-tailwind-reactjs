import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import GameWrapper from '../../components/UI/GameWrapper';
import { RotateCcw, Brain, Check, X } from 'lucide-react';

const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const CARDS = [...ICONS, ...ICONS];

const MemoryMatch = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const shuffled = [...CARDS].sort(() => Math.random() - 0.5)
            .map((icon, id) => ({ id, icon }));
        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setGameWon(false);
        setDisabled(false);
    };

    const handleClick = (id) => {
        if (disabled || flipped.includes(id) || solved.includes(id)) return;

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        setFlipped([flipped[0], id]);
        setDisabled(true);
        setMoves(m => m + 1);

        if (cards[flipped[0]].icon === cards[id].icon) {
            setSolved(prev => [...prev, flipped[0], id]);
            setFlipped([]);
            setDisabled(false);
        } else {
            setTimeout(() => {
                setFlipped([]);
                setDisabled(false);
            }, 1000);
        }
    };

    useEffect(() => {
        if (solved.length === CARDS.length && CARDS.length > 0) {
            setGameWon(true);
        }
    }, [solved]);

    return (
        <Layout>
            <GameWrapper
                title="Memory Match"
                description="Test your memory by finding matching pairs of cards."
                instructions={[
                    "Click on a card to reveal its symbol.",
                    "Click another card to try and find a match.",
                    "If they match, they stay revealed. If not, they flip back.",
                    "Find all pairs in as few moves as possible!"
                ]}
            >
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full max-w-md mb-6">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                            <Brain className="text-orange-500" size={20} />
                            <span className="font-bold text-slate-700">Moves: {moves}</span>
                        </div>
                        {gameWon && (
                            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full shadow-sm text-green-700 font-bold animate-bounce">
                                <Check size={20} /> Complete!
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md w-full">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleClick(card.id)}
                                className={`
                            aspect-square rounded-xl cursor-pointer transition-all duration-300 transform perspective-1000 relative
                            ${flipped.includes(card.id) || solved.includes(card.id) ? 'rotate-y-180' : 'hover:scale-105'}
                        `}
                            >
                                <div className={`
                            w-full h-full rounded-xl shadow-md border-b-4 flex items-center justify-center text-4xl transition-all duration-300
                            ${flipped.includes(card.id) || solved.includes(card.id)
                                        ? 'bg-white border-orange-200 rotate-y-180'
                                        : 'bg-orange-500 border-orange-600'}
                        `}>
                                    {flipped.includes(card.id) || solved.includes(card.id) ? card.icon : <span className="text-2xl text-white/50 font-black">?</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={initializeGame} className="mt-8 px-8 shadow-lg shadow-orange-500/20">
                        <RotateCcw size={20} /> New Game
                    </Button>
                </div>
            </GameWrapper>
        </Layout>
    );
};

export default MemoryMatch;
