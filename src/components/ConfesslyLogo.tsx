import React from 'react';

interface ConfesslyLogoProps {
  showWordmark?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  darkText?: boolean;
}

export default function ConfesslyLogo({
  showWordmark = true,
  size = 'md',
  darkText = true,
}: ConfesslyLogoProps) {
  // Size classes for the icon
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  // Text sizes for the wordmark
  const textSizes = {
    xs: 'text-sm tracking-tight',
    sm: 'text-lg tracking-tight',
    md: 'text-2xl tracking-tight',
    lg: 'text-3xl tracking-tight',
    xl: 'text-5xl tracking-tight',
  };

  return (
    <div className="flex items-center gap-2.5 select-none select-none">
      {/* Icon SVG with Heart Cutout and Gradient Speech Bubble */}
      <svg
        viewBox="0 0 200 200"
        className={`${iconSizes[size]} shrink-0 drop-shadow-[0_4px_12px_rgba(244,63,94,0.15)]`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fa4cd4" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <mask id="heartCutout">
            {/* White parts are drawn, black parts are cut out */}
            <rect x="0" y="0" width="200" height="200" fill="#ffffff" />
            <path
              d="M100 128 C94 122 58 93 58 71 C58 56 68 45 82 45 C91 45 97 50 100 55 C103 50 109 45 118 45 C132 45 142 56 142 71 C142 93 106 122 100 128 Z"
              fill="#000000"
            />
          </mask>
        </defs>

        {/* Circular speech bubble with tail in bottom-left */}
        <path
          d="M100 20 C144.18 20 180 55.82 180 100 C180 144.18 144.18 180 100 180 C83.65 180 68.42 175.1 55.65 166.7 L31.83 181.6 C27.27 184.4 21.46 180.1 23.06 174.9 L32.06 145.6 C21.68 132.8 15.4 116.5 15.4 98.8 C15.4 54.62 51.22 20 100 20 Z"
          fill="url(#logoGrad)"
          mask="url(#heartCutout)"
        />
      </svg>

      {/* Wordmark: "confessly" */}
      {showWordmark && (
        <span
          className={`font-sans font-black tracking-tight ${textSizes[size]} leading-none`}
        >
          <span className={darkText ? 'text-slate-900' : 'text-white'}>
            confess
          </span>
          <span className="bg-gradient-to-r from-[#fa4cd4] to-[#8b5cf6] bg-clip-text text-transparent">
            ly
          </span>
        </span>
      )}
    </div>
  );
}
