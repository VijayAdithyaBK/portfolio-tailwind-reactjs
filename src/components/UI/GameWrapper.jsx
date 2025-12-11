import React, { useState } from 'react';
import { ArrowLeft, BookOpen, X, Info } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const GameWrapper = ({ title, description, instructions, children }) => {
    const [showTutorial, setShowTutorial] = useState(true);

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 overflow-hidden">
            {/* Game Header */}
            <div className="flex-none flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-white border-b border-slate-200 shadow-sm z-10">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                    >
                        <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{title}</h1>
                </div>

                <button
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-semibold hover:bg-blue-100 transition-colors text-xs sm:text-sm"
                >
                    <Info size={16} />
                    <span className="hidden sm:inline">How to Play</span>
                </button>
            </div>

            {/* Main Content - Centered & Flexible */}
            <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden p-1 sm:p-2">
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {children}
                </div>
            </div>

            {/* Tutorial Overlay */}
            {showTutorial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-start text-white">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                                <p className="text-blue-100">{description}</p>
                            </div>
                            <button onClick={() => setShowTutorial(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <BookOpen className="text-blue-500" />
                                Instructions
                            </h3>
                            <ul className="space-y-3 mb-8">
                                {instructions.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-slate-600">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ul>

                            <Button onClick={() => setShowTutorial(false)} className="w-full py-4 text-lg shadow-blue-500/30">
                                Play Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameWrapper;
