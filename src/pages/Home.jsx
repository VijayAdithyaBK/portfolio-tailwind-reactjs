import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useSearch } from '../context/SearchContext';
import { Gamepad2, Brain, Scissors, Grid3x3, Hash, CircleDot, Crosshair, Cpu, Flag, MonitorPlay, Hammer, Play, Zap, Star, Search } from 'lucide-react';

const games = [
    {
        id: 'breakout',
        title: 'Breakout',
        category: 'Arcade',
        description: 'Smash the bricks!',
        icon: <Zap size={32} className="text-white" />,
        path: '/breakout',
        color: 'bg-indigo-400',
        plays: '18K'
    },
    {
        id: 'flappy',
        title: 'Flappy Bird',
        category: 'Arcade',
        description: 'Tap to fly.',
        icon: <Cpu size={32} className="text-white" />,
        path: '/flappy',
        color: 'bg-yellow-400',
        plays: '40K'
    },
    {
        id: 'simon',
        title: 'Simon Says',
        category: 'Memory',
        description: 'Follow the pattern.',
        icon: <Brain size={32} className="text-white" />,
        path: '/simon',
        color: 'bg-green-600',
        plays: '11K'
    },
    {
        id: 'pong',
        title: 'Pong',
        category: 'Sports',
        description: 'Classic arcade tennis game.',
        icon: <MonitorPlay size={32} className="text-white" />,
        path: '/pong',
        color: 'bg-pink-500',
        plays: '12K'
    },
    {
        id: 'whack',
        title: 'Whack-a-Mole',
        category: 'Action',
        description: 'Test your reflexes!',
        icon: <Hammer size={32} className="text-white" />,
        path: '/whack',
        color: 'bg-amber-500',
        plays: '8.5K'
    },
    {
        id: 'battleship',
        title: 'Battleship',
        category: 'Strategy',
        description: 'Sink enemy ships.',
        icon: <Crosshair size={32} className="text-white" />,
        path: '/battleship',
        color: 'bg-blue-500',
        plays: '15K'
    },
    {
        id: 'snake',
        title: 'Snake',
        category: 'Arcade',
        description: 'Grow the snake.',
        icon: <Cpu size={32} className="text-white" />,
        path: '/snake',
        color: 'bg-emerald-500',
        plays: '20K'
    },
    {
        id: 'connect4',
        title: 'Connect Four',
        category: 'Strategy',
        description: 'Connect 4 discs.',
        icon: <CircleDot size={32} className="text-white" />,
        path: '/connect4',
        color: 'bg-indigo-500',
        plays: '10K'
    },
    {
        id: 'sudoku',
        title: 'Sudoku',
        category: 'Puzzle',
        description: 'Logic puzzle.',
        icon: <Grid3x3 size={32} className="text-white" />,
        path: '/sudoku',
        color: 'bg-cyan-500',
        plays: '5K'
    },
    {
        id: 'minesweeper',
        title: 'Minesweeper',
        category: 'Puzzle',
        description: 'Avoid the mines.',
        icon: <Flag size={32} className="text-white" />,
        path: '/minesweeper',
        color: 'bg-red-500',
        plays: '6K'
    },
    {
        id: '2048',
        title: '2048',
        category: 'Puzzle',
        description: 'Merge numbers.',
        icon: <Hash size={32} className="text-white" />,
        path: '/2048',
        color: 'bg-purple-500',
        plays: '25K'
    },
    {
        id: 'memory',
        title: 'Memory Match',
        category: 'Puzzle',
        description: 'Find pairs.',
        icon: <Brain size={32} className="text-white" />,
        path: '/memory',
        color: 'bg-orange-500',
        plays: '4K'
    },
    {
        id: 'rps',
        title: 'RPS',
        category: 'Casual',
        description: 'Rock Paper Scissors.',
        icon: <Scissors size={32} className="text-white" />,
        path: '/rps',
        color: 'bg-teal-500',
        plays: '3K'
    },
    {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        category: 'Classic',
        description: '3 in a row.',
        icon: <Gamepad2 size={32} className="text-white" />,
        path: '/tictactoe',
        color: 'bg-violet-500',
        plays: '9K'
    }
];

const GameCard = ({ game }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(game.path)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1"
        >
            {/* Thumbnail */}
            <div className={`h-32 ${game.color} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Play size={8} fill="currentColor" /> {game.plays}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">{game.category}</div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {game.title}
                </h3>
            </div>
        </div>
    );
};

const Home = () => {
    const { searchTerm } = useSearch();
    const [showAll, setShowAll] = useState(false);

    // Filter games based on search term
    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limit to 10 games (2 rows of 5) unless searching or "show all" is active
    const displayedGames = (showAll || searchTerm) ? filteredGames : filteredGames.slice(0, 10);

    return (
        <Layout>
            <div className="h-full w-full overflow-y-auto overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 py-8">

                    {/* Hero / Featured - Only show when NOT searching */}
                    {!searchTerm && (
                        <section className="mb-12">
                            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 shadow-2xl h-80 sm:h-96 flex items-center">
                                <div className="relative z-10 px-8 sm:px-16 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-bold mb-4 border border-white/20">
                                        <Zap size={12} fill="currentColor" className="text-yellow-400" />
                                        FEATURED GAME
                                    </div>
                                    <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
                                        PLAY <br /> PONG
                                    </h1>
                                    <p className="text-indigo-100 text-lg mb-8 max-w-md">
                                        Challenge our advanced AI in this retro classic. Can you beat the computer?
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/pong'}
                                        className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 group"
                                    >
                                        <Play fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                        Play Now
                                    </button>
                                </div>

                                {/* Abstract Shapes */}
                                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/50 to-transparent skew-x-12 transform translate-x-20" />
                                <div className="absolute right-20 top-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-50" />
                            </div>
                        </section>
                    )}

                    {/* Categories / Sections */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                {searchTerm ? (
                                    <>
                                        <Search className="text-blue-500" />
                                        Search Results
                                    </>
                                ) : (
                                    <>
                                        <Star className="text-yellow-400" fill="currentColor" />
                                        Popular Games
                                    </>
                                )}
                            </h2>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    {showAll ? 'Show Less' : 'View All'}
                                </button>
                            )}
                        </div>

                        {filteredGames.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {displayedGames.map(game => (
                                    <GameCard key={game.id} game={game} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-lg font-bold">No games found matching "{searchTerm}"</p>
                                <p>Try searching for "Puzzle", "Action", or "Snake"</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
