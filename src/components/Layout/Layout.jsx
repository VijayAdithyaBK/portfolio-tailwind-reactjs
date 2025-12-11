import { useSearch } from '../../context/SearchContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Search, Trophy, User, Menu, Github, Linkedin } from 'lucide-react';

const Layout = ({ children }) => {
    const { searchTerm, setSearchTerm } = useSearch();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-100 font-sans text-slate-800 overflow-hidden">
            {/* Header */}
            <header className="flex-none z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                            <Gamepad2 className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
                            ARCADE<span className="text-slate-800">HUB</span>
                        </span>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for games..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm font-medium"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="p-2 hover:bg-slate-50 rounded-full text-slate-600 hover:text-blue-600 transition-colors hidden sm:block"
                            title="Leaderboard"
                        >
                            <Trophy size={20} />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-700 hidden sm:block">Hi, {user.username}</span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-300 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                            >
                                <User size={18} />
                                <span className="hidden sm:inline">Login</span>
                            </button>
                        )}

                        <button className="md:hidden p-2 text-slate-600">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Occupies remaining space, NO SCROLL on this container */}
            <main className="flex-1 w-full overflow-hidden relative flex flex-col">
                {children}
            </main>

            {/* Footer - Fixed/Flexed at bottom */}
            <footer className="flex-none bg-slate-900 text-slate-400 py-3 border-t border-slate-800 z-40 text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
                    <div className="font-medium">
                        Built by <span className="text-white">Vijay Adithya B K</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-bold text-white uppercase tracking-wider hidden sm:inline">Connect:</span>
                        <div className="flex gap-3">
                            <a
                                href="https://vijayadithyabk.github.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-slate-800 rounded-full hover:bg-white hover:text-black transition-all cursor-pointer flex items-center justify-center"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/vijayadithyabk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-slate-800 rounded-full hover:bg-[#0077b5] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
