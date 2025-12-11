import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-indigo-500/30",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30",
        outline: "border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
