import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { LogoFull } from './Logo';
import fullLogo from './logo-horizontal-exact.svg';

import PasswordSection from './components/PasswordSection';
import FoodGroupHexagon from './components/FoodGroupHexagon';
import PatientResourceHub from './components/PatientResourceHub';
import DietitianResourcePanel from './components/DietitianResourcePanel';
import PortionScaler from './components/PortionScaler';
import RecipeFoodGroupBadge from './components/RecipeFoodGroupBadge';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function expiryBadge(item) {
  const d = item?.days_left ?? null;
  if (d === null || d === undefined) return null;
  if (d < 0)   return { label: 'Expired',      color: 'bg-red-100 text-red-700' };
  if (d === 0) return { label: 'Expires today', color: 'bg-red-100 text-red-700' };
  if (d <= 2)  return { label: `${d}d left`,    color: 'bg-amber-100 text-amber-700' };
  if (d <= 5)  return { label: `${d}d left`,    color: 'bg-yellow-100 text-yellow-700' };
  return       { label: `${d}d left`,           color: 'bg-green-100 text-green-700' };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function mealTimeLabel() {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  if (h < 21) return 'dinner';
  return 'snack';
}

function token() { return localStorage.getItem('token'); }
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` };
}

function normaliseIngredientSource(source) {
  if (!source) return [];

  if (Array.isArray(source)) {
    return source.flatMap(item => {
      if (!item) return [];
      if (typeof item === 'string') return normaliseIngredientSource(item);
      return normaliseIngredientSource([
        item.ingredient_name,
        item.name,
        item.item_name,
        item.food_name,
        item.label,
        item.keyword,
      ].filter(Boolean).join(','));
    });
  }

  if (typeof source === 'object') {
    return normaliseIngredientSource(Object.values(source).filter(Boolean).join(','));
  }

  return String(source)
    .replace(/[\[\]{}"']/g, ' ')
    .split(/[,;|\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function recipeBadgeIngredients(recipe) {
  if (!recipe) return [];

  const sources = [
    recipe.ingredients,
    recipe.ingredients_text,
    recipe.recipe_ingredients,
    recipe.ingredient_names,
    recipe.required_ingredients,
    recipe.required_items,
    recipe.items,
    recipe.missingItems,
    recipe.missing_items,
    recipe.matchedItems,
    recipe.matched_items,
    recipe.availableItems,
    recipe.available_items,
    recipe.name,
  ];

  return sources.flatMap(normaliseIngredientSource).filter(Boolean);
}


function recipeMissingCount(recipe) {
  if (!recipe) return 999;
  if (Array.isArray(recipe.missingItems)) return recipe.missingItems.length;
  if (Array.isArray(recipe.missing_items)) return recipe.missing_items.length;
  if (typeof recipe.missing_count === 'number') return recipe.missing_count;
  return 999;
}


function AuthScreen({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [role, setRole]       = useState('user');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [pwValid, setPwValid] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const body = mode === 'login'
        ? { email, password: pass }
        : { name, email, password: pass, role };
      const res  = await fetch(`${API}/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      localStorage.setItem('token', data.token);
      onLogin(data);
    } catch (e) { setError('Cannot connect to server. Is the backend running?'); }
    finally { setLoading(false); }
  };
return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="flex justify-center mb-8">
          <img src={fullLogo} alt="WasteLess PantryMate" className="h-16 w-auto" />
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <div className="flex gap-3 mb-6">
            {[
              {
                val: 'user', label: 'Household', sub: 'Manage pantry & reduce waste',
                icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2L3 10v13h5v-7h10v7h5V10L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/></svg>
              },
              {
                val: 'dietician', label: 'Dietitian', sub: 'Manage patients & plans',
                icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="8" r="5" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 23c0-5.523 4.477-9 10-9s10 3.477 10 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/><line x1="20" y1="14" x2="20" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="17" y1="17.5" x2="23" y2="17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              }
            ].map(({ val, label, sub, icon }) => (
              <button key={val} onClick={() => setRole(val)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 transition-all text-center
                  ${role === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                <span className={role === val ? 'text-green-600' : 'text-gray-400'}>{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs leading-tight opacity-75">{sub}</span>
              </button>
            ))}
          </div>
        )}

        {mode === 'register' && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Your Name" />
          </div>
        )}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="you@example.com" />
        </div>
        {mode === 'login' ? (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="••••••••" />
          </div>
        ) : (
          <div className="mb-6">
            <PasswordSection onChange={(pwd, valid) => { setPass(pwd); setPwValid(valid); }} />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        <button onClick={submit} disabled={loading || (mode === 'register' && !pwValid)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : `Create ${role === 'dietician' ? 'Dietitian' : 'Household'} Account`}
        </button>
      </div>
    </div>
  );
}

// Demo patients
const DEMO_PATIENTS = [
  
  {
    userId: 'demo-1',
    name:   'Aaliyah Ramsaran',
    email:  'a.ramsaran@demo.wasteless.tt',
    isDemo: true,
    items: [
      { name: 'Dasheen',       days_left: 2,   quantity: 1.5, unit: 'kg'     },
      { name: 'Chicken',       days_left: 1,   quantity: 2,   unit: 'kg'     },
      { name: 'Full Cream Milk', days_left: 3, quantity: 1,   unit: 'litre'  },
      { name: 'Brown Rice',    days_left: 60,  quantity: 1,   unit: 'bag'    },
      { name: 'Lentils',       days_left: 90,  quantity: 500, unit: 'g'      },
      { name: 'Canola Oil',    days_left: 120, quantity: 1,   unit: 'bottle' },
      { name: 'Pepper Sauce',  days_left: 200, quantity: 1,   unit: 'bottle' },
    ],
    wasteLog: [
      { action: 'used',   item_name: 'Chicken',    date: '2026-04-08' },
      { action: 'used',   item_name: 'Dasheen',    date: '2026-04-07' },
      { action: 'wasted', item_name: 'Tomatoes',   date: '2026-04-06' },
      { action: 'used',   item_name: 'Lentils',    date: '2026-04-05' },
      { action: 'wasted', item_name: 'Bread',      date: '2026-04-04' },
      { action: 'used',   item_name: 'Brown Rice', date: '2026-04-03' },
    ],
    messages: [],
    currentGoal: 'Reduce refined carbohydrate intake. Target fasting glucose below 7.0 mmol/L. Aim for 3 balanced home-cooked meals per day.',
    profile: {
      dob: '1985-03-14', gender: 'Female', mrn: 'DM-00124',
      phone: '868-472-3301', address: 'Arima, Trinidad',
      referralReason: 'Newly diagnosed Type 2 Diabetes — glycaemic management and dietary education',
      anthropometrics: { height: '162 cm', weight: '84 kg', bmi: '32.0', goalWeight: '72 kg', weightHistory: 'Gained 6 kg over past 18 months' },
      biochemical: [
        { test: 'HbA1c',          result: '8.4%',          reference: '<7.0%',         flag: 'High' },
        { test: 'Fasting Glucose',result: '9.2 mmol/L',    reference: '3.9–5.5 mmol/L',flag: 'High' },
        { test: 'LDL Cholesterol',result: '3.1 mmol/L',    reference: '<2.6 mmol/L',   flag: 'High' },
        { test: 'HDL Cholesterol',result: '1.0 mmol/L',    reference: '>1.2 mmol/L',   flag: 'Low'  },
        { test: 'Triglycerides',  result: '2.4 mmol/L',    reference: '<1.7 mmol/L',   flag: 'High' },
        { test: 'eGFR',           result: '74 mL/min',     reference: '>60 mL/min',    flag: 'Normal'},
      ],
      diagnoses: ['Type 2 Diabetes Mellitus (diagnosed March 2026)'],
      medications: ['Metformin 500 mg twice daily'],
      allergies: 'NKDA',
      dietaryRecall: 'Breakfast: hops bread with butter and sweet tea. Lunch: rice, stew chicken, macaroni pie. Dinner: leftovers or fast food 3–4×/week. Snacks: biscuits, soft drinks.',
      lifestyle: { activity: 'Sedentary — desk job, no structured exercise', sleep: '6 hrs/night', stress: 'Moderate (work-related)', smoking: 'Non-smoker', alcohol: 'Occasional — 1–2 drinks/week' },
      foodSecurity: { budget: 'TTD $1,200/week', cookingAbility: 'Moderate — cooks 4–5×/week', access: 'Supermarket 10 min away' },
      nfpf: 'BMI 32.0 (obese class I). No visible muscle wasting. Mild central adiposity.',
      pes: 'Excessive carbohydrate intake (NI-5.8.2) related to low nutritional knowledge and frequent consumption of refined carbohydrates as evidenced by HbA1c 8.4% and fasting glucose 9.2 mmol/L.',
      prescription: 'Energy: 1,600–1,700 kcal/day. Carbohydrate: 45–50% total energy, emphasising low-GI sources. Protein: 1.0 g/kg body weight. Fat: <30% total energy, limit saturated fat. Increase dietary fibre to 25–30 g/day. Eliminate sugar-sweetened beverages. Education on carbohydrate counting and glycaemic index.',
      followUp: 'Review in 8 weeks. Monitor HbA1c and fasting glucose. Reassess diet recall and weight.',
      referrals: 'Referred to diabetes educator and physiotherapist for structured exercise plan.',
      consentDate: '2026-03-28', dietitianSignature: 'RD L. Balkaran', lastUpdated: '2026-04-10',
    },
  },
  
  {
    userId: 'demo-2',
    name:   'Marcus Phillip',
    email:  'm.phillip@demo.wasteless.tt',
    isDemo: true,
    items: [
      { name: 'Saltfish',     days_left: -1,  quantity: 200, unit: 'g'    },
      { name: 'Plantain',     days_left: 4,   quantity: 3,   unit: 'item' },
      { name: 'Coconut Milk', days_left: 180, quantity: 1,   unit: 'tin'  },
      { name: 'Sweet Potato', days_left: 10,  quantity: 1,   unit: 'kg'   },
      { name: 'Oats',         days_left: 90,  quantity: 1,   unit: 'pack' },
    ],
    wasteLog: [
      { action: 'wasted', item_name: 'Saltfish',    date: '2026-04-09' },
      { action: 'wasted', item_name: 'Lettuce',     date: '2026-04-07' },
      { action: 'used',   item_name: 'Plantain',    date: '2026-04-06' },
      { action: 'wasted', item_name: 'Tomatoes',    date: '2026-04-05' },
      { action: 'used',   item_name: 'Oats',        date: '2026-04-04' },
      { action: 'wasted', item_name: 'Sweet Potato',date: '2026-04-03' },
    ],
    messages: [],
    currentGoal: 'Adopt DASH dietary pattern. Reduce sodium to under 2,000 mg/day. Increase potassium-rich foods.',
    profile: {
      dob: '1972-09-02', gender: 'Male', mrn: 'HT-00287',
      phone: '868-623-7714', address: 'Chaguanas, Trinidad',
      referralReason: 'Stage 2 Hypertension — dietary sodium reduction and DASH diet counselling',
      anthropometrics: { height: '178 cm', weight: '97 kg', bmi: '30.6', goalWeight: '85 kg', weightHistory: 'Weight stable over 2 years; central obesity noted' },
      biochemical: [
        { test: 'Blood Pressure',  result: '158/98 mmHg',  reference: '<130/80 mmHg', flag: 'High'   },
        { test: 'Sodium',          result: '142 mmol/L',   reference: '136–145 mmol/L',flag: 'Normal' },
        { test: 'Potassium',       result: '3.4 mmol/L',   reference: '3.5–5.0 mmol/L',flag: 'Low'   },
        { test: 'Creatinine',      result: '98 µmol/L',    reference: '62–106 µmol/L', flag: 'Normal' },
        { test: 'Total Cholesterol',result: '5.8 mmol/L',  reference: '<5.2 mmol/L',  flag: 'High'   },
        { test: 'Fasting Glucose', result: '5.4 mmol/L',   reference: '3.9–5.5 mmol/L',flag: 'Normal'},
      ],
      diagnoses: ['Essential Hypertension Stage 2 (diagnosed 2021)'],
      medications: ['Amlodipine 10 mg once daily', 'Hydrochlorothiazide 25 mg once daily'],
      allergies: 'NKDA',
      dietaryRecall: 'Breakfast: saltfish buljol with hops bread. Lunch: pelau or macaroni pie with fried chicken. Dinner: doubles or take-out. High processed/salty food intake daily. Minimal fruit and vegetables.',
      lifestyle: { activity: 'Light — walks 20 min occasionally', sleep: '7 hrs/night', stress: 'High (financial pressures)', smoking: 'Ex-smoker (quit 2019)', alcohol: 'Moderate — 5–6 beers/week' },
      foodSecurity: { budget: 'TTD $900/week', cookingAbility: 'Basic — partner cooks most meals', access: 'Market and supermarket within 15 min' },
      nfpf: 'BMI 30.6 (obese class I). Central adiposity. No peripheral oedema. Skin turgor normal.',
      pes: 'Excessive sodium intake (NI-5.10.2) related to frequent consumption of processed and salted foods as evidenced by blood pressure 158/98 mmHg and reported dietary pattern.',
      prescription: 'Energy: 2,000–2,100 kcal/day. Sodium: ≤2,000 mg/day — eliminate added salt, avoid processed meats and saltfish >1×/week. DASH dietary pattern: increase fruits, vegetables, low-fat dairy, whole grains. Potassium target: 3,500–4,700 mg/day. Limit alcohol to ≤2 standard drinks/day.',
      followUp: 'Review in 6 weeks. Blood pressure monitoring at each visit. 24-hour dietary recall reassessment.',
      referrals: 'Co-managed with GP. Referred to physiotherapist for structured aerobic programme.',
      consentDate: '2026-03-15', dietitianSignature: 'RD L. Balkaran', lastUpdated: '2026-04-08',
    },
  },
  
  {
    userId: 'demo-3',
    name:   'Priya Maharaj',
    email:  'p.maharaj@demo.wasteless.tt',
    isDemo: true,
    items: [
      { name: 'Basmati Rice', days_left: 180, quantity: 2,   unit: 'kg'    },
      { name: 'Channa',       days_left: 365, quantity: 500, unit: 'g'     },
      { name: 'Pumpkin',      days_left: 5,   quantity: 1,   unit: 'kg'    },
      { name: 'Mango',        days_left: 3,   quantity: 4,   unit: 'item'  },
      { name: 'Yoghurt',      days_left: 2,   quantity: 500, unit: 'g'     },
      { name: 'Spinach',      days_left: 1,   quantity: 1,   unit: 'bunch' },
    ],
    wasteLog: [
      { action: 'used',   item_name: 'Spinach',      date: '2026-04-09' },
      { action: 'used',   item_name: 'Channa',       date: '2026-04-08' },
      { action: 'used',   item_name: 'Pumpkin',      date: '2026-04-07' },
      { action: 'used',   item_name: 'Mango',        date: '2026-04-06' },
      { action: 'wasted', item_name: 'Yoghurt',      date: '2026-04-05' },
      { action: 'used',   item_name: 'Basmati Rice', date: '2026-04-04' },
    ],
    messages: [],
    currentGoal: 'Maintain vegetarian diet. Increase soluble fibre. Target HbA1c below 7.0% and LDL below 2.0 mmol/L.',
    profile: {
      dob: '1968-11-25', gender: 'Female', mrn: 'DL-00341',
      phone: '868-665-4409', address: 'Penal, Trinidad',
      referralReason: 'Type 2 Diabetes with concurrent dyslipidaemia — integrated dietary management',
      anthropometrics: { height: '155 cm', weight: '76 kg', bmi: '31.6', goalWeight: '65 kg', weightHistory: 'Gradual weight gain of 10 kg over 5 years' },
      biochemical: [
        { test: 'HbA1c',           result: '8.9%',        reference: '<7.0%',          flag: 'High'  },
        { test: 'Fasting Glucose', result: '10.1 mmol/L', reference: '3.9–5.5 mmol/L', flag: 'High'  },
        { test: 'LDL Cholesterol', result: '4.2 mmol/L',  reference: '<2.0 mmol/L',    flag: 'High'  },
        { test: 'HDL Cholesterol', result: '0.9 mmol/L',  reference: '>1.2 mmol/L',    flag: 'Low'   },
        { test: 'Triglycerides',   result: '3.1 mmol/L',  reference: '<1.7 mmol/L',    flag: 'High'  },
        { test: 'Total Cholesterol',result: '6.4 mmol/L', reference: '<5.2 mmol/L',    flag: 'High'  },
        { test: 'eGFR',            result: '68 mL/min',   reference: '>60 mL/min',     flag: 'Normal'},
      ],
      diagnoses: ['Type 2 Diabetes Mellitus (diagnosed 2019)', 'Mixed Dyslipidaemia (diagnosed 2021)'],
      medications: ['Metformin 1 g twice daily', 'Glibenclamide 5 mg once daily', 'Atorvastatin 20 mg at night'],
      allergies: 'Penicillin (rash)',
      dietaryRecall: 'Vegetarian. Breakfast: roti with dhal. Lunch: rice, channa curry, fried plantain, mango achar. Dinner: dal and rice or bread. High carbohydrate load; cooking oil used liberally (coconut/vegetable oil).',
      lifestyle: { activity: 'Minimal — housewife, sedentary most of day', sleep: '7–8 hrs/night', stress: 'Low–moderate', smoking: 'Non-smoker', alcohol: 'None' },
      foodSecurity: { budget: 'TTD $800/week', cookingAbility: 'Excellent — cooks all meals at home', access: 'Local market twice weekly' },
      nfpf: 'BMI 31.6 (obese class I). Mild xanthelasma noted around eyes. No peripheral neuropathy signs. Skin and hair in good condition.',
      pes: 'Excessive fat and carbohydrate intake (NI-5.6.2, NI-5.8.2) related to traditional dietary pattern high in refined carbohydrates and saturated/trans fats as evidenced by HbA1c 8.9%, LDL 4.2 mmol/L, and triglycerides 3.1 mmol/L.',
      prescription: 'Energy: 1,500–1,600 kcal/day. Carbohydrate: 40–45% total energy, low-GI only. Fat: <25% total energy — replace coconut oil with canola/olive oil; eliminate trans fats. Soluble fibre: 10–15 g/day (oats, legumes, vegetables). Cholesterol: <200 mg/day. Protein: 1.0–1.2 g/kg. Plant sterols via food sources.',
      followUp: 'Review in 6 weeks. Repeat lipid panel and HbA1c at 3 months. Track dietary oil usage.',
      referrals: 'Co-managed with endocrinologist. Eye referral for xanthelasma evaluation.',
      consentDate: '2026-02-10', dietitianSignature: 'RD L. Balkaran', lastUpdated: '2026-04-09',
    },
  },
  
  {
    userId: 'demo-4',
    name:   'Desmond Charles',
    email:  'd.charles@demo.wasteless.tt',
    isDemo: true,
    items: [
      { name: 'Chicken Breast', days_left: 2,   quantity: 1,   unit: 'kg'   },
      { name: 'White Rice',     days_left: 180, quantity: 2,   unit: 'kg'   },
      { name: 'Cucumber',       days_left: 4,   quantity: 2,   unit: 'item' },
      { name: 'Cabbage',        days_left: 7,   quantity: 1,   unit: 'head' },
      { name: 'Apple',          days_left: 5,   quantity: 4,   unit: 'item' },
      { name: 'Olive Oil',      days_left: 365, quantity: 1,   unit: 'bottle'},
    ],
    wasteLog: [
      { action: 'used',   item_name: 'Chicken Breast', date: '2026-04-10' },
      { action: 'used',   item_name: 'Cabbage',        date: '2026-04-09' },
      { action: 'wasted', item_name: 'Cucumber',       date: '2026-04-08' },
      { action: 'used',   item_name: 'White Rice',     date: '2026-04-07' },
      { action: 'used',   item_name: 'Apple',          date: '2026-04-06' },
      { action: 'wasted', item_name: 'Tomatoes',       date: '2026-04-04' },
    ],
    messages: [],
    currentGoal: 'Maintain protein restriction at 0.8 g/kg. Limit potassium and phosphorus. Keep sodium below 1,500 mg/day.',
    profile: {
      dob: '1958-06-18', gender: 'Male', mrn: 'CK-00512',
      phone: '868-758-2290', address: 'San Fernando, Trinidad',
      referralReason: 'CKD Stage 3 with co-existing hypertension — renal dietary management',
      anthropometrics: { height: '170 cm', weight: '88 kg', bmi: '30.5', goalWeight: '78 kg', weightHistory: 'Lost 4 kg unintentionally over 6 months — monitored' },
      biochemical: [
        { test: 'Blood Pressure',  result: '162/100 mmHg', reference: '<130/80 mmHg',  flag: 'High'  },
        { test: 'eGFR',            result: '38 mL/min',    reference: '>60 mL/min',    flag: 'Low'   },
        { test: 'Creatinine',      result: '198 µmol/L',   reference: '62–106 µmol/L', flag: 'High'  },
        { test: 'Serum Potassium', result: '5.6 mmol/L',   reference: '3.5–5.0 mmol/L',flag: 'High'  },
        { test: 'Serum Phosphorus',result: '1.7 mmol/L',   reference: '0.8–1.5 mmol/L',flag: 'High'  },
        { test: 'Serum Albumin',   result: '33 g/L',       reference: '35–50 g/L',     flag: 'Low'   },
        { test: 'Haemoglobin',     result: '10.2 g/dL',    reference: '13.5–17.5 g/dL',flag: 'Low'   },
      ],
      diagnoses: ['Essential Hypertension Stage 2 (diagnosed 2015)', 'Chronic Kidney Disease Stage 3b (diagnosed 2023)'],
      medications: ['Ramipril 10 mg once daily', 'Furosemide 40 mg once daily', 'Calcium carbonate 500 mg with meals (phosphate binder)', 'Erythropoietin injection monthly'],
      allergies: 'Sulfonamides (urticaria)',
      dietaryRecall: 'Breakfast: cornflakes with milk and banana. Lunch: stew beef with rice and provisions. Dinner: bake and saltfish or soup. High potassium foods (banana, provisions) consumed daily. Processed meat 3–4×/week.',
      lifestyle: { activity: 'Light — retired, short walks only', sleep: '8 hrs/night', stress: 'Moderate (health anxiety)', smoking: 'Non-smoker', alcohol: 'Rare — occasional beer' },
      foodSecurity: { budget: 'TTD $700/week (pension)', cookingAbility: 'Good — wife manages cooking', access: 'Supermarket 20 min by car' },
      nfpf: 'Mild pallor consistent with anaemia. Mild bilateral ankle oedema. Dry skin. No muscle wasting at present — monitor closely.',
      pes: 'Excessive mineral intake — potassium and phosphorus (NI-5.10.1, NI-5.10.2) related to inadequate knowledge of renal dietary restrictions as evidenced by serum potassium 5.6 mmol/L, serum phosphorus 1.7 mmol/L, and eGFR 38 mL/min.',
      prescription: 'Energy: 1,800–1,900 kcal/day (30–35 kcal/kg IBW). Protein: 0.8 g/kg/day — restrict animal protein. Potassium: <2,000 mg/day — avoid banana, provisions, tomatoes, legumes. Phosphorus: <800 mg/day — avoid dairy, nuts, cola drinks, processed foods. Sodium: ≤1,500 mg/day. Fluid: 1.5 L/day or as per clinical guidance.',
      followUp: 'Monthly review. Repeat renal function panel and electrolytes in 4 weeks. Dietitian-nephrology co-management.',
      referrals: 'Nephrology (Dr. A. Lakhan). Anaemia management with GP.',
      consentDate: '2026-01-20', dietitianSignature: 'RD L. Balkaran', lastUpdated: '2026-04-11',
    },
  },
  
  {
    userId: 'demo-5',
    name:   'Kezia Thomas',
    email:  'k.thomas@demo.wasteless.tt',
    isDemo: true,
    items: [
      { name: 'Chicken Breast', days_left: 3,   quantity: 1.5, unit: 'kg'    },
      { name: 'Broccoli',       days_left: 4,   quantity: 1,   unit: 'head'  },
      { name: 'Sweet Potato',   days_left: 14,  quantity: 1,   unit: 'kg'    },
      { name: 'Greek Yoghurt',  days_left: 6,   quantity: 500, unit: 'g'     },
      { name: 'Oats',           days_left: 90,  quantity: 1,   unit: 'pack'  },
      { name: 'Avocado',        days_left: 2,   quantity: 2,   unit: 'item'  },
      { name: 'Eggs',           days_left: 14,  quantity: 12,  unit: 'item'  },
    ],
    wasteLog: [
      { action: 'used',   item_name: 'Chicken Breast', date: '2026-04-11' },
      { action: 'used',   item_name: 'Broccoli',       date: '2026-04-10' },
      { action: 'used',   item_name: 'Avocado',        date: '2026-04-09' },
      { action: 'used',   item_name: 'Sweet Potato',   date: '2026-04-08' },
      { action: 'used',   item_name: 'Eggs',           date: '2026-04-07' },
      { action: 'used',   item_name: 'Greek Yoghurt',  date: '2026-04-06' },
    ],
    messages: [],
    currentGoal: 'Maintain current healthy dietary pattern. Continue resistance training 3×/week and 150 min moderate cardio weekly.',
    profile: {
      dob: '1998-07-30', gender: 'Female', mrn: 'WL-00089',
      phone: '868-490-1187', address: 'Port of Spain, Trinidad',
      referralReason: 'Voluntary wellness referral — sports nutrition guidance for recreational athlete',
      anthropometrics: { height: '167 cm', weight: '62 kg', bmi: '22.2', goalWeight: '62 kg (maintain)', weightHistory: 'Weight stable for 3 years' },
      biochemical: [
        { test: 'HbA1c',           result: '5.1%',        reference: '<5.7%',          flag: 'Normal' },
        { test: 'Fasting Glucose', result: '4.8 mmol/L',  reference: '3.9–5.5 mmol/L', flag: 'Normal' },
        { test: 'Total Cholesterol',result: '4.1 mmol/L', reference: '<5.2 mmol/L',    flag: 'Normal' },
        { test: 'LDL Cholesterol', result: '2.0 mmol/L',  reference: '<2.6 mmol/L',    flag: 'Normal' },
        { test: 'HDL Cholesterol', result: '1.8 mmol/L',  reference: '>1.2 mmol/L',    flag: 'Normal' },
        { test: 'Haemoglobin',     result: '13.2 g/dL',   reference: '12.0–16.0 g/dL', flag: 'Normal' },
        { test: 'Serum Ferritin',  result: '28 µg/L',     reference: '12–150 µg/L',    flag: 'Normal' },
        { test: 'Vitamin D',       result: '52 nmol/L',   reference: '50–125 nmol/L',  flag: 'Normal' },
      ],
      diagnoses: ['No current medical diagnoses'],
      medications: ['Multivitamin once daily (self-initiated)'],
      allergies: 'NKDA',
      dietaryRecall: 'Breakfast: oats with fruit and Greek yoghurt. Lunch: grilled chicken, sweet potato, and salad. Dinner: stir-fry vegetables with eggs or fish. Snacks: avocado toast, nuts, or fruit. Hydration: 2.5 L water/day.',
      lifestyle: { activity: 'Active — gym 3×/week (resistance), runs 5 km twice weekly', sleep: '8 hrs/night', stress: 'Low', smoking: 'Non-smoker', alcohol: 'Rare — social occasions only' },
      foodSecurity: { budget: 'TTD $600/week', cookingAbility: 'Excellent — meal preps on Sundays', access: 'Farmers market weekly, supermarket nearby' },
      nfpf: 'BMI 22.2 (healthy range). Good muscle tone. Skin, hair, and nails in excellent condition. No signs of nutritional deficiency.',
      pes: 'No active nutrition diagnosis. Optimise sports nutrition to support training performance and recovery.',
      prescription: 'Energy: 2,100–2,200 kcal/day on training days; 1,900 kcal on rest days. Carbohydrate: 50–55% total energy — time intake around training. Protein: 1.4–1.6 g/kg/day — distribute across 4–5 meals. Fat: 25–30% total energy, emphasise unsaturated sources. Pre-workout: complex carb + lean protein 1–2 hrs prior. Post-workout: 20–25 g protein within 30 min. Iron monitoring — menstruating female athlete.',
      followUp: 'Review in 3 months or if training load changes significantly.',
      referrals: 'No referrals required at this time.',
      consentDate: '2026-04-01', dietitianSignature: 'RD L. Balkaran', lastUpdated: '2026-04-12',
    },
  },
];

function DietitianDashboard({ currentUser, onLogout, dbRecipes, config }) {
  const [screen, setScreen] = useState('home');
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('file');
  const [msgBody, setMsgBody] = useState('');
  const [msgPatient, setMsgPatient] = useState(null);
  const [msgView, setMsgView] = useState('inbox');
  const [sentMessages, setSentMessages] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [goal, setGoal] = useState('');
  const [mealPlan, setMealPlan] = useState({});
  const [notification, setNotification] = useState('');
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ name:'', email:'', dob:'', phone:'', diagnosis:'', allergies:'', currentGoal:'', nextAppointment:'', clinicalNotes:'' });
  const [patientGoals, setPatientGoals] = useState({});
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ name:'', prep_time:'', calories:'', difficulty:'Easy', ingredients:'', condition_tags:'' });

  const DAYS = config.days;
  const SLOTS = config.mealSlots;
  const recipes = [...createdRecipes, ...(dbRecipes || [])];

  useEffect(() => { fetchPatients(); fetchSentMessages(); fetchInboxMessages(); }, []); // eslint-disable-line

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}/api/sharing/patients`, { headers: authHeaders() });
      const real = res.ok ? await res.json() : [];
      const all = [...DEMO_PATIENTS, ...real];
      setPatients(all);
      if (all.length) {
        setSelected(prev => prev || all[0]);
        setGoal(all[0]?.currentGoal || '');
        setMsgPatient(all[0]);
        const initialGoals = {};
        all.forEach(p => { if (p.currentGoal) initialGoals[p.userId] = [p.currentGoal]; });
        setPatientGoals(prev => ({ ...initialGoals, ...prev }));
      }
    } catch (err) {
      console.error('Fetch patients error:', err);
    }
  };

  const fetchInboxMessages = async () => {
    try {
      const res = await fetch(`${API}/api/messages`, { headers: authHeaders() });
      if (res.ok) setInboxMessages(await res.json());
    } catch (err) {
      console.error('Fetch inbox messages error:', err);
    }
  };

  const fetchSentMessages = async () => {
    try {
      const res = await fetch(`${API}/api/messages/sent`, { headers: authHeaders() });
      if (res.ok) setSentMessages(await res.json());
    } catch (err) {
      console.error('Fetch sent messages error:', err);
    }
  };

  const selectPatient = (p) => {
    setSelected(p);
    setActiveTab('file');
    setClinicalNotes('');
    setGoal('');
    setShowGoalForm(false);
    setEditingGoalIndex(null);
    setMealPlan({});
    setMsgBody('');
    setScreen('patients');
  };

  const saveRate = (p) => {
    if (!p) return 0;
    const total = p.wasteLog?.length || 0;
    const used = p.wasteLog?.filter(w => w.action === 'used').length || 0;
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const isHighRisk = (p) => {
    const diagnoses = (p.profile?.diagnoses || []).join(' ').toLowerCase();
    const hasNcd = diagnoses && !diagnoses.includes('no current');
    const hasHighLabs = (p.profile?.biochemical || []).some(b => String(b.flag).toLowerCase() === 'high' || String(b.flag).toLowerCase() === 'low');
    return hasNcd || hasHighLabs || saveRate(p) < 50;
  };

  const patientMsgs = (p) => {
    if (!p) return [];
    if (p.isDemo) return p.messages || [];
    return inboxMessages.filter(m => String(m.from_user_id) === String(p.userId || p.id) || String(m.sender_email || '').toLowerCase() === String(p.email || '').toLowerCase());
  };

  const sentToPatient = (p) => {
    if (!p) return [];
    return sentMessages.filter(m => String(m.to_user_id) === String(p.userId || p.id) || String(m.recipient_name || '').toLowerCase() === String(p.name || '').toLowerCase());
  };

  const allInbox = [
    ...inboxMessages.map(m => ({ ...m, patientName: m.sender_name || 'Patient' })),
    ...patients.flatMap(p => (p.messages || []).map(m => ({ ...m, patientName: p.name })))
  ].sort((a,b) => new Date(b.sent_at) - new Date(a.sent_at));

  const sendMessage = async (targetPatient) => {
    const patient = targetPatient || selected;
    if (!patient) { notify('Please select a patient first.'); return; }
    if (!msgBody.trim()) { notify('Please enter a message.'); return; }
    const targetId = patient.userId || patient.id;

    if (patient.isDemo) {
      const newMsg = {
        id: `demo-sent-${Date.now()}`,
        from_user_id: currentUser.id,
        to_user_id: patient.userId,
        sender_name: currentUser.name,
        recipient_name: patient.name,
        body: msgBody.trim(),
        sent_at: new Date().toISOString(),
        type: 'msg'
      };
      setSentMessages(prev => [newMsg, ...prev]);
      setMsgBody('');
      notify('Message sent!');
      return;
    }

    if (!targetId) { notify('No patient ID found.'); return; }

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ toUserId: targetId, body: msgBody.trim(), type: 'msg' })
      });
      const data = await res.json();
      if (!res.ok) { notify(data.error || 'Message could not be sent.'); return; }
      setSentMessages(prev => [{ id:data.messageId || Date.now(), from_user_id:currentUser.id, to_user_id:targetId, sender_name:currentUser.name, recipient_name:patient.name, body:msgBody.trim(), sent_at:new Date().toISOString(), type:'msg' }, ...prev]);
      setMsgBody('');
      notify('Message sent!');
      fetchSentMessages();
    } catch (err) {
      console.error('Send message error:', err);
      notify('Unable to send message. Check backend connection.');
    }
  };

  const saveOnboarding = async () => {
    if (!onboardForm.name.trim()) { notify('Patient name is required.'); return; }
    const newPatient = {
      userId: `new-${Date.now()}`,
      name: onboardForm.name.trim(),
      email: onboardForm.email || 'new.patient@demo.wasteless.tt',
      isDemo: true,
      items: [],
      wasteLog: [],
      messages: [],
      currentGoal: onboardForm.currentGoal || '',
      profile: {
        dob: onboardForm.dob,
        phone: onboardForm.phone,
        diagnoses: onboardForm.diagnosis ? [onboardForm.diagnosis] : [],
        allergies: onboardForm.allergies,
        followUp: onboardForm.nextAppointment ? `Next appointment: ${onboardForm.nextAppointment}` : '',
        clinicalNotes: onboardForm.clinicalNotes
      }
    };
    setPatients(prev => [newPatient, ...prev]);
    setSelected(newPatient);
    setMsgPatient(newPatient);
    setShowOnboardForm(false);
    setOnboardForm({ name:'', email:'', dob:'', phone:'', diagnosis:'', allergies:'', currentGoal:'', nextAppointment:'', clinicalNotes:'' });
    notify('New patient record created.');
    setScreen('patients');
    setActiveTab('file');
  };

  const saveGoalForPatient = async () => {
    if (!selected || !goal.trim()) return;
    const existing = patientGoals[selected.userId] || [];
    let updated;
    if (editingGoalIndex !== null) {
      updated = existing.map((g, i) => i === editingGoalIndex ? goal.trim() : g);
    } else if (existing.length > 0) {
      const replace = window.confirm('This patient already has a goal. Click OK to replace the existing goal, or Cancel to keep all goals and add this one.');
      updated = replace ? [goal.trim()] : [...existing, goal.trim()];
    } else {
      updated = [goal.trim()];
    }
    setPatientGoals(prev => ({ ...prev, [selected.userId]: updated }));
    if (!selected.isDemo) {
      await fetch(`${API}/api/goals/for-patient/${selected.userId}`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ dietitianNote: goal.trim(), followDietitianPlan: true }) });
    }
    setGoal('');
    setEditingGoalIndex(null);
    setShowGoalForm(false);
    notify('Goal saved for patient!');
  };

  const editGoal = (idx) => {
    const existing = patientGoals[selected.userId] || [];
    setGoal(existing[idx] || '');
    setEditingGoalIndex(idx);
    setShowGoalForm(true);
  };

  const deleteGoal = (idx) => {
    if (!window.confirm('Delete this goal?')) return;
    const existing = patientGoals[selected.userId] || [];
    setPatientGoals(prev => ({ ...prev, [selected.userId]: existing.filter((_, i) => i !== idx) }));
    notify('Goal deleted.');
  };

  const pushMealPlan = async () => {
    if (!selected) return;
    if (selected.isDemo) { notify('Meal plan pushed!'); return; }
    await fetch(`${API}/api/mealplanner/push`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ patientId:selected.userId, planData:mealPlan }) });
    notify('Meal plan pushed to patient!');
  };

  const recommendRecipe = async (r) => {
    if (!selected) return;
    if (selected.isDemo) { notify(`${r.name} recommended!`); return; }
    await fetch(`${API}/api/recipes/${r.id}/recommend`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ patientId:selected.userId }) });
    notify(`${r.name} recommended!`);
  };

  const createRecipe = () => {
    if (!newRecipe.name.trim()) { notify('Recipe name is required.'); return; }
    setCreatedRecipes(prev => [{
      id: `created-${Date.now()}`,
      name: newRecipe.name.trim(),
      prep_time: Number(newRecipe.prep_time) || 0,
      calories: Number(newRecipe.calories) || 0,
      difficulty: newRecipe.difficulty || 'Easy',
      ingredients: newRecipe.ingredients,
      condition_tags: newRecipe.condition_tags,
      local: true
    }, ...prev]);
    setNewRecipe({ name:'', prep_time:'', calories:'', difficulty:'Easy', ingredients:'', condition_tags:'' });
    setShowRecipeForm(false);
    notify('Recipe added to this session.');
  };

  const TILE_ICONS = {
    patients:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    messages:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    onboarding:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    resources:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    scheduler:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  };

  const TILES = [
    { id:'patients', label:'Patients', sub:`${patients.length} active`, color:'bg-green-50 border-green-200', stroke:'#16a34a' },
    { id:'messages', label:'Messages', sub:`${allInbox.length} inbox`, color:'bg-blue-50 border-blue-200', stroke:'#2563eb' },
    { id:'onboarding', label:'Onboarding', sub:'Create patient record', color:'bg-purple-50 border-purple-200', stroke:'#9333ea' },
    { id:'resources', label:'Resources', sub:'Clinical guidelines', color:'bg-orange-50 border-orange-200', stroke:'#ea580c' },
    { id:'scheduler', label:'Appointments', sub:'Appointments', color:'bg-gray-50 border-gray-200', stroke:'#9ca3af' },
  ];

  const currentGoals = selected ? (patientGoals[selected.userId] || (selected.currentGoal ? [selected.currentGoal] : [])) : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {notification && <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">{notification}</div>}

      <div className="bg-white border-b px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {screen !== 'home' && <button onClick={() => setScreen('home')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>}
          <div>
            <h1 className="text-base font-bold text-gray-800">{screen === 'home' ? 'Dietitian Portal' : screen === 'patients' ? (selected ? selected.name : 'Patients') : screen === 'messages' ? 'Messages' : screen === 'onboarding' ? 'Patient Onboarding' : screen === 'resources' ? 'Clinical Resources' : screen === 'settings' ? 'Settings' : 'Appointments'}</h1>
            {screen === 'home' && <p className="text-xs text-gray-400">Welcome, {currentUser.name}</p>}
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 border rounded-lg">Sign out</button>
      </div>

      {screen === 'home' && <div className="flex-1 p-5">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-3 text-center"><p className="text-2xl font-bold text-gray-800">{patients.length}</p><p className="text-xs text-gray-400">Patients</p></div>
          <div className="bg-white rounded-xl border p-3 text-center"><p className="text-2xl font-bold text-red-500">{patients.filter(isHighRisk).length}</p><p className="text-xs text-gray-400">High risk</p></div>
          <div className="bg-white rounded-xl border p-3 text-center"><p className="text-2xl font-bold text-green-500">{sentMessages.length}</p><p className="text-xs text-gray-400">Msgs sent</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TILES.map(tile => <button key={tile.id} onClick={() => setScreen(tile.id)} className={`${tile.color} border rounded-2xl p-5 text-center hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[150px]`}>
            <span className="block mb-3 mx-auto" style={{ color: tile.stroke }}>{TILE_ICONS[tile.id]}</span>
            <p className="font-bold text-sm text-gray-800">{tile.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{tile.sub}</p>
          </button>)}
        </div>
      </div>}

      {screen === 'patients' && <div className="flex flex-1 overflow-hidden">
        <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-60 bg-white border-r p-3 overflow-y-auto`}>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Patients ({patients.length})</p>
          {patients.map(p => <button key={p.userId} onClick={() => selectPatient(p)} className={`w-full text-left p-3 rounded-xl mb-1.5 ${selected?.userId===p.userId ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-0.5"><p className="font-medium text-sm text-gray-800">{p.name}</p>{p.isDemo && <span className="text-xs text-gray-400 border rounded px-1 leading-none">Demo</span>}</div>
            <p className="text-xs text-gray-400">{p.items?.length||0} items · {saveRate(p)}% save</p>
          </button>)}
        </div>
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 overflow-y-auto`}>
          {!selected ? <div className="flex items-center justify-center h-full text-gray-400 text-sm">Select a patient</div> : <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={()=>setSelected(null)} className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
              <div className="flex-1"><p className="text-sm font-semibold text-gray-800">{selected.name}</p>{selected.email && <p className="text-xs text-gray-400">{selected.email}</p>}</div>
              {isHighRisk(selected) && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">High risk</span>}
            </div>
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {[{id:'file',label:'Patient file'},{id:'pantry',label:'Patient pantry'},{id:'messages',label:'Messages'},{id:'mealplan',label:'Mealplan'},{id:'goals',label:'Goals'},{id:'recipes',label:'Recipes'}].map(t => <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${activeTab===t.id ? 'bg-green-500 text-white' : 'bg-white border text-gray-600'}`}>{t.label}</button>)}
            </div>

            {activeTab==='file' && <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2"><div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-green-600">{selected.wasteLog?.filter(w=>w.action==='used').length||0}</p><p className="text-xs text-green-600">Used</p></div><div className="bg-red-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-red-500">{selected.wasteLog?.filter(w=>w.action==='wasted').length||0}</p><p className="text-xs text-red-500">Wasted</p></div><div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-blue-600">{saveRate(selected)}%</p><p className="text-xs text-blue-600">Save rate</p></div></div>
              <div className="bg-white rounded-xl p-4 border"><p className="font-semibold text-gray-700 text-sm mb-3">Patient file</p><div className="space-y-2 text-sm text-gray-600"><p><b>Name:</b> {selected.name}</p>{selected.profile?.dob && <p><b>DOB:</b> {selected.profile.dob}</p>}{selected.profile?.phone && <p><b>Phone:</b> {selected.profile.phone}</p>}{selected.profile?.referralReason && <p><b>Referral:</b> {selected.profile.referralReason}</p>}{selected.profile?.diagnoses && <p><b>Diagnosis:</b> {selected.profile.diagnoses.join(', ')}</p>}{selected.profile?.allergies && <p><b>Allergies:</b> {selected.profile.allergies}</p>}</div></div>
              <div className="bg-white rounded-xl p-4 border"><p className="font-semibold text-gray-700 text-sm mb-2">Clinical notes</p><textarea value={clinicalNotes} onChange={e=>setClinicalNotes(e.target.value)} rows={3} placeholder="Add clinical notes..." className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"/><button onClick={async()=>{ if(selected.isDemo){notify('Notes saved!');return;} await fetch(`${API}/api/sharing/patient-record`,{method:'POST',headers:authHeaders(),body:JSON.stringify({userId:selected.userId,clinicalNotes})}); notify('Notes saved!'); }} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Save notes</button></div>
            </div>}

            {activeTab==='pantry' && <div className="bg-white rounded-xl p-4 border"><p className="font-semibold text-gray-700 text-sm mb-2">Patient pantry ({selected.items?.length||0} items)</p>{(selected.items||[]).length===0 && <p className="text-sm text-gray-400 py-4">No pantry items shared.</p>}{(selected.items||[]).map((item,i)=>{ const badge=expiryBadge(item); return <div key={i} className="flex justify-between items-center py-2 border-b last:border-0"><div><span className="text-sm text-gray-700 font-medium">{item.name}</span><p className="text-xs text-gray-400">{item.quantity} {item.unit}</p></div>{badge&&<span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}</div>; })}</div>}

            {activeTab==='messages' && (() => { const thread = [...patientMsgs(selected).map(m=>({...m,_side:'in'})), ...sentToPatient(selected).map(m=>({...m,_side:'out'}))].sort((a,b)=>new Date(a.sent_at)-new Date(b.sent_at)); return <div className="bg-white rounded-xl border flex flex-col" style={{height:'560px'}}><div className="border-b bg-gray-50 px-4 py-3"><p className="font-semibold text-gray-800 text-sm">Chat with {selected.name}</p><p className="text-xs text-gray-400">Patient and dietitian messages are shown in one conversation.</p></div><div className="flex-1 overflow-y-auto p-4 space-y-3">{thread.length===0 && <p className="text-xs text-gray-400 text-center pt-8">No messages yet</p>}{thread.map((m,i)=><div key={i} className={`flex ${m._side==='out' ? 'justify-end' : 'justify-start'}`}><div className={`rounded-2xl px-4 py-3 max-w-xs md:max-w-sm ${m._side==='out' ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}><p className={`text-xs mb-1 ${m._side==='out' ? 'text-green-100' : 'text-gray-400'}`}>{m._side==='out' ? 'You' : (m.sender_name || selected.name)} · {new Date(m.sent_at).toLocaleDateString('en-TT',{day:'numeric',month:'short'})}</p><p className="text-sm leading-relaxed">{m.body}</p></div></div>)}</div><div className="border-t bg-white p-4"><label className="block text-xs font-semibold text-gray-500 mb-2">Send message to {selected.name}</label><div className="flex items-end gap-2"><textarea value={msgBody} onChange={e=>setMsgBody(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(selected); } }} rows={3} placeholder={`Type a message for ${selected.name}...`} className="flex-1 border rounded-2xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-green-500 outline-none"/><button onClick={()=>sendMessage(selected)} disabled={!msgBody.trim()} className="bg-green-500 text-white px-4 py-3 rounded-2xl text-sm font-medium disabled:opacity-40">Send</button></div></div></div>; })()}

            {activeTab==='mealplan' && <div className="bg-white rounded-xl p-4 border"><p className="font-semibold text-gray-700 mb-4 text-sm">Meal plan for {selected.name}</p><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-gray-50"><th className="p-2 text-left text-gray-500">Meal</th>{DAYS.map(d=><th key={d} className="p-2 text-gray-500 capitalize">{d.slice(0,3)}</th>)}</tr></thead><tbody>{SLOTS.map(slot=><tr key={slot} className="border-t"><td className="p-2 font-medium text-gray-600 capitalize">{slot}</td>{DAYS.map(day=><td key={day} className="p-1"><select value={mealPlan[day]?.[slot]?.id||''} onChange={e=>{const r=recipes.find(r=>String(r.id)===String(e.target.value));setMealPlan(prev=>({...prev,[day]:{...prev[day],[slot]:r||null}}));}} className="w-full text-xs border rounded p-0.5"><option value="">--</option>{recipes.filter(r=>!r.meal_type||String(r.meal_type).includes(slot)).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></td>)}</tr>)}</tbody></table></div><button onClick={pushMealPlan} className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Push to patient</button></div>}

            {activeTab==='goals' && <div className="bg-white rounded-xl p-4 border"><p className="font-semibold text-gray-700 mb-3 text-sm">Goals for {selected.name}</p>{currentGoals.length>0 ? <div className="space-y-2 mb-4">{currentGoals.map((g,idx)=><div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700"><div className="flex justify-between gap-2"><div><p className="text-xs font-semibold text-blue-400 mb-1">Current goal</p><p>{g}</p></div><div className="flex gap-1"><button onClick={()=>editGoal(idx)} className="text-xs border rounded px-2 h-7 bg-white text-blue-600">Edit</button><button onClick={()=>deleteGoal(idx)} className="text-xs border rounded px-2 h-7 bg-white text-red-500">Delete</button></div></div></div>)}</div> : <p className="text-sm text-gray-400 mb-4">No goals recorded.</p>}<button onClick={()=>{setShowGoalForm(true);setEditingGoalIndex(null);setGoal('');}} className="w-full border border-green-300 text-green-600 py-2 rounded-lg text-sm font-medium mb-3">+ Create Goal</button>{showGoalForm && <><textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={4} placeholder="e.g. Reduce sodium. Target HbA1c below 7.0%." className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"/><button onClick={saveGoalForPatient} className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Save goal for patient</button></>}</div>}

            {activeTab==='recipes' && <div className="space-y-3"><button onClick={()=>setShowRecipeForm(!showRecipeForm)} className="w-full border border-green-300 text-green-600 py-2.5 rounded-xl text-sm font-medium">{showRecipeForm ? 'Cancel recipe creation' : '+ Create Recipe'}</button>{showRecipeForm && <div className="bg-white border rounded-xl p-4 space-y-3"><input value={newRecipe.name} onChange={e=>setNewRecipe({...newRecipe,name:e.target.value})} placeholder="Recipe name" className="w-full border rounded-lg px-3 py-2 text-sm"/><div className="grid grid-cols-3 gap-2"><input value={newRecipe.prep_time} onChange={e=>setNewRecipe({...newRecipe,prep_time:e.target.value})} placeholder="Minutes" className="border rounded-lg px-3 py-2 text-sm"/><input value={newRecipe.calories} onChange={e=>setNewRecipe({...newRecipe,calories:e.target.value})} placeholder="Calories" className="border rounded-lg px-3 py-2 text-sm"/><select value={newRecipe.difficulty} onChange={e=>setNewRecipe({...newRecipe,difficulty:e.target.value})} className="border rounded-lg px-3 py-2 text-sm"><option>Easy</option><option>Medium</option><option>Hard</option></select></div><textarea value={newRecipe.ingredients} onChange={e=>setNewRecipe({...newRecipe,ingredients:e.target.value})} rows={2} placeholder="Ingredients separated by commas" className="w-full border rounded-lg px-3 py-2 text-sm"/><input value={newRecipe.condition_tags} onChange={e=>setNewRecipe({...newRecipe,condition_tags:e.target.value})} placeholder="Tags e.g. diabetic, low-salt" className="w-full border rounded-lg px-3 py-2 text-sm"/><button onClick={createRecipe} className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Save recipe</button></div>}{recipes.slice(0,12).map(r=><div key={r.id} className="bg-white border rounded-xl p-3 flex justify-between items-start"><div className="flex-1 mr-2"><p className="font-medium text-sm text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.prep_time}min · {r.calories}cal · {r.difficulty}</p>{r.condition_tags && <div className="flex flex-wrap gap-1 mt-1">{String(r.condition_tags).split(',').map(tag=><span key={tag} className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{tag.trim()}</span>)}</div>}</div><button onClick={()=>recommendRecipe(r)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg flex-shrink-0">Send</button></div>)}</div>}
          </div>}
        </div>
      </div>}

      {screen==='messages' && (() => { const chatPatient = msgPatient || selected || patients[0]; const thread = chatPatient ? [...patientMsgs(chatPatient).map(m=>({...m,_side:'in'})), ...sentToPatient(chatPatient).map(m=>({...m,_side:'out'}))].sort((a,b)=>new Date(a.sent_at)-new Date(b.sent_at)) : []; return <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4"><div className="bg-white rounded-xl border p-4 mb-4"><p className="font-semibold text-gray-700 text-sm mb-3">Select patient chat</p><select value={chatPatient?.userId||''} onChange={e=>setMsgPatient(patients.find(p=>String(p.userId)===e.target.value)||null)} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"><option value="">Select patient...</option>{patients.map(p=><option key={p.userId} value={p.userId}>{p.name}</option>)}</select></div><div className="bg-white rounded-xl border flex flex-col flex-1 min-h-[520px]"><div className="border-b bg-gray-50 px-4 py-3"><p className="font-semibold text-gray-800 text-sm">{chatPatient ? `Chat with ${chatPatient.name}` : 'Chat'}</p><p className="text-xs text-gray-400">Inbox and sent messages are combined into one conversation.</p></div><div className="flex-1 overflow-y-auto p-4 space-y-3">{!chatPatient && <p className="text-sm text-gray-400 text-center py-12">Select a patient to view chat</p>}{chatPatient && thread.length===0 && <p className="text-sm text-gray-400 text-center py-12">No messages yet</p>}{thread.map((m,i)=><div key={i} className={`flex ${m._side==='out' ? 'justify-end' : 'justify-start'}`}><div className={`rounded-2xl px-4 py-3 max-w-xs md:max-w-sm ${m._side==='out' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}><p className={`text-xs mb-1 ${m._side==='out' ? 'text-blue-100' : 'text-gray-400'}`}>{m._side==='out' ? 'You' : (m.sender_name || chatPatient.name)} · {new Date(m.sent_at).toLocaleDateString('en-TT',{day:'numeric',month:'short'})}</p><p className="text-sm leading-relaxed">{m.body}</p></div></div>)}</div><div className="border-t bg-white p-4"><textarea value={msgBody} onChange={e=>setMsgBody(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(chatPatient);}}} rows={3} placeholder={chatPatient ? `Type a message for ${chatPatient.name}...` : 'Select a patient first'} className="w-full border rounded-2xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-400 outline-none"/><button onClick={()=>sendMessage(chatPatient)} disabled={!msgBody.trim()||!chatPatient} className="mt-3 w-full bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40">Send</button></div></div></div>; })()}

      {screen==='onboarding' && <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full"><div className="bg-white rounded-xl p-5 border mb-4"><p className="font-semibold text-gray-800 mb-2 text-sm">Patient onboarding</p><p className="text-sm text-gray-500 mb-4">Create a standalone patient record. This is not linked to an existing shared patient list.</p>{!showOnboardForm && <button onClick={()=>setShowOnboardForm(true)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium">Create New Patient Record</button>}</div>{showOnboardForm && <div className="bg-white rounded-xl p-5 border"><p className="font-semibold text-gray-800 mb-4 text-sm">New patient record</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[{label:'Full Name',key:'name',placeholder:'Patient name'},{label:'Email',key:'email',placeholder:'patient@example.com'},{label:'Date of Birth',key:'dob',type:'date'},{label:'Phone',key:'phone',placeholder:'868-XXX-XXXX'},{label:'Next Appointment',key:'nextAppointment',type:'date'},{label:'Allergies',key:'allergies',placeholder:'e.g. NKDA'}].map(f=><div key={f.key}><label className="text-xs text-gray-500 font-medium">{f.label}</label><input type={f.type||'text'} value={onboardForm[f.key]} onChange={e=>setOnboardForm({...onboardForm,[f.key]:e.target.value})} placeholder={f.placeholder||''} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"/></div>)}</div>{[{label:'Diagnosis / Medical History',key:'diagnosis',placeholder:'e.g. Type 2 Diabetes, Hypertension',rows:2},{label:'Current Dietary Goal',key:'currentGoal',placeholder:'e.g. Reduce sodium to under 2,000 mg/day.',rows:2},{label:'Clinical Notes',key:'clinicalNotes',placeholder:'PES statement, nutrition prescription, referrals...',rows:4}].map(f=><div key={f.key} className="mt-4"><label className="text-xs text-gray-500 font-medium">{f.label}</label><textarea value={onboardForm[f.key]} rows={f.rows} onChange={e=>setOnboardForm({...onboardForm,[f.key]:e.target.value})} placeholder={f.placeholder} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"/></div>)}<div className="flex gap-2 mt-5"><button onClick={()=>setShowOnboardForm(false)} className="flex-1 border rounded-xl py-3 text-gray-600 text-sm font-medium">Cancel</button><button onClick={saveOnboarding} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium">Save patient record</button></div></div>}</div>}

      {screen==='resources' && <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full"><DietitianResourcePanel /></div>}
      {screen==='settings' && <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-24"><div className="bg-white rounded-2xl border p-5"><h2 className="text-lg font-bold text-gray-800 mb-2">Settings</h2><p className="text-sm text-gray-500 mb-4">Manage your dietitian portal session.</p><button onClick={onLogout} className="w-full border rounded-xl py-3 text-gray-600 text-sm font-medium hover:text-red-500">Sign out</button></div></div>}
      {screen==='scheduler' && <div className="flex-1 flex items-center justify-center p-8"><div className="text-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><h2 className="text-xl font-bold text-gray-700 mb-2">Appointments</h2><p className="text-sm text-gray-400 max-w-xs">The appointments module will be available in a future release.</p></div></div>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40"><div className="flex max-w-2xl mx-auto">{[
        { id:'back', label:'Back', icon:<><polyline points="15 18 9 12 15 6"/></> },
        { id:'home', label:'Home', icon:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
        { id:'settings', label:'Settings', icon:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.4-1.1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.23 3.5l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .4 1.1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.5 7.23l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.37.36.7.6 1 .31.25.7.4 1.1.4H21a2 2 0 1 1 0 4h-.09c-.4 0-.79.15-1.1.4-.24.3-.46.63-.6 1z"/></> },
      ].map(item => <button key={item.id} onClick={() => item.id==='back' ? setScreen('home') : setScreen(item.id)} className={`flex-1 flex flex-col items-center py-3 transition-all ${screen === item.id ? 'text-green-600' : 'text-gray-400'}`}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg><span className="text-xs mt-0.5 font-medium">{item.label}</span></button>)}</div></div>
    </div>
  );
}


function HouseholdDashboard({ currentUser, onLogout, config }) {
  const [activeTab, setActiveTab] = useState('home');
  const [items, setItems]                     = useState([]);
  const [wasteLog, setWasteLog]               = useState([]);
  const [dbRecipes, setDbRecipes]             = useState([]);
  const [leftovers, setLeftovers]             = useState([]);
  const [goals, setGoals]                     = useState(null);
  const [goalProgress, setGoalProgress]       = useState(null);
  const [mealPlan, setMealPlan]               = useState(null);
  const [rewards, setRewards]                 = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiInsight, setAiInsight]             = useState('');
  const [sharingOn, setSharingOn]             = useState(false);
  const [notifications, setNotifications]     = useState([]);
  const [showAddForm, setShowAddForm]         = useState(false);
  const [showGoalForm, setShowGoalForm]       = useState(false);
  const [newItem, setNewItem]                 = useState({ name:'', category_id:'', unit_id:'', quantity:1, expiryDate:'' });
  const [editItem, setEditItem]               = useState(null);
  const [units, setUnits]                     = useState([]);
  const [unitGroups, setUnitGroups]           = useState([]);
  const [categories, setCategories]           = useState([]);
  const [suggestions, setSuggestions]         = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newGoals, setNewGoals]               = useState({ wasteTarget:2, pantryUseTarget:80, mealPlanDaysTarget:5 });
  const [pendingDelete, setPendingDelete]     = useState(null);
  const [selectedRecipe, setSelectedRecipe]   = useState(null);
  const [dietFilter, setDietFilter]           = useState([]);
  const [mealTypeFilter, setMealTypeFilter]   = useState('');
  const [recipeSearch, setRecipeSearch]       = useState('');
  const [notification, setNotification]       = useState('');
  const [mealPlanMode, setMealPlanMode]       = useState('view');
  const [customPlan, setCustomPlan]           = useState({});
  const [showLeftoverForm, setShowLeftoverForm] = useState(false);
  const [leftoverItem, setLeftoverItem]       = useState('');
  const [showPdfOptions, setShowPdfOptions]   = useState(false);
  const [dismissedRecs, setDismissedRecs]     = useState([]);
  const [showResources, setShowResources]     = useState(false);
  const [foodCoverage, setFoodCoverage]       = useState({ coverage: {}, total_groups: 0 });
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const DAYS       = config.days;
  const SLOTS      = config.mealSlots;
  const DIET_TAGS  = config.dietTags;
  const MEAL_TYPES = config.mealTypes;

  const suggestTimer = React.useRef(null);
  const notify = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  const fetchFoodCoverage = async () => { try { const r = await fetch(`${API}/api/food-groups/coverage`, { headers: authHeaders() }); if (r.ok) setFoodCoverage(await r.json()); } catch(e) {} };

  const fetchAll = async () => {
    await Promise.all([
      fetchPantry(), fetchWaste(), fetchRecipes(), fetchLeftovers(),
      fetchGoals(), fetchMealPlan(), fetchRewards(), fetchRecommendations(),
      fetchSharingStatus(), fetchNotifications(), fetchAiInsight(),
      fetchUnits(), fetchCategories(), fetchFoodCoverage()
    ]);
  };
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPantry         = async () => { const r = await fetch(`${API}/api/pantry`,                        { headers: authHeaders() }); if (r.ok) setItems(await r.json()); };
  const fetchWaste          = async () => { const r = await fetch(`${API}/api/waste`,                         { headers: authHeaders() }); if (r.ok) setWasteLog(await r.json()); };
  const fetchRecipes        = async () => { const r = await fetch(`${API}/api/recipes`,                       { headers: authHeaders() }); if (r.ok) setDbRecipes(await r.json()); };
  const fetchLeftovers      = async () => { const r = await fetch(`${API}/api/leftovers`,                     { headers: authHeaders() }); if (r.ok) setLeftovers(await r.json()); };
  const fetchRewards        = async () => { const r = await fetch(`${API}/api/rewards`,                       { headers: authHeaders() }); if (r.ok) setRewards(await r.json()); };
  const fetchSharingStatus  = async () => { const r = await fetch(`${API}/api/sharing/status`,                { headers: authHeaders() }); if (r.ok) { const d = await r.json(); setSharingOn(d.sharing_enabled === 1); } };
  const fetchNotifications  = async () => { const r = await fetch(`${API}/api/notifications`,                 { headers: authHeaders() }); if (r.ok) setNotifications(await r.json()); };
  const fetchCategories     = async () => { const r = await fetch(`${API}/api/categories`,                    { headers: authHeaders() }); if (r.ok) setCategories(await r.json()); };
  const fetchRecommendations = async () => { const r = await fetch(`${API}/api/recommendations`,              { headers: authHeaders() }); if (r.ok) { const d = await r.json(); setRecommendations(d.recommendations || []); } };
  const fetchAiInsight = async () => {
    try {
      const r = await fetch(`${API}/api/insights/smart`, { headers: authHeaders() });
      if (r.ok) {
        const d = await r.json();
        setAiInsight(d.insight || '');
        return;
      }
    } catch (err) {
      console.warn('Gemini smart insight unavailable, falling back to rule-based insight.', err.message);
    }

    const r = await fetch(`${API}/api/recommendations/ai-insight`, { headers: authHeaders() });
    if (r.ok) {
      const d = await r.json();
      setAiInsight(d.insight || '');
    }
  };

  const fetchGoals = async () => {
    const r  = await fetch(`${API}/api/goals`,          { headers: authHeaders() }); if (r.ok)  setGoals(await r.json());
    const r2 = await fetch(`${API}/api/goals/progress`, { headers: authHeaders() }); if (r2.ok) setGoalProgress(await r2.json());
  };

  const fetchMealPlan = async () => {
    const r = await fetch(`${API}/api/mealplanner`, { headers: authHeaders() });
    if (r.ok) { const d = await r.json(); setMealPlan(d); if (d?.plan_data) setCustomPlan(d.plan_data); }
  };

  const fetchUnits = async () => {
    const r = await fetch(`${API}/api/units`, { headers: authHeaders() });
    if (r.ok) {
      const data = await r.json();
      setUnits(data);
      setUnitGroups([...new Set(data.map(u => u.category).filter(Boolean))]);
    }
  };

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 1) { setSuggestions([]); return; }
    const r = await fetch(`${API}/api/suggestions?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
    if (r.ok) setSuggestions(await r.json());
  };

  const saveEditItem = async () => {
    if (!editItem) return;
    if (editItem.expiry_date && editItem.expiry_date < new Date().toISOString().split('T')[0]) {
      notify('Expiry date cannot be in the past'); return;
    }
    const r = await fetch(`${API}/api/pantry/${editItem.id}`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ name: editItem.name, quantity: editItem.quantity, unit_id: editItem.unit_id || null, category_id: editItem.category_id || null, expiry_date: editItem.expiry_date || null })
    });
    if (r.ok) { setEditItem(null); await fetchPantry(); notify('Item updated!'); }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    if (newItem.expiryDate && newItem.expiryDate < new Date().toISOString().split('T')[0]) {
      notify('Expiry date cannot be in the past'); return;
    }
    const r = await fetch(`${API}/api/pantry`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ name: newItem.name.trim(), quantity: parseFloat(newItem.quantity) || 1, unit_id: newItem.unit_id ? parseInt(newItem.unit_id) : null, category_id: newItem.category_id ? parseInt(newItem.category_id) : null, expiry_date: newItem.expiryDate || null })
    });
    if (r.ok) { setShowAddForm(false); setNewItem({ name:'', category_id:'', unit_id:'', quantity:1, expiryDate:'' }); setSuggestions([]); await fetchPantry(); notify('Item added!'); }
  };

  const confirmDelete = async (action) => {
    if (!pendingDelete) return;
    await fetch(`${API}/api/waste`,                        { method: 'POST',   headers: authHeaders(), body: JSON.stringify({ itemName: pendingDelete.name, action }) });
    await fetch(`${API}/api/pantry/${pendingDelete.id}`,   { method: 'DELETE', headers: authHeaders() });
    if (action === 'used') { setShowLeftoverForm(true); setLeftoverItem(pendingDelete.name); }
    setPendingDelete(null);
    await fetchPantry(); await fetchWaste(); await fetchRewards();
    notify(action === 'used' ? 'Logged as used!' : 'Logged as wasted');
  };

  const logLeftover = async () => {
    if (!leftoverItem.trim()) return;
    await fetch(`${API}/api/leftovers`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ itemName: leftoverItem }) });
    setShowLeftoverForm(false); setLeftoverItem('');
    await fetchLeftovers(); notify('Leftover logged!');
  };

  const resolveLeftover = async (id, outcome) => {
    await fetch(`${API}/api/leftovers/${id}/resolve`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ outcome }) });
    await fetchLeftovers(); await fetchWaste(); notify(`Leftover marked as ${outcome}`);
  };

  const toggleSharing = async () => {
    const next = !sharingOn; setSharingOn(next);
    await fetch(`${API}/api/sharing/toggle`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ enabled: next }) });
  };

  const saveGoals = async () => {
    await fetch(`${API}/api/goals`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(newGoals) });
    setShowGoalForm(false); await fetchGoals(); notify('Goals saved!');
  };

  const generateMealPlan = async () => {
    const r = await fetch(`${API}/api/mealplanner/generate`, { method: 'POST', headers: authHeaders() });
    if (r.ok) {
      const d = await r.json();
      setCustomPlan(d.planData);
      await fetch(`${API}/api/mealplanner`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ planData: d.planData }) });
      await fetchMealPlan(); notify('Meal plan generated!');
    }
  };

  const saveMealPlan = async () => {
    await fetch(`${API}/api/mealplanner`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ planData: customPlan }) });
    await fetchMealPlan(); notify('Meal plan saved!');
  };

  // DELETE THIS ENTIRE BLOCK
  const scanBarcode = async () => {
  const r = await fetch(`${API}/api/barcode/scan`, { headers: authHeaders() });
  if (!r.ok) return;
  const item = await r.json();
  
  const matchedCategory = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
  
  const matchedUnit = units.find(u => u.name.toLowerCase() === item.unit.toLowerCase() || u.abbreviation.toLowerCase() === item.unit.toLowerCase());

  setNewItem({
    name:        item.name,
    category_id: matchedCategory ? matchedCategory.id : '',
    unit_id:     matchedUnit     ? matchedUnit.id     : '',
    quantity:    item.quantity,
    expiryDate:  item.expiryDate || ''
  });
  setShowAddForm(true);
};

const scanBarcode = () => {
  setShowBarcodeModal(true);
};

const scanBarcode = () => {
  setShowBarcodeModal(true);
};
  const stats = {
    total:    wasteLog.length,
    used:     wasteLog.filter(w => w.action === 'used').length,
    wasted:   wasteLog.filter(w => w.action === 'wasted').length,
    saveRate: wasteLog.length > 0 ? Math.round((wasteLog.filter(w => w.action === 'used').length / wasteLog.length) * 100) : 0
  };

  const expiringSoon   = items.filter(i => i.days_left !== null && i.days_left !== undefined && i.days_left <= 3);
  const unreadCount    = notifications.filter(n => !n.is_read).length;

  const filteredRecipes = dbRecipes
    .filter(r => {
      const matchDiet   = dietFilter.length === 0 || dietFilter.every(f => r.dietary_tags?.includes(f));
      const matchMeal   = !mealTypeFilter || r.meal_type?.includes(mealTypeFilter);
      const matchSearch = !recipeSearch || r.name?.toLowerCase().includes(recipeSearch.toLowerCase()) || r.missingItems?.some(m => m.toLowerCase().includes(recipeSearch.toLowerCase()));
      return matchDiet && matchMeal && matchSearch;
    })
    .slice()
    .sort((a, b) => {
      const missingDiff = recipeMissingCount(a) - recipeMissingCount(b);
      if (missingDiff !== 0) return missingDiff;

      const localDiff = Number(Boolean(b.is_local)) - Number(Boolean(a.is_local));
      if (localDiff !== 0) return localDiff;

      return (Number(a.prep_time) || 999) - (Number(b.prep_time) || 999);
    });

  const UnitSelect = ({ value, onChange, className }) => (
    <select value={value} onChange={onChange} className={className}>
      <option value="">Select...</option>
      {unitGroups.map(grp => (
        <optgroup key={grp} label={grp.charAt(0).toUpperCase() + grp.slice(1)}>
          {units.filter(u => u.category === grp).map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-pulse">{notification}</div>
      )}

      <div className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div onClick={() => setActiveTab('home')} className="cursor-pointer flex flex-col gap-0.5">
          <LogoFull size="sm" />
          <p className="text-xs text-gray-400 pl-1">{greeting()}, {currentUser.name?.split(' ')[0] || 'there'}!</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
          <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 border rounded-lg">Sign out</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {activeTab !== 'home' && (
          <button
            onClick={() => setActiveTab('home')}
            className="mb-4 w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-gray-600 hover:text-green-600"
            aria-label="Back to home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}

        {activeTab === 'pantry' && recommendations.filter(r => !dismissedRecs.includes(r.type)).length > 0 && (
          <div className="mb-4 space-y-2">
            {recommendations.filter(r => !dismissedRecs.includes(r.type)).slice(0, 2).map((rec, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800">{rec.title}</p>
                  <p className="text-xs text-amber-700">{rec.message}</p>
                </div>
                <button onClick={() => setDismissedRecs(prev => [...prev, rec.type])} className="text-amber-400 hover:text-amber-600 text-sm ml-2">✕</button>
              </div>
            ))}
          </div>
        )}

{activeTab === 'home' && (
  <div className="p-5 pb-24">
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-5">
      <div className="flex items-start gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 15h.01M16 15h.01"/><line x1="3" y1="16" x2="1" y2="16"/><line x1="21" y1="16" x2="23" y2="16"/></svg>
        <div>
          <p className="text-xs font-semibold text-green-700 mb-1">Smart insight</p>
          <p className="text-sm text-green-800 leading-relaxed">
            {aiInsight || 'Add more pantry items and log what you use or waste to generate more personalised food-saving suggestions.'}
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { tab: 'pantry', label: 'Pantry', sub: 'Manage food items', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
        { tab: 'recipes', label: 'Recipes', sub: 'Suggested meals', icon: <><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></> },
        { tab: 'allrecipes', label: 'Browse', sub: 'All recipes', icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
        { tab: 'mealplan', label: 'Planner', sub: 'Weekly meals', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
        { tab: 'stats', label: 'Stats', sub: 'Waste & rewards', icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
        { tab: 'messages_inbox', label: 'Messages', sub: 'Dietitian notes', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
      ].map(item => (
        <button
          key={item.tab}
          onClick={() => setActiveTab(item.tab)}
          className="bg-white border rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[150px]"
        >
          <svg className="text-green-600 mb-3 mx-auto" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {item.icon}
          </svg>
          <p className="font-bold text-gray-800">{item.label}</p>
          <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
        </button>
      ))}
    </div>
  </div>
)}

        {activeTab === 'pantry' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-500 rounded-2xl p-4 text-white text-center">
                <p className="text-xs opacity-80">Total items</p>
                <p className="text-3xl font-bold">{items.length}</p>
              </div>
              <div className="bg-orange-500 rounded-2xl p-4 text-white text-center">
                <p className="text-xs opacity-80">Expiring soon</p>
                <p className="text-3xl font-bold">{expiringSoon.length}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setShowAddForm(true)} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add item</button>
              <button onClick={scanBarcode} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Scan barcode (Demo)</button>
            </div>
            {leftovers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Leftovers</h3>
                {leftovers.map(l => (
                  <div key={l.id} className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-purple-800">{l.item_name}</p>
                      <p className="text-xs text-purple-500">Cooked {new Date(l.cooked_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => resolveLeftover(l.id, 'used')} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg">Used</button>
                      <button onClick={() => resolveLeftover(l.id, 'wasted')} className="text-xs bg-red-400 text-white px-2 py-1 rounded-lg">Wasted</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Pantry inventory</h3>
            {items.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-sm">Your pantry is empty — add your first item!</p></div>}
            {items.map(item => {
              const badge = expiryBadge(item);
              return (
                <div key={item.id} className="bg-white rounded-xl border p-4 mb-2 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                      {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} · {parseFloat(item.quantity).toFixed(2)} {item.unit}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditItem(item)} className="w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onClick={() => setPendingDelete(item)} className="w-8 h-8 bg-red-50 text-red-400 rounded-full flex items-center justify-center hover:bg-red-100">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
                  </div>
                </div>
              );
            })}
            <div className="mt-6 flex justify-center">
              <FoodGroupHexagon coverage={foodCoverage.coverage} totalGroups={foodCoverage.total_groups} />
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-1">Recipe suggestions</h2>
            <p className="text-xs text-gray-400 mb-3">Based on your pantry · {mealTimeLabel()} time</p>
            <input value={recipeSearch} onChange={e => setRecipeSearch(e.target.value)} placeholder="Search recipes or ingredients..."
              className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-green-500 outline-none" />
            <div className="flex flex-wrap gap-2 mb-3">
              {DIET_TAGS.map(tag => (
                <button key={tag} onClick={() => setDietFilter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${dietFilter.includes(tag) ? 'bg-green-500 text-white border-green-500' : 'text-gray-500 border-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setMealTypeFilter('')}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${mealTypeFilter === '' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'}`}>All</button>
              {MEAL_TYPES.map(t => (
                <button key={t} onClick={() => setMealTypeFilter(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${mealTypeFilter === t ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>
            {filteredRecipes.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-sm">No recipes match your filters</p></div>}
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} onClick={async () => {
                const r = await fetch(`${API}/api/recipes/${recipe.id}`, { headers: authHeaders() });
                if (r.ok) setSelectedRecipe({...recipe, ...(await r.json())});
                else setSelectedRecipe(recipe);
              }} className="bg-white rounded-xl border p-4 mb-2 cursor-pointer hover:border-green-300 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm">{recipe.name}</span>
                      {recipe.is_local === 1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🇹🇹 Local</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{recipe.prep_time}min · {recipe.calories}cal · {recipe.difficulty}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${recipe.missing === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {recipe.missing === 0 ? 'Can make now' : `Missing ${recipe.missing}`}
                      </span>
                      {recipe.missing > 0 && recipe.missingItems?.length > 0 && (
                        <span className="text-xs text-red-500">Need: {recipe.missingItems.slice(0,3).join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <RecipeFoodGroupBadge ingredients={recipeBadgeIngredients(recipe)} size={48} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'allrecipes' && <AllRecipesTab API={API} authHeaders={authHeaders} notify={notify} config={config} />}

        {activeTab === 'mealplan' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-3">Weekly meal planner</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={generateMealPlan} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>Auto-generate from pantry</button>
              <button onClick={() => setMealPlanMode(mealPlanMode === 'edit' ? 'view' : 'edit')} className="flex-1 bg-white border text-gray-600 py-2.5 rounded-xl text-sm font-medium">
                {mealPlanMode === 'edit' ? 'View plan' : 'Build my own'}
              </button>
            </div>
            {mealPlan?.pushed_by && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Your dietitian sent you this meal plan
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 rounded-xl">
                    <th className="p-2 text-left text-gray-500">Meal</th>
                    {DAYS.map(d => <th key={d} className="p-2 text-gray-500 capitalize">{d.slice(0,3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot => (
                    <tr key={slot} className="border-t">
                      <td className="p-2 font-medium text-gray-600 capitalize">{slot}</td>
                      {DAYS.map(day => (
                        <td key={day} className="p-1">
                          {mealPlanMode === 'edit' ? (
                            <select value={customPlan[day]?.[slot]?.id || ''}
                              onChange={e => { const recipe = dbRecipes.find(r => r.id === parseInt(e.target.value)); setCustomPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: recipe || null } })); }}
                              className="w-full text-xs border rounded p-1">
                              <option value="">--</option>
                              {dbRecipes.filter(r => !r.meal_type || r.meal_type.includes(slot)).map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          ) : (
                            <div className={`text-xs p-1 rounded min-h-8 ${customPlan[day]?.[slot] ? 'bg-green-50 text-green-700' : 'text-gray-300'}`}>
                              {customPlan[day]?.[slot]?.name || '—'}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mealPlanMode === 'edit' && <button onClick={saveMealPlan} className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-medium">Save meal plan</button>}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">My stats</h2>
            {rewards && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mb-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs opacity-80">Your badge</p>
                    <p className="text-lg font-bold">{rewards.badge}</p>
                    <p className="text-xs opacity-80">{rewards.total_points} points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">Next: {rewards.nextBadge?.name || 'Max level!'}</p>
                    {rewards.nextBadge && <p className="text-xs opacity-80">{rewards.pointsToNext} pts to go</p>}
                  </div>
                </div>
                <div className="mt-3 bg-white bg-opacity-30 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 transition-all"
                    style={{ width: rewards.nextBadge ? `${Math.min(100, 100 - (rewards.pointsToNext / rewards.nextBadge?.minPoints * 100))}%` : '100%' }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.used}</p><p className="text-xs text-green-600">Used</p></div>
              <div className="bg-red-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-red-500">{stats.wasted}</p><p className="text-xs text-red-500">Wasted</p></div>
              <div className="bg-blue-50 rounded-2xl p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.saveRate}%</p><p className="text-xs text-blue-600">Save rate</p></div>
            </div>
            {stats.saveRate >= 80 && <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700">Excellent — you are using most of what you buy!</div>}
            {stats.saveRate >= 50 && stats.saveRate < 80 && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">Good progress — keep reducing waste!</div>}
            {stats.saveRate < 50 && stats.total > 0 && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">More than half your items are being wasted — check expiry dates regularly.</div>}
            <div className="bg-white rounded-2xl border p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">My goals</h3>
                <button onClick={() => setShowGoalForm(true)} className="text-xs text-green-600 border border-green-300 px-3 py-1 rounded-lg">{goals ? 'Edit' : 'Set goals'}</button>
              </div>
              {!goals && <p className="text-sm text-gray-400">No goals set yet — tap Set goals to get started</p>}
              {goals && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Waste fewer than {goals.waste_target} items/week</p>
                    {goalProgress?.progress && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${goalProgress.progress.wasteTargetMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {goalProgress.progress.wasteTargetMet ? '✓ On track' : `${goalProgress.progress.wastedThisWeek} wasted`}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Use {goals.pantry_use_target}% of pantry items</p>
                    {goalProgress?.progress && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${goalProgress.progress.pantryTargetMet ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {goalProgress.progress.saveRate}% save rate
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Follow meal plan {goals.meal_plan_days_target} days/week</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700 text-sm">Share with dietitian</p>
                  <p className="text-xs text-gray-400">Allow your dietitian to view your pantry and waste data</p>
                </div>
                <button onClick={toggleSharing} className={`relative w-12 h-6 rounded-full transition-colors ${sharingOn ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${sharingOn ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {sharingOn && <p className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded-lg">Active — your dietitian can see your pantry and waste data</p>}
            </div>
            {rewards && (
              <div className="bg-white rounded-2xl border p-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Activity summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><p className="text-xl font-bold text-gray-800">{rewards.items_used_count}</p><p className="text-xs text-gray-400">Items used</p></div>
                  <div className="text-center"><p className="text-xl font-bold text-gray-800">{rewards.items_wasted_count}</p><p className="text-xs text-gray-400">Items wasted</p></div>
                  <div className="text-center"><p className="text-xl font-bold text-gray-800">{rewards.recipes_cooked}</p><p className="text-xs text-gray-400">Recipes cooked</p></div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Activity log</h3>
              {wasteLog.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full ${entry.action === 'used' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm text-gray-700 flex-1">{entry.item_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${entry.action === 'used' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{entry.action}</span>
                  <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              ))}
              {wasteLog.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>}
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto my-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add pantry item</h3>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-sm text-gray-600">Item name</label>
                <input value={newItem.name}
                  onChange={e => { const val = e.target.value; setNewItem({ ...newItem, name: val }); clearTimeout(suggestTimer.current); suggestTimer.current = setTimeout(() => { fetchSuggestions(val); setShowSuggestions(true); }, 300); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} name="pm_pantry_item_nf"
                  placeholder="e.g. Dasheen, Chicken, Oats"
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li key={i} className="px-4 py-2 text-sm hover:bg-green-50 cursor-pointer"
                        onMouseDown={() => { setNewItem({...newItem, name: s}); setSuggestions([]); setShowSuggestions(false); }}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select value={newItem.category_id} onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Unit</label>
                  <UnitSelect value={newItem.unit_id} onChange={e => setNewItem({...newItem, unit_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Expiry date</label>
                <input type="date" value={newItem.expiryDate} onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddForm(false)} className="flex-1 border rounded-xl py-3 text-gray-600 text-sm">Cancel</button>
              <button onClick={addItem} className="flex-1 bg-green-500 text-white rounded-xl py-3 text-sm font-medium">Add to pantry</button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit item</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select value={editItem.category_id || ''} onChange={e => setEditItem({...editItem, category_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Unit</label>
                  <UnitSelect value={editItem.unit_id || ''} onChange={e => setEditItem({...editItem, unit_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input type="number" value={editItem.quantity} onChange={e => setEditItem({...editItem, quantity: e.target.value})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Expiry date</label>
                <input type="date" value={editItem.expiry_date || ''} onChange={e => setEditItem({...editItem, expiry_date: e.target.value})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditItem(null)} className="flex-1 border rounded-xl py-3 text-gray-600 text-sm">Cancel</button>
              <button onClick={saveEditItem} className="flex-1 bg-green-500 text-white rounded-xl py-3 text-sm font-medium">Save changes</button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove {pendingDelete.name}?</h3>
            <p className="text-sm text-gray-500 mb-5">How did you use this item?</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingDelete(null)} className="flex-1 border rounded-xl py-2.5 text-gray-600 text-sm">Cancel</button>
              <button onClick={() => confirmDelete('wasted')} className="flex-1 bg-red-400 text-white rounded-xl py-2.5 text-sm">Wasted</button>
              <button onClick={() => confirmDelete('used')} className="flex-1 bg-green-500 text-white rounded-xl py-2.5 text-sm">Used</button>
            </div>
          </div>
        </div>
      )}

      {showLeftoverForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Log leftover?</h3>
            <p className="text-sm text-gray-500 mb-4">Did you cook {leftoverItem} and have leftovers?</p>
            <input value={leftoverItem} onChange={e => setLeftoverItem(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-green-500 outline-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowLeftoverForm(false)} className="flex-1 border rounded-xl py-2.5 text-gray-600 text-sm">No leftover</button>
              <button onClick={logLeftover} className="flex-1 bg-purple-500 text-white rounded-xl py-2.5 text-sm">Log leftover</button>
            </div>
          </div>
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Set my goals</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Max items wasted per week</label>
                <input type="number" value={newGoals.wasteTarget} onChange={e => setNewGoals({...newGoals, wasteTarget: parseInt(e.target.value)})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Target pantry save rate (%)</label>
                <input type="number" value={newGoals.pantryUseTarget} onChange={e => setNewGoals({...newGoals, pantryUseTarget: parseInt(e.target.value)})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Meal plan days per week</label>
                <input type="number" value={newGoals.mealPlanDaysTarget} onChange={e => setNewGoals({...newGoals, mealPlanDaysTarget: parseInt(e.target.value)})}
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowGoalForm(false)} className="flex-1 border rounded-xl py-3 text-gray-600 text-sm">Cancel</button>
              <button onClick={saveGoals} className="flex-1 bg-green-500 text-white rounded-xl py-3 text-sm font-medium">Save goals</button>
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedRecipe.name}</h3>
                <p className="text-xs text-gray-400">{selectedRecipe.prep_time}min · {selectedRecipe.calories}cal · {selectedRecipe.difficulty}</p>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {selectedRecipe.dietary_tags && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedRecipe.dietary_tags.split(',').map(tag => (
                  <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            )}
            <div className="mb-4">
              {selectedRecipe.ingredients?.length > 0
                ? <PortionScaler recipe={selectedRecipe} ingredients={selectedRecipe.ingredients} />
                : selectedRecipe.ingredients_text?.split(',').map((ing, i) => (
                    <span key={i} className="inline-block text-sm px-2 py-0.5 rounded-full mr-1 mb-1 bg-green-50 text-green-700">{ing.trim()}</span>
                  ))
              }
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedRecipe.instructions}</p>
            </div>
            <button onClick={async () => {
              const cookRes = await fetch(`${API}/api/recipes/${selectedRecipe.id}/cook`, { method: 'POST', headers: authHeaders() });
              const cookData = await cookRes.json();
              setSelectedRecipe(null); await fetchPantry(); await fetchRewards(); await fetchWaste();
              notify(`Recipe cooked — points awarded!${cookData.reduced?.length ? ` Pantry updated: ${cookData.reduced.join(', ')}.` : ''}`);
            }} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">I cooked this!</button>
          </div>
        </div>
      )}

      {showPdfOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Share summary</h3>
            <p className="text-sm text-gray-500 mb-4">Share with friends, Dietitian or Nutritionist</p>
            <div className="space-y-2 mb-5">
              <p className="text-sm text-gray-600">{items.length} pantry items</p>
              <p className="text-sm text-gray-600">Save rate: {stats.saveRate}%</p>
              <p className="text-sm text-gray-600">{stats.used} items used · {stats.wasted} wasted</p>
              {rewards && <p className="text-sm text-gray-600">Badge: {rewards.badge}</p>}
            </div>
            <p className="text-xs text-gray-400 mb-4">To save as PDF: use your browser's Print function and select "Save as PDF"</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPdfOptions(false)} className="flex-1 border rounded-xl py-2.5 text-gray-600 text-sm">Close</button>
              <button onClick={() => { setShowPdfOptions(false); window.print(); }} className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium">Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}

      {showResources && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <PatientResourceHub onBack={() => setShowResources(false)} />
        </div>
      )}

      {activeTab === 'messages_inbox' && (
        <MessagesInboxTab API={API} authHeaders={authHeaders} currentUser={currentUser} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          currentUser={currentUser}
          API={API}
          authHeaders={authHeaders}
          onLogout={onLogout}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex max-w-2xl mx-auto">
          {[
            { action: 'back', label: 'Back', icon: <><polyline points="15 18 9 12 15 6"/></> },
            { tab: 'home', label: 'Home', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
            { tab: 'settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.4-1.1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.23 3.5l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .4 1.1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.5 7.23l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.37.36.7.6 1 .31.25.7.4 1.1.4H21a2 2 0 1 1 0 4h-.09c-.4 0-.79.15-1.1.4-.24.3-.46.63-.6 1z"/></> },
            { action: 'pdf', label: 'Share PDF', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></> },
            { action: 'resources', label: 'Resources', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
          ].map(({ tab, action, label, icon }) => {
            const active = tab && activeTab === tab;
            return (
              <button
                key={tab || action}
                onClick={() => {
                  if (action === 'back') setActiveTab('home');
                  if (action === 'pdf') setShowPdfOptions(true);
                  if (action === 'resources') setShowResources(true);
                  if (tab) setActiveTab(tab);
                }}
                className={`flex-1 flex flex-col items-center py-3 transition-all ${active ? 'text-green-600' : 'text-gray-400'}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                <span className="text-xs mt-0.5 font-medium">{label}</span>
                {active && <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"/>}
              </button>
            );
          })}
        </div>
      </div>
      {showBarcodeModal && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Barcode Scanner</h2>
        <button onClick={() => setShowBarcodeModal(false)}>×</button>
      </div>

      <div className="bg-black h-56 rounded-xl flex items-center justify-center mb-4 text-white/60">
        Camera preview
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Camera-based barcode scanning is under construction and not yet available.
      </p>

      <button
        onClick={() => {
          setShowBarcodeModal(false);
          setShowAddForm(true);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded-xl w-full"
      >
        Add Item Manually
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function SettingsTab({ currentUser, API, authHeaders, onLogout }) {
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/account`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Request failed');
      onLogout();
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      {/* Account info */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Name</span>
            <span className="text-gray-700 font-medium">{currentUser?.name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-700 font-medium">{currentUser?.email || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Role</span>
            <span className="text-gray-700 font-medium capitalize">{currentUser?.role || '—'}</span>
          </div>
        </div>
      </div>

      {/* Data & privacy */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Data &amp; Privacy</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your pantry, waste log, recipes, and activity data are stored securely and only visible to you and any dietitian you have shared access with.
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-5">
        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Closing your account frees up your email so you can re-register. Your data is retained internally and can be recovered if you ever return.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Close my account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Close your account?</h3>
            <p className="text-sm text-gray-500 mb-1 leading-relaxed">
              Your email will be released so you can re-register. All your data is kept securely and can be recovered on request.
            </p>
            <p className="text-sm text-gray-500 mb-4">Type <span className="font-bold text-gray-700">DELETE</span> to confirm.</p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmText(''); setError(''); }}
                className="flex-1 border rounded-xl py-2.5 text-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity"
              >
                {deleting ? 'Closing...' : 'Close account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AllRecipesTab({ API, authHeaders, notify, config }) {
  const [recipes, setRecipes]   = useState([]);
  const [search, setSearch]     = useState('');
  const [mealType, setMealType] = useState('');
  const [dietTag, setDietTag]   = useState('');
  const [condition, setCondition] = useState('');
  const CONDITION_TAGS = ['diabetic', 'hypertensive', 'heart-healthy', 'low-glycaemic'];
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  const DIET_TAGS  = config.dietTags;
  const MEAL_TYPES = config.mealTypes;

  useEffect(() => {
  const fetchAll = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)    params.append('search', search);
    if (mealType)  params.append('mealType', mealType);
    if (dietTag)   params.append('dietary', dietTag);
    if (condition) params.append('condition', condition);
    const r = await fetch(`${API}/api/recipes?${params}`, { headers: authHeaders() });
    if (r.ok) setRecipes(await r.json());
    setLoading(false);
  };

  fetchAll();

}, [search, mealType, dietTag, condition]);

  return (
    <div>
      <h2 className="text-base font-bold text-gray-800 mb-1">All recipes</h2>
      <p className="text-xs text-gray-400 mb-3">Browse the full database · {recipes.length} recipes</p>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ingredient..."
        className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-green-500 outline-none" />
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => setMealType('')} className={`text-xs px-3 py-1 rounded-full border ${mealType === '' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'}`}>All meals</button>
        {MEAL_TYPES.map(t => (
          <button key={t} onClick={() => setMealType(t)} className={`text-xs px-3 py-1 rounded-full border ${mealType === t ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'}`}>{t}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => setDietTag('')} className={`text-xs px-3 py-1 rounded-full border ${dietTag === '' ? 'bg-green-500 text-white border-green-500' : 'text-gray-500 border-gray-200'}`}>All diets</button>
        {DIET_TAGS.map(tag => (<button key={tag} onClick={() => setDietTag(dietTag === tag ? '' : tag)} className={`text-xs px-3 py-1 rounded-full border ${dietTag === tag ? 'bg-green-500 text-white border-green-500' : 'text-gray-500 border-gray-200'}`}>{tag}</button>))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setCondition('')} className={`text-xs px-3 py-1 rounded-full border ${condition === '' ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200'}`}>All conditions</button>
        {CONDITION_TAGS.map(tag => (<button key={tag} onClick={() => setCondition(condition === tag ? '' : tag)} className={`text-xs px-3 py-1 rounded-full border ${condition === tag ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200'}`}>{tag}</button>))}
      </div>
      {loading && <p className="text-center text-gray-400 py-8">Loading recipes...</p>}
      {!loading && recipes.map(r => (
        <div key={r.id} onClick={async () => {
          const res = await fetch(`${API}/api/recipes/${r.id}`, { headers: authHeaders() });
          if (res.ok) setSelected({ ...r, ...(await res.json()) });
          else setSelected(r);
        }} className="bg-white rounded-xl border p-4 mb-2 cursor-pointer hover:border-green-300">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-gray-800">{r.name}</span>
                {r.is_local === 1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🇹🇹</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{r.prep_time}min · {r.calories}cal · {r.difficulty}</p>
              {r.meal_type && <p className="text-xs text-blue-500 mt-0.5">{r.meal_type}</p>}
              {r.missing > 0 && r.missingItems?.length > 0 && <p className="text-xs text-red-500 mt-1">Need: {r.missingItems.slice(0,3).join(', ')}</p>}
              {r.dietary_tags && <div className="flex flex-wrap gap-1 mt-1">{r.dietary_tags.split(',').slice(0,2).map(tag=><span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag.trim()}</span>)}</div>}
            </div>
            <RecipeFoodGroupBadge ingredients={recipeBadgeIngredients(r)} size={48} />
          </div>
        </div>
      ))}
      {!loading && recipes.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-sm">No recipes found</p></div>}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selected.name}</h3>
                <p className="text-xs text-gray-400">{selected.prep_time}min · {selected.calories}cal · {selected.difficulty}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            {selected.dietary_tags && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.dietary_tags.split(',').map(tag => (
                  <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            )}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
              {selected.ingredients?.length > 0 ? selected.ingredients.map((ing, i) => (
                <span key={i} className="inline-block text-sm px-2 py-0.5 rounded-full mr-1 mb-1 bg-green-50 text-green-700">
                  {ing.quantity > 0 ? `${parseFloat(ing.quantity).toFixed(2)} ${ing.unit || ''} ${ing.ingredient_name}`.trim() : ing.ingredient_name}
                </span>
              )) : selected.ingredients_text?.split(',').map((ing, i) => (
                <span key={i} className="inline-block text-sm px-2 py-0.5 rounded-full mr-1 mb-1 bg-green-50 text-green-700">{ing.trim()}</span>
              ))}
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Instructions</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selected.instructions}</p>
            </div>
            <button onClick={async () => {
              const cookRes = await fetch(`${API}/api/recipes/${selected.id}/cook`, { method: 'POST', headers: authHeaders() });
              const cookData = await cookRes.json();
              setSelected(null);
              notify(`Recipe cooked — points awarded!${cookData.reduced?.length ? ` Pantry updated: ${cookData.reduced.join(', ')}.` : ''}`);
            }} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">I cooked this!</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesInboxTab({ API, authHeaders, currentUser }) {
  const [messages, setMessages]     = useState([]);
  const [sent, setSent]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('inbox');
  const [compose, setCompose]       = useState(false);
  const [composeMsg, setComposeMsg] = useState('');
  const [sending, setSending]       = useState(false);

  const load = () => {
    Promise.all([
      fetch(`${API}/api/messages`,      { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/api/messages/sent`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
    ]).then(([inbox, sentData]) => { setMessages(inbox); setSent(sentData); setLoading(false); });
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const sendToMyDietitian = async () => {
    if (!composeMsg.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${API}/api/messages/to-dietitian`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          body: composeMsg.trim(),
          type: 'general'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Message could not be sent.');
        return;
      }

      setComposeMsg('');
      setCompose(false);
      load();
    } catch (err) {
      console.error('Send to dietitian error:', err);
      alert('Unable to send message. Check backend connection.');
    } finally {
      setSending(false);
    }
  };

  const thread = [
    ...messages.map(m => ({ ...m, _side: 'in' })),
    ...sent.map(m => ({ ...m, _side: 'out' }))
  ].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

  return (
    <div className="bg-white rounded-xl border flex flex-col min-h-[560px]">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h2 className="text-base font-bold text-gray-800">Chat with Dietitian Portal</h2>
        <p className="text-xs text-gray-400">Your messages and dietitian replies are shown in one conversation.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>}
        {!loading && thread.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p className="text-sm">No messages yet</p>
          </div>
        )}
        {!loading && thread.map((m, i) => (
          <div key={i} className={`flex ${m._side === 'out' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-3 max-w-xs md:max-w-sm ${m._side === 'out' ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
              <p className={`text-xs mb-1 ${m._side === 'out' ? 'text-green-100' : 'text-gray-400'}`}>
                {m._side === 'out' ? 'You' : (m.sender_name || 'Dietitian')} · {new Date(m.sent_at).toLocaleDateString('en-TT', { day:'numeric', month:'short' })}
              </p>
              {m.type === 'recipe_recommendation' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-1 inline-block">Recipe from your dietitian</span>}
              <p className="text-sm leading-relaxed">{m.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t bg-white p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Message your dietitian</p>
        <div className="flex items-end gap-2">
          <textarea value={composeMsg} onChange={e => setComposeMsg(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendToMyDietitian(); } }} rows={3} placeholder="Type your message..." className="flex-1 border rounded-2xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-green-500 outline-none"/>
          <button onClick={sendToMyDietitian} disabled={!composeMsg.trim() || sending} className="bg-green-500 text-white px-5 py-3 rounded-2xl text-sm font-medium disabled:opacity-40">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbRecipes, setDbRecipes]     = useState([]);
  const [config, setConfig]           = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setCurrentUser({ id: payload.id, name: payload.name, role: payload.role });
          if (payload.role === 'dietician') fetchRecipesForDietitian();
        } else { localStorage.removeItem('token'); }
      } catch { localStorage.removeItem('token'); }
    }
  }, []); 

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API}/api/config`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setConfig(data))
      .catch(() => setConfig({ days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], mealSlots: ['breakfast','lunch','dinner','snack'], dietTags: [], mealTypes: ['breakfast','lunch','dinner','snack'] }));
  }, [currentUser]); 

  const fetchRecipesForDietitian = async () => {
    const r = await fetch(`${API}/api/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (r.ok) setDbRecipes(await r.json());
  };

  const login = async (user) => {
    setCurrentUser(user);
    if (user.role === 'dietician') {
      const r = await fetch(`${API}/api/recipes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (r.ok) setDbRecipes(await r.json());
    }
  };

  const logout = () => { setCurrentUser(null); setDbRecipes([]); setConfig(null); localStorage.removeItem('token'); };

  if (!currentUser) return <AuthScreen onLogin={login} />;
  if (!config)      return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;

  if (currentUser.role === 'dietician') return <DietitianDashboard currentUser={currentUser} onLogout={logout} dbRecipes={dbRecipes} config={config} />;
  return <HouseholdDashboard currentUser={currentUser} onLogout={logout} config={config} />;
}