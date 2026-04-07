import React from 'react';

const ORANGE = '#F97316';
const GREEN  = '#22C55E';
const BLUE   = '#3B82F6';

export function LeafIcon({ size = 48 }) {
  const s = size / 120;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* Leaf 1 — top, green, tip pointing up */}
      <g transform="rotate(-90, 60, 60)">
        {/* Leaf body: horizontal, tip right, base left */}
        <path d="M 100,60 C 100,46 88,36 76,36 C 64,36 54,44 52,56 C 54,68 64,76 76,76 C 88,76 100,74 100,60 Z"
              fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Midrib */}
        <line x1="100" y1="60" x2="52" y2="60" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Veins */}
        <path d="M 88,60 Q 84,50 78,46" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 78,60 Q 74,70 68,73" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        <path d="M 68,60 Q 64,51 60,48" fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round"/>
        {/* Stalk — curves from base (52,60) around the ring to connect to next leaf */}
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

export function LogoWordmarkStacked({ size = 'lg' }) {
  const iconSize = size === 'lg' ? 80 : 48;
  const lineSize = size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <div className="flex flex-col items-center gap-3">
      <LeafIcon size={iconSize} />
      <div className="text-center">
        <div className={`${lineSize} font-bold leading-tight`}>
          <span style={{ color: ORANGE }}>Waste</span><span style={{ color: GREEN }}>Less</span>
        </div>
        <div className="border-t-2 my-1" style={{ borderColor: BLUE }} />
        <div className={`${lineSize} font-bold leading-tight`}>
          <span style={{ color: ORANGE }}>Pantry</span><span style={{ color: GREEN }}>Mate</span>
        </div>
      </div>
    </div>
  );
}

export function FaviconSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <g transform="rotate(-90, 16, 16)">
        <path d="M 27,16 C 27,12 24,9 20,9 C 16,9 13,12 12,15 C 13,19 16,22 20,22 C 24,22 27,20 27,16 Z"
              fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="27" y1="16" x2="12" y2="16" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M 12,16 C 9,16 7,19 6,21" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round"/>
      </g>
      <g transform="rotate(30, 16, 16)">
        <path d="M 27,16 C 27,12 24,9 20,9 C 16,9 13,12 12,15 C 13,19 16,22 20,22 C 24,22 27,20 27,16 Z"
              fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="27" y1="16" x2="12" y2="16" stroke={ORANGE} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M 12,16 C 9,16 7,19 6,21" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
      </g>
      <g transform="rotate(150, 16, 16)">
        <path d="M 27,16 C 27,12 24,9 20,9 C 16,9 13,12 12,15 C 13,19 16,22 20,22 C 24,22 27,20 27,16 Z"
              fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="27" y1="16" x2="12" y2="16" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M 12,16 C 9,16 7,19 6,21" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round"/>
      </g>
    </svg>
  );
}