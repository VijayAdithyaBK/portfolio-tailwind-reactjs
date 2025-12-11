import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
    return (
        <div
            className={`
        bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl 
        shadow-xl ${hover ? 'hover:shadow-2xl hover:border-white/20 transition-all duration-300' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
