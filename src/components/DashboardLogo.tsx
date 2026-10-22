import React from 'react';

interface DashboardLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export const DashboardLogo: React.FC<DashboardLogoProps> = ({
  className = '',
  size = 'lg',
  showText = true,
  animated = true,
}) => {
  const getIconDimensions = () => {
    switch (size) {
      case 'sm':
        return { w: 40, h: 40, outerRadius: 18 };
      case 'md':
        return { w: 64, h: 64, outerRadius: 30 };
      case 'lg':
        return { w: 100, h: 100, outerRadius: 46 };
      case 'xl':
        return { w: 140, h: 140, outerRadius: 65 };
      default:
        return { w: 80, h: 80, outerRadius: 38 };
    }
  };

  const { w, h } = getIconDimensions();

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Animated Vector Icon */}
      <div
        className={`relative flex items-center justify-center ${
          animated ? 'animate-float-gentle' : ''
        }`}
        style={{ width: w, height: h }}
      >
        {/* Ambient Glowing Halo with PT Air Bersih Jakarta Blue & Sunny Golden Yellow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#0054a6]/35 via-[#00a3e0]/40 to-amber-400/30 blur-xl ${
            animated ? 'animate-logo-glow' : ''
          }`}
        />

        {/* Outer Circular Verification Orbit Ring (Spinning Slow Clockwise) */}
        <svg
          viewBox="0 0 160 160"
          className={`absolute inset-0 w-full h-full ${
            animated ? 'animate-spin-slow' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dashed Verification Radar Orbit */}
          <circle
            cx="80"
            cy="80"
            r="72"
            stroke="url(#orbitGradient1)"
            strokeWidth="2.5"
            strokeDasharray="6 8 16 8"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Orbiting Satellite Data Nodes with Golden Sun & Sky Cyan Sparks */}
          <circle cx="80" cy="8" r="5" fill="#facc15" className="drop-shadow-[0_0_10px_#facc15]" />
          <circle cx="152" cy="80" r="3.5" fill="#38bdf8" />
          <circle cx="80" cy="152" r="4" fill="#0054a6" />
          <circle cx="8" cy="80" r="4" fill="#fbbf24" className="drop-shadow-[0_0_6px_#fbbf24]" />

          <defs>
            <linearGradient id="orbitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00a3e0" />
              <stop offset="45%" stopColor="#0054a6" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
        </svg>

        {/* Middle Cyclical Arrows Ring (Spinning Counter-Clockwise) */}
        <svg
          viewBox="0 0 160 160"
          className={`absolute inset-0 w-full h-full ${
            animated ? 'animate-spin-reverse-slow' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cyclical verification arcs with directional markers */}
          <path
            d="M 80 20 A 60 60 0 0 1 140 80"
            stroke="url(#arcGradientA)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 80 140 A 60 60 0 0 1 20 80"
            stroke="url(#arcGradientB)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Mini directional chevron arrows on arcs */}
          <polygon points="140,78 144,85 136,85" fill="#38bdf8" />
          <polygon points="20,82 16,75 24,75" fill="#00a3e0" />

          <defs>
            <linearGradient id="arcGradientA" x1="80" y1="20" x2="140" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#0054a6" />
            </linearGradient>
            <linearGradient id="arcGradientB" x1="80" y1="140" x2="20" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0054a6" />
              <stop offset="100%" stopColor="#00a3e0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Central Core: High-Tech Water Droplet & Verification Shield */}
        <svg
          viewBox="0 0 160 160"
          className="relative z-10 w-[72%] h-[72%] drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield Border */}
          <path
            d="M80 18 C92 38 126 70 126 100 C126 125.4 105.4 146 80 146 C54.6 146 34 125.4 34 100 C34 70 68 38 80 18 Z"
            fill="url(#dropletCoreFill)"
            stroke="url(#dropletCoreStroke)"
            strokeWidth="3.5"
          />

          {/* Internal Fluid Water Wave 1 */}
          <path
            d="M38 104 C52 98 62 110 80 102 C98 94 110 106 122 100 C124 105 125 110 125 114 C123 133 104 144 80 144 C56 144 37 133 35 114 C35 110 36 107 38 104 Z"
            fill="url(#waveGradient1)"
            opacity="0.85"
          />

          {/* Internal Fluid Water Wave 2 */}
          <path
            d="M44 116 C58 112 68 120 80 115 C92 110 102 118 116 113 C114 128 98 141 80 141 C62 141 46 128 44 116 Z"
            fill="url(#waveGradient2)"
            opacity="0.9"
          />

          {/* Droplet Specular Reflection / Highlight */}
          <path
            d="M52 58 C62 42 72 32 78 26 C75 35 68 52 64 68 C62 76 60 84 62 90 C56 86 52 74 52 58 Z"
            fill="white"
            opacity="0.35"
          />

          {/* Verification Shield Centerpiece with Golden Border Accent */}
          <g transform="translate(0, -2)">
            {/* Shield polygon */}
            <path
              d="M80 62 L98 70 V88 C98 102 89 113 80 118 C71 113 62 102 62 88 V70 L80 62 Z"
              fill="#002b5b"
              stroke="#fbbf24"
              strokeWidth="2.5"
              className="drop-shadow-md"
            />
            {/* Bold Verification Checkmark */}
            <path
              d="M71 88 L77 94 L89 79"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </g>

          <defs>
            {/* Droplet Core Gradient */}
            <linearGradient id="dropletCoreFill" x1="80" y1="18" x2="80" y2="146" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#009ee2" />
              <stop offset="45%" stopColor="#0054a6" />
              <stop offset="100%" stopColor="#002244" />
            </linearGradient>

            <linearGradient id="dropletCoreStroke" x1="34" y1="18" x2="126" y2="146" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#00a3e0" />
              <stop offset="100%" stopColor="#003b73" />
            </linearGradient>

            <linearGradient id="waveGradient1" x1="35" y1="100" x2="125" y2="144" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>

            <linearGradient id="waveGradient2" x1="44" y1="113" x2="116" y2="141" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Branding (Optional) */}
      {showText && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white uppercase font-sans">
              PRIMA
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-sky-100 text-[#0054a6] border border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800">
              VERIFIED
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            <span>Project Records, Intelligence, Monitoring and Assurance</span>
          </div>
        </div>
      )}
    </div>
  );
};
