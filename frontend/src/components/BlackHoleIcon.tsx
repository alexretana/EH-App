import React from 'react';

const BlackHoleIcon: React.FC<{ className?: string; size?: string }> = ({
  className = "",
  size = "w-10 h-10"
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${size} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="eventHorizon" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="1" />
          <stop offset="40%" stopColor="#0a0a1a" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#1a1a3a" stopOpacity="0.8" />
          <stop offset="75%" stopColor="#2a2a5a" stopOpacity="0.6" />
          <stop offset="85%" stopColor="#3a3a7a" stopOpacity="0.4" />
          <stop offset="95%" stopColor="#4a4a9a" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#5a5aba" stopOpacity="0" />
        </radialGradient>
        
        <radialGradient id="accretionDisk" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="30%" stopColor="#1a0033" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#330066" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#4d0099" stopOpacity="0.8" />
          <stop offset="85%" stopColor="#6600cc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7f00ff" stopOpacity="0.2" />
        </radialGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Accretion disk */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="45" 
        ry="15" 
        fill="url(#accretionDisk)" 
        transform="rotate(-20 50 50)"
        opacity="0.8"
      />
      
      {/* Event horizon */}
      <circle 
        cx="50" 
        cy="50" 
        r="25" 
        fill="url(#eventHorizon)"
        filter="url(#glow)"
      />
      
      {/* Inner event horizon */}
      <circle 
        cx="50" 
        cy="50" 
        r="20" 
        fill="#000000"
        opacity="0.9"
      />
      
      {/* Photon sphere effect */}
      <circle 
        cx="50" 
        cy="50" 
        r="22" 
        fill="none" 
        stroke="#6600cc" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      
      {/* Gravitational lensing effect */}
      <circle 
        cx="50" 
        cy="50" 
        r="28" 
        fill="none" 
        stroke="#4a4a9a" 
        strokeWidth="0.3" 
        opacity="0.4"
        strokeDasharray="2 1"
      />
    </svg>
  );
};

export default BlackHoleIcon;