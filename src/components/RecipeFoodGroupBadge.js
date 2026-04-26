import React from 'react';

const GROUPS = [
  { key: 'Staples', color: '#e8a428' },
  { key: 'Legumes & Nuts', color: '#8b6914' },
  { key: 'Foods from Animals', color: '#d04848' },
  { key: 'Fruits', color: '#f07010' },
  { key: 'Vegetables', color: '#20b040' },
  { key: 'Fats & Oils', color: '#f0c830' },
];

const MISSING_COLOR = '#d4d4d4';

const KEYWORDS = [
  ['sweet potato','Staples'], ['brown rice','Staples'], ['white rice','Staples'], ['basmati rice','Staples'], ['rice','Staples'], ['flour','Staples'], ['bread','Staples'], ['oats','Staples'], ['cornmeal','Staples'], ['corn','Staples'], ['dasheen','Staples'], ['yam','Staples'], ['cassava','Staples'], ['potato','Staples'], ['provision','Staples'], ['pasta','Staples'], ['cereal','Staples'], ['roti','Staples'], ['hops','Staples'], ['noodle','Staples'], ['plantain','Staples'],
  ['split peas','Legumes & Nuts'], ['split pea','Legumes & Nuts'], ['black eyed peas','Legumes & Nuts'], ['black eye','Legumes & Nuts'], ['red beans','Legumes & Nuts'], ['kidney beans','Legumes & Nuts'], ['black beans','Legumes & Nuts'], ['navy beans','Legumes & Nuts'], ['lentil','Legumes & Nuts'], ['lentils','Legumes & Nuts'], ['bean','Legumes & Nuts'], ['beans','Legumes & Nuts'], ['pea','Legumes & Nuts'], ['peas','Legumes & Nuts'], ['channa','Legumes & Nuts'], ['chickpea','Legumes & Nuts'], ['chickpeas','Legumes & Nuts'], ['dhal','Legumes & Nuts'], ['dal','Legumes & Nuts'], ['peanut','Legumes & Nuts'], ['almond','Legumes & Nuts'], ['cashew','Legumes & Nuts'], ['walnut','Legumes & Nuts'], ['pecan','Legumes & Nuts'], ['nut','Legumes & Nuts'],
  ['chicken breast','Foods from Animals'], ['chicken','Foods from Animals'], ['beef','Foods from Animals'], ['pork','Foods from Animals'], ['fish','Foods from Animals'], ['salmon','Foods from Animals'], ['tuna','Foods from Animals'], ['shrimp','Foods from Animals'], ['egg','Foods from Animals'], ['eggs','Foods from Animals'], ['milk','Foods from Animals'], ['yogurt','Foods from Animals'], ['yoghurt','Foods from Animals'], ['cheese','Foods from Animals'], ['turkey','Foods from Animals'], ['lamb','Foods from Animals'], ['saltfish','Foods from Animals'],
  ['banana','Fruits'], ['mango','Fruits'], ['apple','Fruits'], ['orange','Fruits'], ['lime','Fruits'], ['lemon','Fruits'], ['avocado','Fruits'], ['berries','Fruits'], ['berry','Fruits'], ['pineapple','Fruits'], ['watermelon','Fruits'], ['papaya','Fruits'], ['fruit','Fruits'],
  ['green seasoning','Vegetables'], ['dasheen bush','Vegetables'], ['callaloo','Vegetables'], ['spinach','Vegetables'], ['okra','Vegetables'], ['pumpkin','Vegetables'], ['tomato','Vegetables'], ['tomatoes','Vegetables'], ['onion','Vegetables'], ['garlic','Vegetables'], ['carrot','Vegetables'], ['broccoli','Vegetables'], ['cabbage','Vegetables'], ['lettuce','Vegetables'], ['cucumber','Vegetables'], ['green bean','Vegetables'], ['pepper','Vegetables'], ['celery','Vegetables'], ['seasoning','Vegetables'], ['herb','Vegetables'], ['herbs','Vegetables'], ['curry powder','Vegetables'], ['turmeric','Vegetables'],
  ['olive oil','Fats & Oils'], ['canola oil','Fats & Oils'], ['coconut oil','Fats & Oils'], ['avocado oil','Fats & Oils'], ['oil','Fats & Oils'], ['butter','Fats & Oils'], ['margarine','Fats & Oils'], ['mayonnaise','Fats & Oils'],
];

function normaliseIngredients(ingredients) {
  if (!ingredients) return [];
  if (typeof ingredients === 'string') {
    const trimmed = ingredients.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) || typeof parsed === 'object') return normaliseIngredients(parsed);
    } catch (_) {}
    return trimmed.replace(/[\[\]{}"']/g, ' ').split(/[,;|\n]/).map(item => item.trim().toLowerCase()).filter(Boolean);
  }
  if (Array.isArray(ingredients)) {
    return ingredients.flatMap(item => {
      if (!item) return [];
      if (typeof item === 'string') return normaliseIngredients(item);
      return normaliseIngredients([item.ingredient_name, item.name, item.item_name, item.food_name, item.label, item.keyword].filter(Boolean).join(','));
    }).filter(Boolean);
  }
  if (typeof ingredients === 'object') return normaliseIngredients(Object.values(ingredients).filter(Boolean).join(','));
  return [];
}

function getCoverage(ingredients) {
  const coverage = {};
  normaliseIngredients(ingredients).forEach(ingredient => {
    KEYWORDS.forEach(([keyword, group]) => {
      if (ingredient.includes(keyword)) coverage[group] = 1;
    });
  });
  return coverage;
}

function hexPoint(cx, cy, r, angleDeg) {
  const angleRad = (Math.PI / 180) * angleDeg;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function segmentPath(index, cx, cy, r) {
  const startAngle = -90 + index * 60;
  const endAngle = startAngle + 60;
  const p1 = hexPoint(cx, cy, r, startAngle);
  const p2 = hexPoint(cx, cy, r, endAngle);
  return `M ${cx} ${cy} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`;
}

export default function RecipeFoodGroupBadge({ ingredients = [], size = 48 }) {
  const coverage = getCoverage(ingredients);
  const total = Object.keys(coverage).length;
  const cx = 50;
  const cy = 50;
  const r = 42;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`${total} food groups represented in recipe`}>
      {GROUPS.map((group, index) => (
        <path key={group.key} d={segmentPath(index, cx, cy, r)} fill={coverage[group.key] ? group.color : MISSING_COLOR} stroke="#ffffff" strokeWidth="3" />
      ))}
      <circle cx={cx} cy={cy} r="15" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1f2937">{total}</text>
    </svg>
  );
}
