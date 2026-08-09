import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '', speed = 3 }) => {
  return (
    <span
      className={`inline-block relative overflow-hidden text-transparent bg-clip-text bg-[linear-gradient(110deg,#e2e8f0,45%,#fff,55%,#e2e8f0)] bg-[length:250%_100%] animate-[shine_var(--speed)_linear_infinite] ${className}`}
      style={{ '--speed': `${speed}s` } as React.CSSProperties}
    >
      {text}
    </span>
  );
};
