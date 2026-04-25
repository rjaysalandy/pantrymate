import React, { useState, useCallback } from 'react';

function scaleQty(quantity, baseServings, targetServings) {
  if (!quantity || !baseServings) return quantity;
  return parseFloat((parseFloat(quantity) / baseServings * targetServings).toFixed(2));
}

export default function PortionScaler({ recipe, ingredients = [] }) {
  const base = recipe?.base_servings || 2;
  const [servings, setServings] = useState(base);

  const decrement = useCallback(() => setServings(s => Math.max(1, s - 1)), []);
  const increment = useCallback(() => setServings(s => Math.min(12, s + 1)), []);

  const scaledIngredients = ingredients.map(ing => ({
    ...ing,
    scaledQty: scaleQty(ing.quantity, base, servings),
  }));

  const hasMacros  = recipe?.protein_per_serving || recipe?.carbs_per_serving || recipe?.fat_per_serving;
  const macroScale = base > 0 ? servings / base : 1;

  return (
    <div style={S.wrapper}>

      {/* Portion row: Single | 2 | [−] | + */}
      <div style={S.portionRow}>
        <span style={S.portionLabel}>Portions</span>
        <div style={S.controls}>
          <button onClick={() => setServings(1)}
            style={{ ...S.pill, ...(servings === 1 ? S.pillActive : {}) }}>
            Single
          </button>
          <button onClick={() => setServings(servings <= 2 ? 2 : servings)}
            style={{ ...S.pill, ...(servings >= 2 ? S.pillActive : {}) }}>
            {servings > 2 ? servings : '2'}
          </button>
          {servings > 2 && (
            <button onClick={decrement} style={S.iconBtn}>−</button>
          )}
          <button onClick={increment} style={S.iconBtn}>+</button>
        </div>
      </div>

      {/* Macros */}
      {hasMacros && (
        <div style={S.macros}>
          {recipe.calories && <Chip label="Cal" value={Math.round(recipe.calories / base * servings)} unit="kcal" color="#f07010" />}
          {recipe.protein_per_serving && <Chip label="Protein" value={+(recipe.protein_per_serving * macroScale).toFixed(1)} unit="g" color="#2070d0" />}
          {recipe.carbs_per_serving   && <Chip label="Carbs"   value={+(recipe.carbs_per_serving   * macroScale).toFixed(1)} unit="g" color="#20b040" />}
          {recipe.fat_per_serving     && <Chip label="Fat"     value={+(recipe.fat_per_serving     * macroScale).toFixed(1)} unit="g" color="#e8a428" />}
        </div>
      )}

      {/* Ingredient list */}
      <div style={S.list}>
        <p style={S.listHeading}>Ingredients</p>
        {scaledIngredients.map((ing, i) => (
          <div key={i} style={S.row}>
            <span style={S.ingName}>{ing.ingredient_name}</span>
            <span style={S.ingQty}>
              {ing.scaledQty ? `${ing.scaledQty}${ing.unit ? ' ' + ing.unit : ''}` : '—'}
              {ing.is_staple ? <span style={S.staple}>staple</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ label, value, unit, color }) {
  return (
    <div style={{ ...S.chip, borderColor: color + '40' }}>
      <span style={{ ...S.chipVal, color }}>{value}</span>
      <span style={S.chipUnit}>{unit}</span>
      <span style={S.chipLabel}>{label}</span>
    </div>
  );
}

const S = {
  wrapper:      { backgroundColor:'#fff', borderRadius:'14px', padding:'14px', display:'flex', flexDirection:'column', gap:'12px', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 2px 10px rgba(0,0,0,0.07)', width:'100%' },
  portionRow:   { display:'flex', alignItems:'center', justifyContent:'space-between' },
  portionLabel: { fontSize:'12px', fontWeight:'700', color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.04em' },
  controls:     { display:'flex', alignItems:'center', gap:'6px' },
  pill:         { padding:'6px 14px', borderRadius:'20px', border:'1.5px solid #e0e0e0', background:'#fff', fontSize:'12px', fontWeight:'600', color:'#777', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  pillActive:   { backgroundColor:'#20b040', borderColor:'#20b040', color:'#fff' },
  iconBtn:      { width:'30px', height:'30px', borderRadius:'50%', border:'1.5px solid #e0e0e0', background:'#f8f8f8', fontSize:'16px', color:'#1a1a1a', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  macros:       { display:'flex', gap:'6px', flexWrap:'wrap' },
  chip:         { flex:1, minWidth:'58px', display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 8px', borderRadius:'10px', border:'1.5px solid', gap:'1px' },
  chipVal:      { fontSize:'14px', fontWeight:'700', lineHeight:1 },
  chipUnit:     { fontSize:'9px', color:'#aaa' },
  chipLabel:    { fontSize:'9px', color:'#888', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.04em' },
  list:         { display:'flex', flexDirection:'column', borderTop:'1px solid #f0f0f0', paddingTop:'10px' },
  listHeading:  { margin:'0 0 6px', fontSize:'11px', fontWeight:'700', color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.04em' },
  row:          { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #f8f8f8' },
  ingName:      { fontSize:'13px', color:'#333' },
  ingQty:       { fontSize:'13px', fontWeight:'600', color:'#1a1a1a', display:'flex', alignItems:'center', gap:'5px' },
  staple:       { fontSize:'9px', backgroundColor:'#f0f0f0', color:'#888', padding:'2px 5px', borderRadius:'4px', fontWeight:'600', textTransform:'uppercase' },
};