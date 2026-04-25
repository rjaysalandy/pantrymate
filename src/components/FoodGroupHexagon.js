import React, { useEffect, useState } from 'react';

const GROUPS = [
  { key: 'Staples',            color: '#e8a428', label: 'Staples'       },
  { key: 'Legumes & Nuts',     color: '#8b6914', label: 'Legumes\n& Nuts' },
  { key: 'Foods from Animals', color: '#d04848', label: 'Animal\nFoods'  },
  { key: 'Fruits',             color: '#f07010', label: 'Fruits'         },
  { key: 'Vegetables',         color: '#20b040', label: 'Vegetables'     },
  { key: 'Fats & Oils',        color: '#f0c830', label: 'Fats\n& Oils'   },
];

const MISSING_COLOR = '#d4d4d4';
const R = 100;

function hexVertex(i) {
  const angle = (Math.PI / 180) * (90 + i * 60);
  return { x: R * Math.cos(angle), y: -R * Math.sin(angle) };
}

function segmentPath(i) {
  const a = hexVertex(i);
  const b = hexVertex((i + 1) % 6);
  return `M 0 0 L ${a.x} ${a.y} L ${b.x} ${b.y} Z`;
}

function labelPos(i) {
  const a = hexVertex(i);
  const b = hexVertex((i + 1) % 6);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return { x: mx * 0.62, y: my * 0.62 };
}

export default function FoodGroupHexagon({ coverage = {}, totalGroups = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const showAlert = totalGroups < 3;

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Food Group Coverage</p>

      <div style={{ ...styles.hexWrapper, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <svg
          viewBox="-130 -130 260 260"
          width="220"
          height="220"
          aria-label="Food group coverage hexagon"
        >
          {GROUPS.map((g, i) => {
            const present = coverage[g.key] === 1;
            const pos = labelPos(i);
            const lines = g.label.split('\n');
            return (
              <g key={g.key}>
                <path
                  d={segmentPath(i)}
                  fill={present ? g.color : MISSING_COLOR}
                  stroke="#fff"
                  strokeWidth="3"
                  style={{ transition: 'fill 0.4s ease' }}
                />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={pos.x}
                    y={pos.y + (li - (lines.length - 1) / 2) * 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={present ? '#fff' : '#999'}
                    fontSize="8.5"
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="600"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Centre circle */}
          <circle cx="0" cy="0" r="28" fill="#fff" stroke="#e8e8e8" strokeWidth="2" />
          <text
            x="0" y="-5"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#1a1a1a"
            fontFamily="'DM Sans', sans-serif"
          >
            {totalGroups}/6
          </text>
          <text
            x="0" y="10"
            textAnchor="middle"
            fontSize="7"
            fill="#888"
            fontFamily="'DM Sans', sans-serif"
          >
            groups
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {GROUPS.map((g) => {
          const present = coverage[g.key] === 1;
          return (
            <div key={g.key} style={styles.legendItem}>
              <span
                style={{
                  ...styles.legendDot,
                  backgroundColor: present ? g.color : MISSING_COLOR,
                }}
              />
              <span style={{ ...styles.legendLabel, color: present ? '#1a1a1a' : '#aaa' }}>
                {g.key}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert */}
      {showAlert && (
        <div style={styles.alert}>
          <span style={styles.alertIcon}>!</span>
          <span style={styles.alertText}>
            Your pantry covers {totalGroups} of 6 food groups. Add more variety for a balanced diet.
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    gap: '12px',
    width: '100%',
    maxWidth: '280px',
  },
  heading: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: "'DM Sans', sans-serif",
  },
  hexWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  legend: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
    width: '100%',
    padding: '0 4px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
  },
  alert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: '#fff8f0',
    border: '1px solid #f07010',
    borderRadius: '8px',
    padding: '10px 12px',
    width: '100%',
    boxSizing: 'border-box',
  },
  alertIcon: {
    backgroundColor: '#f07010',
    color: '#fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    flexShrink: 0,
    lineHeight: '16px',
    textAlign: 'center',
  },
  alertText: {
    fontSize: '11px',
    color: '#b85000',
    lineHeight: '1.5',
    fontFamily: "'DM Sans', sans-serif",
  },
};