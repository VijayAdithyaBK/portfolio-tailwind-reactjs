import React from 'react';
import { Gamepad2, Search, User, Trophy, Menu } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
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
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm font-medium"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="p-2 hover:bg-slate-50 rounded-full text-slate-600 hover:text-blue-600 transition-colors hidden sm:block">
                            <Trophy size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30">
                            <User size={18} />
                            <span className="hidden sm:inline">Login</span>
                        </button>
                        <button className="md:hidden p-2 text-slate-600">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">ArcadeHub</h3>
                        <p className="text-sm">The best free online games platform. Play exciting mini-games, challenge your friends, and track your high scores!</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white cursor-pointer">Action</li>
                            <li className="hover:text-white cursor-pointer">Puzzle</li>
                            <li className="hover:text-white cursor-pointer">Strategy</li>
                            <li className="hover:text-white cursor-pointer">Sports</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="hover:text-white cursor-pointer">Help Center</li>
                            <li className="hover:text-white cursor-pointer">Terms of Service</li>
                            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Connect</h4>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholders */}
                            <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-blue-400 transition-colors cursor-pointer"></div>
                            <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-pink-600 transition-colors cursor-pointer"></div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-8 text-center text-xs">
                    © 2024 ArcadeHub. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
