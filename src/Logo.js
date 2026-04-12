import React from 'react';
import fullLogo from './logo-horizontal-exact.svg';

const ORANGE = '#F97316';
const GREEN  = '#22C55E';
const BLUE   = '#3B82F6';

export function LeafIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* Leaf 1 — top, green, tip pointing up */}
      <g transform="rotate(-90, 60, 60)">
        <path d="M 100,60 C 100,46 88,36 76,36 C 64,36 54,44 52,56 C 54,68 64,76 76,76 C 88,76 100,74 100,60 Z"
              fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="100" y1="60" x2="52" y2="60" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 88,60 Q 84,50 78,46" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 78,60 Q 74,70 68,73" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 68,60 Q 64,51 60,48" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 52,60 C 44,60 36,68 32,76" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Leaf 2 — bottom-right, orange, tip pointing lower-right */}
      <g transform="rotate(30, 60, 60)">
        <path d="M 100,60 C 100,46 88,36 76,36 C 64,36 54,44 52,56 C 54,68 64,76 76,76 C 88,76 100,74 100,60 Z"
              fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="100" y1="60" x2="52" y2="60" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 88,60 Q 84,50 78,46" fill="none" stroke={ORANGE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 78,60 Q 74,70 68,73" fill="none" stroke={ORANGE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 68,60 Q 64,51 60,48" fill="none" stroke={ORANGE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 52,60 C 44,60 36,68 32,76" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Leaf 3 — bottom-left, blue, tip pointing lower-left */}
      <g transform="rotate(150, 60, 60)">
        <path d="M 100,60 C 100,46 88,36 76,36 C 64,36 54,44 52,56 C 54,68 64,76 76,76 C 88,76 100,74 100,60 Z"
              fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="100" y1="60" x2="52" y2="60" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 88,60 Q 84,50 78,46" fill="none" stroke={BLUE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 78,60 Q 74,70 68,73" fill="none" stroke={BLUE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 68,60 Q 64,51 60,48" fill="none" stroke={BLUE} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 52,60 C 44,60 36,68 32,76" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"/>
      </g>

    </svg>
  );
}

export function LogoFull({ size = 'md' }) {
  const iconSize = size === 'lg' ? 72 : size === 'sm' ? 32 : 48;
  const titleSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';
  const subtitleSize = size === 'lg' ? 'text-sm' : 'hidden';

  return (
    <div className="flex items-center gap-3">
      <LeafIcon size={iconSize} />
      <div>
        <div className={`${titleSize} font-bold leading-tight`}>
          <span style={{ color: ORANGE }}>Waste</span><span style={{ color: GREEN }}>Less</span>
          {' '}
          <span style={{ color: ORANGE }}>Pantry</span><span style={{ color: GREEN }}>Mate</span>
        </div>
        {size === 'lg' && (
          <p className={`${subtitleSize} text-gray-400 mt-0.5`}>Smart food management for T&amp;T households</p>
        )}
      </div>
    </div>
  );
}

export function LogoWordmarkStacked() {
  return (
    <img src={fullLogo} alt="WasteLess PantryMate" className="h-16 w-auto" />
  );
}