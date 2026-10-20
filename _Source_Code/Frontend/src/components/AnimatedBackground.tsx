import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic gradient orbs that slowly pulse and drift */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse duration-10000" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-indigo-600/10 blur-[140px] animate-pulse duration-7000 delay-1000" />
      <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse duration-8000 delay-2000" />

      {/* Cyber Grid SVG with subtle animated scanline / pulse */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="smart-city-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="0.5"
              strokeDasharray="2, 4"
              opacity="0.3"
            />
            <circle cx="60" cy="0" r="1" fill="#38bdf8" opacity="0.4" />
            <circle cx="0" cy="60" r="1" fill="#10b981" opacity="0.4" />
          </pattern>

          {/* Linear gradient for sweeping radar scan */}
          <linearGradient id="grid-radar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#smart-city-grid)" />

        {/* Diagonal high-tech accent beams */}
        <line
          x1="0"
          y1="15%"
          x2="100%"
          y2="85%"
          stroke="url(#grid-radar)"
          strokeWidth="1.5"
          strokeDasharray="120, 240"
          className="animate-pulse"
        />
        <line
          x1="10%"
          y1="0"
          x2="90%"
          y2="100%"
          stroke="url(#grid-radar)"
          strokeWidth="1"
          strokeDasharray="80, 200"
          className="animate-pulse duration-5000"
        />
      </svg>

      {/* Floating subtle telemetry data nodes */}
      <div className="absolute top-20 right-1/4 flex items-center gap-1.5 opacity-30 text-[9px] font-mono text-cyan-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>SCADA MESH :: 24/28 NODES ONLINE</span>
      </div>

      <div className="absolute bottom-16 left-12 flex items-center gap-1.5 opacity-25 text-[9px] font-mono text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping delay-700" />
        <span>LORA GATEWAY :: 868 MHz LINK ACTIVE</span>
      </div>
    </div>
  );
};
