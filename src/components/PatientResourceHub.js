import React from 'react';

const PATIENT_RESOURCES = [
  {
    title: 'Building a Healthy Plate',
    source: 'Ministry of Health T&T',
    description: 'The official T&T government guide to balanced eating and portion sizes using local foods.',
    url: 'https://health.gov.tt/building-a-healthy-plate',
    accent: '#2070d0',
    tag: 'General',
  },
  {
    title: 'Caribbean 6 Food Groups',
    source: 'NCRHA · National Nutrition Week',
    description: 'A clear T&T summary of the six food groups and what foods belong in each one.',
    url: 'https://ncrha.co.tt/wp-content/uploads/2020/06/National-Nutrition-Awareness-Week-2020-6-Food-Groups.pdf',
    accent: '#20b040',
    tag: 'General',
  },
  {
    title: 'Nutrition Labels Made Simple',
    source: 'CARPHA',
    description: 'How to read and understand nutrition labels on packaged foods when you shop.',
    url: 'https://tinyurl.com/rj4yp3bx',
    accent: '#20b040',
    tag: 'General',
  },
  {
    title: 'Managing My Diabetes',
    source: 'CARPHA',
    description: 'A practical guide for persons living with diabetes on managing diet and daily lifestyle.',
    url: 'https://tinyurl.com/4njc9297',
    accent: '#f07010',
    tag: 'Diabetes',
  },
  {
    title: 'Healthy Eating with Diabetes',
    source: 'CARPHA',
    description: 'Caribbean-friendly tips and recipes designed specifically for persons with diabetes.',
    url: 'https://tinyurl.com/bdcpcyj8',
    accent: '#f07010',
    tag: 'Diabetes',
  },
];

function ResourceCard({ title, source, description, url, accent, tag }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardBar, backgroundColor: accent }} />
      <div style={styles.cardContent}>
        <div style={styles.cardMeta}>
          <span style={{ ...styles.tag, backgroundColor: accent + '18', color: accent }}>{tag}</span>
          <span style={styles.source}>{source}</span>
        </div>
        <p style={styles.cardTitle}>{title}</p>
        <p style={styles.cardDesc}>{description}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.link, color: accent, borderColor: accent }}
        >
          Open guide
        </a>
      </div>
    </div>
  );
}

export default function PatientResourceHub({ onBack }) {
  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
        )}
        <div>
          <p style={styles.pageTitle}>Health Resources</p>
          <p style={styles.pageSubtitle}>Official Caribbean &amp; T&T dietary guidelines</p>
        </div>
      </div>

      <div style={styles.list}>
        {PATIENT_RESOURCES.map((r) => (
          <ResourceCard key={r.url} {...r} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: '#f6f8fa',
    minHeight: '100vh',
  },
  pageHeader: {
    marginBottom: '20px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    color: '#2070d0',
    cursor: 'pointer',
    padding: '0 0 8px 0',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: '600',
  },
  pageTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  pageSubtitle: {
    margin: '2px 0 0',
    fontSize: '13px',
    color: '#888',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  cardBar: {
    width: '5px',
    flexShrink: 0,
  },
  cardContent: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tag: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '2px 7px',
    borderRadius: '4px',
  },
  source: {
    fontSize: '11px',
    color: '#999',
  },
  cardTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: '1.3',
  },
  cardDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.55',
  },
  link: {
    display: 'inline-block',
    marginTop: '6px',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    border: '1.5px solid',
    borderRadius: '7px',
    padding: '5px 12px',
    alignSelf: 'flex-start',
  },
};