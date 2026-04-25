import React, { useState, useCallback } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scaleQty(quantity, baseServings, targetServings) {
  if (!quantity || !baseServings) return quantity;
  const scaled = (parseFloat(quantity) / baseServings) * targetServings;
  // Round to 2dp, strip trailing zeros
  return parseFloat(scaled.toFixed(2));
}

function formatQty(value) {
  if (value === null || value === undefined) return '';
  if (Number.isInteger(value)) return String(value);
  return String(value);
}

// ─── PortionScaler ────────────────────────────────────────────────────────────
// Props:
//   recipe        — full recipe object from GET /api/recipes/:id
//   ingredients   — array of { ingredient_name, quantity, unit, is_staple }
//
// Usage:
//   <PortionScaler recipe={recipe} ingredients={recipe.ingredients} />
export default function PortionScaler({ recipe, ingredients = [] }) {
  const base = recipe?.base_servings || 2;
  const [servings, setServings] = useState(base);

  const decrement = useCallback(() => setServings(s => Math.max(1, s - 1)), []);
  const increment = useCallback(() => setServings(s => Math.min(12, s + 1)), []);

  const label =
    servings === 1 ? 'Single serving'
    : servings === 5 ? 'Family portion'
    : `${servings} servings`;

  const scaledIngredients = ingredients.map(ing => ({
    ...ing,
    scaledQty: scaleQty(ing.quantity, base, servings),
  }));

  // Macro scaling
  const hasMacros = recipe?.protein_per_serving || recipe?.carbs_per_serving || recipe?.fat_per_serving;
  const macroScale = base > 0 ? servings / base : 1;

  return (
    <div style={styles.wrapper}>

      {/* Portion control */}
      <div style={styles.portionRow}>
        <div style={styles.portionLabel}>
          <span style={styles.portionTitle}>Portions</span>
          <span style={styles.portionSub}>{label}</span>
        </div>

        <div style={styles.stepper}>
          <button
            onClick={decrement}
            style={{ ...styles.stepBtn, opacity: servings <= 1 ? 0.35 : 1 }}
            disabled={servings <= 1}
            aria-label="Decrease servings"
          >
            −
          </button>

          <div style={styles.stepCount}>
            <span style={styles.stepNum}>{servings}</span>
          </div>

          <button
            onClick={increment}
            style={{ ...styles.stepBtn, opacity: servings >= 12 ? 0.35 : 1 }}
            disabled={servings >= 12}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
      </div>

      {/* Quick-select anchors */}
      <div style={styles.anchors}>
        <button
          style={{ ...styles.anchor, ...(servings === 1 ? styles.anchorActive : {}) }}
          onClick={() => setServings(1)}
        >
          Single (1)
        </button>
        {[2, 3, 4].map(n => (
          <button
            key={n}
            style={{ ...styles.anchor, ...(servings === n ? styles.anchorActive : {}) }}
            onClick={() => setServings(n)}
          >
            {n}
          </button>
        ))}
        <button
          style={{ ...styles.anchor, ...(servings === 5 ? styles.anchorActive : {}) }}
          onClick={() => setServings(5)}
        >
          Family (5)
        </button>
      </div>

      {/* Macros (if available) */}
      {hasMacros && (
        <div style={styles.macros}>
          {recipe.calories && (
            <MacroChip
              label="Calories"
              value={Math.round((recipe.calories / base) * servings)}
              unit="kcal"
              color="#f07010"
            />
          )}
          {recipe.protein_per_serving && (
            <MacroChip
              label="Protein"
              value={parseFloat((recipe.protein_per_serving * macroScale).toFixed(1))}
              unit="g"
              color="#2070d0"
            />
          )}
          {recipe.carbs_per_serving && (
            <MacroChip
              label="Carbs"
              value={parseFloat((recipe.carbs_per_serving * macroScale).toFixed(1))}
              unit="g"
              color="#20b040"
            />
          )}
          {recipe.fat_per_serving && (
            <MacroChip
              label="Fat"
              value={parseFloat((recipe.fat_per_serving * macroScale).toFixed(1))}
              unit="g"
              color="#e8a428"
            />
          )}
        </div>
      )}

      {/* Ingredient list */}
      <div style={styles.ingredientList}>
        <p style={styles.ingredientHeading}>Ingredients</p>
        {scaledIngredients.map((ing, i) => (
          <div key={i} style={styles.ingredientRow}>
            <span style={styles.ingredientName}>{ing.ingredient_name}</span>
            <span style={styles.ingredientQty}>
              {ing.scaledQty ? `${formatQty(ing.scaledQty)}${ing.unit ? ' ' + ing.unit : ''}` : '—'}
              {ing.is_staple ? <span style={styles.stapleTag}>staple</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroChip({ label, value, unit, color }) {
  return (
    <div style={{ ...styles.macroChip, borderColor: color + '40' }}>
      <span style={{ ...styles.macroValue, color }}>{value}</span>
      <span style={styles.macroUnit}>{unit}</span>
      <span style={styles.macroLabel}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    maxWidth: '480px',
    width: '100%',
  },
  portionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portionLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  portionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  portionSub: {
    fontSize: '12px',
    color: '#888',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  stepBtn: {
    width: '38px',
    height: '38px',
    border: 'none',
    background: '#f8f8f8',
    fontSize: '18px',
    fontWeight: '400',
    color: '#1a1a1a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  stepCount: {
    width: '44px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '1.5px solid #e0e0e0',
    borderRight: '1.5px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  stepNum: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  anchors: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  anchor: {
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1.5px solid #e0e0e0',
    background: '#fff',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#777',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  anchorActive: {
    backgroundColor: '#20b040',
    borderColor: '#20b040',
    color: '#fff',
  },
  macros: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  macroChip: {
    flex: 1,
    minWidth: '70px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1.5px solid',
    gap: '1px',
  },
  macroValue: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: 1,
  },
  macroUnit: {
    fontSize: '10px',
    color: '#aaa',
  },
  macroLabel: {
    fontSize: '10px',
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  ingredientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '12px',
  },
  ingredientHeading: {
    margin: '0 0 8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  ingredientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 0',
    borderBottom: '1px solid #f8f8f8',
  },
  ingredientName: {
    fontSize: '13px',
    color: '#333',
  },
  ingredientQty: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stapleTag: {
    fontSize: '9px',
    backgroundColor: '#f0f0f0',
    color: '#888',
    padding: '2px 5px',
    borderRadius: '4px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
};