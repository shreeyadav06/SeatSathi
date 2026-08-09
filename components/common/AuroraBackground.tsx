import React from 'react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ 
  children, 
  className = '', 
  colors = ['#3b82f6', '#8b5cf6', '#eab308', '#ef4444'] 
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0a0f1a] ${className}`}>
      {/* Background container for aurora gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute opacity-30 mix-blend-screen blur-[60px] animate-[aurora-border_10s_ease-in-out_infinite,aurora-1_12s_linear_infinite]"
          style={{ 
            backgroundImage: `radial-gradient(circle at center, ${colors[0]} 0%, transparent 70%)`,
            width: '60vw', height: '60vh'
          }}
        />
        <div 
          className="absolute opacity-30 mix-blend-screen blur-[60px] animate-[aurora-border_10s_ease-in-out_infinite_reverse,aurora-2_14s_linear_infinite]"
          style={{ 
            backgroundImage: `radial-gradient(circle at center, ${colors[1]} 0%, transparent 70%)`,
            width: '50vw', height: '50vh'
          }}
        />
        <div 
          className="absolute opacity-30 mix-blend-screen blur-[60px] animate-[aurora-border_12s_ease-in-out_infinite,aurora-3_16s_linear_infinite]"
          style={{ 
            backgroundImage: `radial-gradient(circle at center, ${colors[2]} 0%, transparent 70%)`,
            width: '55vw', height: '55vh'
          }}
        />
        <div 
          className="absolute opacity-30 mix-blend-screen blur-[60px] animate-[aurora-border_14s_ease-in-out_infinite_reverse,aurora-4_18s_linear_infinite]"
          style={{ 
            backgroundImage: `radial-gradient(circle at center, ${colors[3]} 0%, transparent 70%)`,
            width: '65vw', height: '65vh'
          }}
        />
      </div>
      
      {/* Content wrapper with z-index to sit above the aurora */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
