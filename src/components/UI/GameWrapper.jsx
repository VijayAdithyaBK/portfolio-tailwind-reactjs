import React, { useState } from 'react';
import { ArrowLeft, BookOpen, X, Info } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const GameWrapper = ({ title, description, instructions, children }) => {
    const [showTutorial, setShowTutorial] = useState(true);

    return (
        <div className="flex flex-col w-full h-full min-h-[calc(100vh-100px)]">
            {/* Game Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                </div>

                <button
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold hover:bg-blue-100 transition-colors"
                >
                    <Info size={20} />
                    <span className="hidden sm:inline">How to Play</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-50 p-4 sm:p-8 flex justify-center overflow-auto">
                <div className="w-full max-w-4xl">
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
