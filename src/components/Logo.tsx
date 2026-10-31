import React from 'react';

export type LogoVariant = 'knot' | 'prism' | 'mobius' | 'iris';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isAnimated?: boolean;
  variant?: LogoVariant;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  isAnimated = false,
  variant = 'knot',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textMap = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]}`}>
        {/* Atmospheric ambient backglow */}
        <div
          className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-600/35 via-indigo-500/25 to-cyan-400/25 blur-md transition-all duration-700 pointer-events-none ${
            isAnimated ? 'animate-pulse scale-125 opacity-100' : 'opacity-70 group-hover:opacity-100'
          }`}
        />

        {/* SVG Aether Emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full relative z-10 transition-transform duration-300 ${
            isAnimated ? 'animate-pulse scale-105' : 'hover:scale-105'
          }`}
        >
          <defs>
            {/* Primary Aether Gradient: Violet -> Cyan */}
            <linearGradient id="aetherKnotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Individual Blade Shading Gradients for 3D Overlap */}
            <linearGradient id="bladeGradA" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="60%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            <linearGradient id="bladeGradB" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Prism Facet Gradients */}
            <linearGradient id="prismLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="prismRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="prismBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Precision Depth Shadow for Fold Interlocking */}
            <filter id="foldShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#09090b" floodOpacity="0.45" />
            </filter>

            {/* Center Singularity Glow */}
            <filter id="singularityGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* VARIANT 1: The Aether Neural Bloom Knot (Default Iconic Knot)  */}
          {/* 6-fold interlocking impossible torus knot with 3D overlapping  */}
          {/* ============================================================== */}
          {(variant === 'knot' || !variant) && (
            <g className="origin-center">
              {/* Outer circular containment accent ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#aetherKnotGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="opacity-40"
              />

              {/* 6 Interlocking Loops arranged symmetrically at 60deg angles */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <g key={deg} transform={`rotate(${deg} 50 50)`} filter="url(#foldShadow)">
                  {/* Clean, mathematical curved ribbon loop */}
                  <path
                    d="M 50 14
                       C 64 14, 76 25, 76 39
                       C 76 49, 70 57, 60 62
                       C 54 58, 50 50, 50 42
                       C 50 32, 56 26, 64 26
                       C 68 26, 70 28, 70 32"
                    stroke={i % 2 === 0 ? 'url(#bladeGradA)' : 'url(#bladeGradB)'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-95"
                  />
                </g>
              ))}

              {/* Central crystalline core starburst */}
              <circle
                cx="50"
                cy="50"
                r="5"
                fill="#ffffff"
                filter="url(#singularityGlow)"
              />
              <circle cx="50" cy="50" r="2.5" fill="#8b5cf6" />
            </g>
          )}

          {/* ============================================================== */}
          {/* VARIANT 2: Quantum Prism Delta (Aether Isometric 'A' Monogram) */}
          {/* Architectural 3D faceted crystal with chamfered geometry        */}
          {/* ============================================================== */}
          {variant === 'prism' && (
            <g className="origin-center">
              {/* Top Facet */}
              <polygon
                points="50,12 84,32 50,52 16,32"
                fill="url(#bladeGradA)"
                filter="url(#foldShadow)"
                className="opacity-95"
              />
              {/* Right Facet */}
              <polygon
                points="50,52 84,32 84,72 50,92"
                fill="url(#bladeGradB)"
                filter="url(#foldShadow)"
                className="opacity-90"
              />
              {/* Left Facet */}
              <polygon
                points="16,32 50,52 50,92 16,72"
                fill="url(#prismBottom)"
                filter="url(#foldShadow)"
                className="opacity-85"
              />

              {/* Inner geometric negative-space inverted delta */}
              <polygon
                points="50,32 68,64 32,64"
                fill="#0f0f12"
                className="opacity-95"
              />
              {/* Glowing nucleus inside prism */}
              <circle cx="50" cy="54" r="4.5" fill="#ffffff" filter="url(#singularityGlow)" />
            </g>
          )}

          {/* ============================================================== */}
          {/* VARIANT 3: Continuous Infinity Möbius Ribbon                   */}
          {/* Fluid mathematical infinity loop with dual-tone shading        */}
          {/* ============================================================== */}
          {variant === 'mobius' && (
            <g className="origin-center">
              <path
                d="M 32 32
                   C 18 32, 12 40, 12 50
                   C 12 60, 18 68, 32 68
                   C 46 68, 54 50, 68 32
                   C 82 32, 88 40, 88 50
                   C 88 60, 82 68, 68 68
                   C 54 68, 46 50, 32 32 Z"
                stroke="url(#bladeGradA)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#foldShadow)"
              />
              <path
                d="M 68 68 C 54 68, 46 50, 32 32"
                stroke="url(#bladeGradB)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="50" r="5" fill="#ffffff" filter="url(#singularityGlow)" />
            </g>
          )}

          {/* ============================================================== */}
          {/* VARIANT 4: Sacred Geometry Neural Iris                         */}
          {/* 8-point radial intelligence aperture                           */}
          {/* ============================================================== */}
          {variant === 'iris' && (
            <g className="origin-center">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <ellipse
                  key={deg}
                  cx="50"
                  cy="30"
                  rx="11"
                  ry="22"
                  fill={i % 2 === 0 ? 'url(#bladeGradA)' : 'url(#bladeGradB)'}
                  className="opacity-70"
                  transform={`rotate(${deg} 50 50)`}
                  filter="url(#foldShadow)"
                />
              ))}
              <circle cx="50" cy="50" r="7" fill="#ffffff" filter="url(#singularityGlow)" />
              <circle cx="50" cy="50" r="3.5" fill="#8b5cf6" />
            </g>
          )}
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`text-zinc-900 dark:text-zinc-100 font-display tracking-tight font-extrabold ${textMap[size]}`}>
            Aether<span className="text-violet-500 font-black ml-0.5">AI</span>
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-xs">
            4.0
          </span>
        </div>
      )}
    </div>
  );
};
