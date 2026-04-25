import React from 'react';

// Food group colours — matches FoodGroupHexagon
const GROUPS = [
  { key: 'Staples',            color: '#e8a428' },
  { key: 'Legumes & Nuts',     color: '#8b6914' },
  { key: 'Foods from Animals', color: '#d04848' },
  { key: 'Fruits',             color: '#f07010' },
  { key: 'Vegetables',         color: '#20b040' },
  { key: 'Fats & Oils',        color: '#f0c830' },
];

const MISSING = '#d4d4d4';
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

// Lightweight keyword → food group lookup (client-side, mirrors backend)
const KEYWORD_MAP = [
  ['rice','Staples'],['pasta','Staples'],['bread','Staples'],['flour','Staples'],
  ['potato','Staples'],['yam','Staples'],['dasheen','Staples'],['cassava','Staples'],
  ['plantain','Staples'],['noodle','Staples'],['oats','Staples'],['cornmeal','Staples'],
  ['macaroni','Staples'],['spaghetti','Staples'],['roti','Staples'],['bake','Staples'],
  ['cereal','Staples'],['breadfruit','Staples'],['dumpling','Staples'],
  ['bean','Legumes & Nuts'],['pea','Legumes & Nuts'],['lentil','Legumes & Nuts'],
  ['channa','Legumes & Nuts'],['chickpea','Legumes & Nuts'],['dhal','Legumes & Nuts'],
  ['dal','Legumes & Nuts'],['tofu','Legumes & Nuts'],['pigeon','Legumes & Nuts'],
  ['peanut','Legumes & Nuts'],['almond','Legumes & Nuts'],['nut','Legumes & Nuts'],
  ['chicken','Foods from Animals'],['fish','Foods from Animals'],['beef','Foods from Animals'],
  ['pork','Foods from Animals'],['shrimp','Foods from Animals'],['prawn','Foods from Animals'],
  ['egg','Foods from Animals'],['tuna','Foods from Animals'],['salmon','Foods from Animals'],
  ['turkey','Foods from Animals'],['meat','Foods from Animals'],['crab','Foods from Animals'],
  ['lamb','Foods from Animals'],['sardine','Foods from Animals'],['carite','Foods from Animals'],
  ['milk','Foods from Animals'],['cheese','Foods from Animals'],['yogurt','Foods from Animals'],
  ['cream','Foods from Animals'],['butter','Foods from Animals'],
  ['apple','Fruits'],['banana','Fruits'],['mango','Fruits'],['orange','Fruits'],
  ['pineapple','Fruits'],['watermelon','Fruits'],['papaya','Fruits'],['pawpaw','Fruits'],
  ['guava','Fruits'],['lime','Fruits'],['lemon','Fruits'],['cherry','Fruits'],
  ['fruit','Fruits'],['soursop','Fruits'],['melon','Fruits'],['pomegranate','Fruits'],
  ['spinach','Vegetables'],['tomato','Vegetables'],['carrot','Vegetables'],
  ['broccoli','Vegetables'],['cabbage','Vegetables'],['lettuce','Vegetables'],
  ['cucumber','Vegetables'],['pepper','Vegetables'],['onion','Vegetables'],
  ['garlic','Vegetables'],['celery','Vegetables'],['ochro','Vegetables'],
  ['pumpkin','Vegetables'],['callaloo','Vegetables'],['bhagi','Vegetables'],
  ['bodi','Vegetables'],['mushroom','Vegetables'],['vegetable','Vegetables'],
  ['christophene','Vegetables'],['chadon','Vegetables'],['shadow','Vegetables'],
  ['oil','Fats & Oils'],['avocado','Fats & Oils'],['coconut','Fats & Oils'],
  ['margarine','Fats & Oils'],['ghee','Fats & Oils'],
];

function inferFoodGroup(ingredientName) {
  const lower = ingredientName.toLowerCase();
  for (const [kw, grp] of KEYWORD_MAP) {
    if (lower.includes(kw)) return grp;
  }
  return null;
}

// Derive present food groups from an ingredient list or name string
function getFoodGroupsFromIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) return new Set();
  const present = new Set();
  for (const ing of ingredients) {
    const name = ing.ingredient_name || ing.name || (typeof ing === 'string' ? ing : '');
    const group = inferFoodGroup(name);
    if (group) present.add(group);
  }
  return present;
}

// food_groups prop: array of group name strings (from API)
// OR ingredients prop: array of ingredient objects (for client-side inference)
export default function RecipeFoodGroupBadge({ food_groups, ingredients, size = 48 }) {
  let present;
  if (food_groups && food_groups.length > 0) {
    present = new Set(food_groups);
  } else {
    present = getFoodGroupsFromIngredients(ingredients || []);
  }

  const count = GROUPS.filter(g => present.has(g.key)).length;

  return (
    <div title={`${count}/6 food groups: ${[...present].join(', ') || 'none detected'}`}
      style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
      <svg viewBox="-110 -110 220 220" width={size} height={size}>
        {GROUPS.map((g, i) => (
          <path
            key={g.key}
            d={segmentPath(i)}
            fill={present.has(g.key) ? g.color : MISSING}
            stroke="#fff"
            strokeWidth="4"
          />
        ))}
        <circle cx="0" cy="0" r="30" fill="#fff" stroke="#e8e8e8" strokeWidth="2" />
        <text x="0" y="3" textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fontWeight="700" fill="#1a1a1a" fontFamily="'DM Sans',sans-serif">
          {count}
        </text>
      </svg>
    </div>
  );
}