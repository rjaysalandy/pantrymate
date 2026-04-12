import React from 'react';
import fullLogo from './logo-horizontal-exact.svg';
import leafIcon from './logo-icon-exact-fixed-3.svg';

const ORANGE = '#F97316';
const GREEN  = '#22C55E';
const BLUE   = '#3B82F6';

export function LeafIcon({ size = 48 }) {
  return <img src={leafIcon} alt="PantryMate" width={size} height={size} style={{ objectFit: 'contain' }} />;
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