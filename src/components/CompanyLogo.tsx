import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = 'h-9 sm:h-10 w-auto',
  size,
}) => {
  const heightClass = size
    ? size === 'sm'
      ? 'h-7'
      : size === 'md'
      ? 'h-9'
      : size === 'lg'
      ? 'h-11'
      : 'h-14'
    : '';

  return (
    <div className="inline-flex items-center shrink-0 select-none" title="Air Bersih Jakarta">
      <svg
        viewBox="0 0 1000 560"
        className={`${heightClass} ${className} object-contain transition-transform duration-150 hover:scale-102`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="abjPrimaryBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0054a6" />
            <stop offset="100%" stopColor="#004690" />
          </linearGradient>

          <linearGradient id="abjCyanWaveGrad" x1="0%" y1="70%" x2="100%" y2="10%">
            <stop offset="0%" stopColor="#1eb5e8" />
            <stop offset="60%" stopColor="#00aded" />
            <stop offset="100%" stopColor="#42cbf7" />
          </linearGradient>
        </defs>

        <g id="abj-logo-graphics">
          {/* Letter 'A' */}
          <path
            d="M 326 50 L 388 50 L 500 410 L 440 410 L 402 290 L 298 290 L 260 410 L 198 410 Z M 350 128 L 316 235 L 384 235 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />
          <path
            d="M 128 410 L 196 410 L 265 285 L 202 285 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />

          {/* Letter 'B' */}
          <path
            d="M 446 50 L 512 50 L 512 410 L 446 410 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />
          <path
            d="M 508 50 L 606 50 C 662 50 698 76 698 122 C 698 164 664 192 608 196 L 508 196 Z M 512 96 L 596 96 C 632 96 648 108 648 122 C 648 136 632 148 596 148 L 512 148 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />
          <path
            d="M 508 190 L 620 190 C 682 190 726 226 726 294 C 726 366 674 410 600 410 L 508 410 Z M 512 242 L 602 242 C 644 242 666 262 666 296 C 666 332 640 358 596 358 L 512 358 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />

          {/* Letter 'J' */}
          <path
            d="M 806 50 L 868 50 L 868 285 C 868 368 824 410 746 410 C 686 410 644 380 636 336 L 696 336 C 702 352 718 364 746 364 C 782 364 806 340 806 288 Z"
            fill="url(#abjPrimaryBlueGrad)"
          />

          {/* Cyan Water Ribbon Wave */}
          <path
            d="M 128 410 C 150 362, 194 314, 270 286 C 346 258, 416 252, 502 240 C 588 228, 654 196, 696 144 C 708 128, 714 112, 716 94 C 712 122, 688 162, 652 194 C 596 240, 516 254, 430 266 C 344 276, 276 292, 214 340 C 170 372, 144 396, 128 410 Z"
            fill="url(#abjCyanWaveGrad)"
          />
          <path
            d="M 716 94 C 714 80, 706 66, 694 56 C 706 68, 716 88, 716 108 C 716 122, 706 140, 694 154 C 706 134, 716 114, 716 94 Z"
            fill="#42cbf7"
          />
        </g>

        {/* Title Text: Air Bersih Jakarta */}
        <text
          x="500"
          y="502"
          textAnchor="middle"
          fill="#1fb2e8"
          fontSize="70"
          fontWeight="600"
          fontFamily="'Century Gothic', 'Quicksand', 'Nunito', 'Segoe UI', system-ui, sans-serif"
          letterSpacing="2"
        >
          Air Bersih Jakarta
        </text>
      </svg>
    </div>
  );
};

export default CompanyLogo;
