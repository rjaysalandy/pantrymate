import React from 'react';

const PROFESSIONAL_RESOURCES = [
  {
    title: 'CARPHA Diabetes Nutritional Management Toolkit',
    source: 'CARPHA',
    description: 'Full regional toolkit for managing diabetes in primary care — includes clinical guidelines, counselling tools, and printable patient materials.',
    url: 'https://carpha.org/What-We-Do/NCD/Integrated-Disease-Management/Diabetes-Nutritional-Management-Toolkit',
    accent: '#2070d0',
    tag: 'Diabetes',
  },
  {
    title: 'Nutritional Management for Persons with Diabetes — Healthcare Guide',
    source: 'CARPHA',
    description: 'Professionals-only companion guide covering assessment, counselling strategy, and nutritional intervention for persons with diabetes.',
    url: 'https://tinyurl.com/3t7ak3aw',
    accent: '#2070d0',
    tag: 'Diabetes',
  },
  {
    title: 'PAHO Caribbean Meal Planning Guide',
    source: 'PAHO / CFNI',
    description: 'Comprehensive regional guide to meal planning for healthy eating, grounded in the Caribbean 6 Food Groups framework.',
    url: 'https://iris.paho.org/bitstreams/a3d9e1fe-1507-4be1-a1e8-f2c74d605a9a/download',
    accent: '#20b040',
    tag: 'General',
  },
  {
    title: 'My Caribbean Plate (Poster)',
    source: 'CARPHA',
    description: 'Printable patient-facing poster illustrating the Caribbean plate model — useful for visual counselling sessions.',
    url: 'https://tinyurl.com/yc62ezbd',
    accent: '#20b040',
    tag: 'Patient Material',
  },
];

function ResourceRow({ title, source, description, url, accent, tag }) {
  return (
    <div style={styles.row}>
      <div style={{ ...styles.rowBar, backgroundColor: accent }} />
      <div style={styles.rowBody}>
        <div style={styles.rowMeta}>
          <span style={{ ...styles.tag, backgroundColor: accent + '18', color: accent }}>{tag}</span>
          <span style={styles.source}>{source}</span>
        </div>
        <p style={styles.rowTitle}>{title}</p>
        <p style={styles.rowDesc}>{description}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.link, color: accent }}
        >
          Open resource →
        </a>
      </div>
    </div>
  );
}

export default function DietitianResourcePanel() {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <p style={styles.panelTitle}>Professional Resources</p>
        <p style={styles.panelSubtitle}>Caribbean dietary guidelines for clinical reference</p>
      </div>

      <div style={styles.list}>
        {PROFESSIONAL_RESOURCES.map((r) => (
          <ResourceRow key={r.url} {...r} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #ececec',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
  },
  panelHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  panelTitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  panelSubtitle: {
    margin: '2px 0 0',
    fontSize: '11px',
    color: '#aaa',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    divideY: '1px solid #f0f0f0',
  },
  row: {
    display: 'flex',
    borderBottom: '1px solid #f5f5f5',
  },
  rowBar: {
    width: '4px',
    flexShrink: 0,
  },
  rowBody: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  rowMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tag: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  source: {
    fontSize: '10px',
    color: '#bbb',
  },
  rowTitle: {
    margin: 0,
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: '1.3',
  },
  rowDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#777',
    lineHeight: '1.5',
  },
  link: {
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    marginTop: '4px',
  },
};