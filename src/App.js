import React, { useState } from 'react';
import { Plus, Scan, Trash2, Calendar, Package, AlertCircle, ChefHat, Clock, Users, Leaf, Share2, Bell, BookOpen, LogOut, CheckCircle, XCircle, Send, Eye } from 'lucide-react';

// ─── MOCK USERS ───────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: 'Rachel Salandy',   email: 'rachel@example.com', password: 'pass123', role: 'user' },
  { id: 2, name: 'Dr. Maria Joseph', email: 'dr.joseph@ttan.tt',  password: 'ttan123', role: 'nutritionist' },
];

// ─── RECIPE DATABASE ──────────────────────────────────────────────────────────
const LOCAL_RECIPES = [
  {
    id: 101, name: 'Trinidadian Pelau', requiredItems: ['chicken', 'rice', 'pigeon peas'],
    optionalItems: ['coconut milk', 'pumpkin', 'carrots'],
    ingredients: [
      { item: '1 lb chicken pieces', perServing: 8 },
      { item: '1 cup parboiled rice', perServing: 1 },
      { item: '1 can pigeon peas', perServing: 1 },
      { item: '1 cup coconut milk', perServing: 1 },
      { item: 'Green seasoning, salt & pepper', perServing: 0 },
    ],
    instructions: [
      'Brown sugar in a heavy pot until caramel, then brown seasoned chicken',
      'Add peas, rice, coconut milk and 2 cups water',
      'Season with green seasoning, salt and pepper',
      'Cover and cook on low heat 25–30 min until rice is fluffy',
    ],
    prepTime: 40, baseServings: 4, calories: 420,
    healthBenefits: ['High protein', 'Complex carbs', 'Local favourite'],
    difficulty: 'Medium', dietaryTags: ['high-protein'],
  },
  {
    id: 102, name: 'Callaloo Soup', requiredItems: ['dasheen bush', 'okra', 'coconut milk'],
    optionalItems: ['crab', 'pumpkin', 'saltfish'],
    ingredients: [
      { item: '1 bunch dasheen bush leaves', perServing: 1 },
      { item: '6 okra, sliced', perServing: 6 },
      { item: '1 cup coconut milk', perServing: 1 },
      { item: 'Pumpkin, onion, garlic to taste', perServing: 0 },
    ],
    instructions: [
      'Chop dasheen leaves and combine with okra, pumpkin and seasonings',
      'Add coconut milk and enough water to cover',
      'Boil 20 min, then blend smooth',
      'Return to pot, adjust seasoning and simmer 5 min',
    ],
    prepTime: 30, baseServings: 4, calories: 180,
    healthBenefits: ['Iron-rich', 'High fibre', 'Traditional superfood'],
    difficulty: 'Easy', dietaryTags: ['vegan', 'vegetarian'],
  },
  {
    id: 103, name: 'Stew Chicken & Rice', requiredItems: ['chicken', 'rice'],
    optionalItems: ['tomato', 'onion', 'carrots'],
    ingredients: [
      { item: '1 lb chicken pieces', perServing: 8 },
      { item: '1 cup white rice', perServing: 1 },
      { item: '1 tomato, chopped', perServing: 1 },
      { item: 'Browning, green seasoning, garlic', perServing: 0 },
    ],
    instructions: [
      'Marinate chicken in green seasoning overnight if possible',
      'Brown chicken in oil with a little browning sauce',
      'Add tomato, onion, water and simmer 25 min',
      'Cook rice separately and serve alongside',
    ],
    prepTime: 35, baseServings: 3, calories: 390,
    healthBenefits: ['High protein', 'Comfort food', 'Family-friendly'],
    difficulty: 'Medium', dietaryTags: ['high-protein'],
  },
];

const IMPORTED_RECIPES = [
  {
    id: 1, name: 'Protein-Packed Scrambled Eggs', requiredItems: ['eggs'],
    optionalItems: ['milk', 'cheese'],
    ingredients: [
      { item: '3 eggs', perServing: 3 }, { item: '2 tbsp milk', perServing: 2 },
      { item: 'Salt & pepper', perServing: 0 }, { item: '1 tbsp butter', perServing: 1 },
    ],
    instructions: ['Beat eggs with milk', 'Heat butter in pan', 'Pour eggs, stir gently until just set', 'Season and serve'],
    prepTime: 10, baseServings: 1, calories: 280,
    healthBenefits: ['High protein', 'Quick energy'], difficulty: 'Easy', dietaryTags: ['vegetarian', 'high-protein', 'keto'],
  },
  {
    id: 2, name: 'Overnight Oats', requiredItems: ['oats', 'milk'],
    optionalItems: ['berries', 'honey', 'banana'],
    ingredients: [
      { item: '½ cup rolled oats', perServing: 0.5 }, { item: '½ cup milk', perServing: 0.5 }, { item: '1 tbsp honey', perServing: 1 },
    ],
    instructions: ['Mix oats and milk', 'Add honey', 'Refrigerate overnight', 'Top with fruit before serving'],
    prepTime: 5, baseServings: 1, calories: 290,
    healthBenefits: ['Sustained energy', 'High fibre'], difficulty: 'Easy', dietaryTags: ['vegetarian'],
  },
  {
    id: 3, name: 'Rainbow Veggie Stir-Fry', requiredItems: ['broccoli', 'carrots'],
    optionalItems: ['bell pepper', 'rice', 'soy sauce'],
    ingredients: [
      { item: '2 cups mixed vegetables', perServing: 2 }, { item: '2 tbsp oil', perServing: 2 },
      { item: '2 cloves garlic', perServing: 2 }, { item: '1 tbsp soy sauce', perServing: 1 },
    ],
    instructions: ['Heat oil', 'Fry garlic 30 sec', 'Add veg, stir-fry 5–7 min', 'Add soy sauce, serve over rice'],
    prepTime: 15, baseServings: 2, calories: 180,
    healthBenefits: ['Low calorie', 'High fibre'], difficulty: 'Easy', dietaryTags: ['vegan', 'vegetarian'],
  },
];

const ALL_RECIPES    = [...LOCAL_RECIPES, ...IMPORTED_RECIPES];
const STAPLES        = ['salt','pepper','sugar','oil','olive oil','garlic','onion','butter','green seasoning','browning'];

// ─── DEMO SCAN QUEUE (rotates on each press) ──────────────────────────────────
const DEMO_SCAN_QUEUE = [
  { name: 'Coconut Milk',      category: 'Pantry', quantity: 1, unit: 'can',       expiryDate: '2027-01-01' },
  { name: 'Pigeon Peas',       category: 'Pantry', quantity: 1, unit: 'can',       expiryDate: '2027-06-01' },
  { name: 'Whole Wheat Bread', category: 'Bakery', quantity: 1, unit: 'loaf',      expiryDate: '2026-02-26' },
  { name: 'Greek Yogurt',      category: 'Dairy',  quantity: 1, unit: 'container', expiryDate: '2026-03-05' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const TODAY = new Date('2026-02-20');

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - TODAY) / 86400000);
}
function expiryStatus(days) {
  if (days < 0)  return { label: 'Expired',       cls: 'bg-red-100 text-red-800 border-red-200' };
  if (days <= 3) return { label: `${days}d left`,  cls: 'bg-orange-100 text-orange-800 border-orange-200' };
  if (days <= 7) return { label: `${days}d left`,  cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  return           { label: `${days}d left`,       cls: 'bg-green-100 text-green-800 border-green-200' };
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [name, setName]     = useState('');
  const [role, setRole]     = useState('user');
  const [error, setError]   = useState('');

  const submit = () => {
    if (mode === 'login') {
      const u = MOCK_USERS.find(u => u.email === email && u.password === pass);
      u ? onLogin(u) : setError('Incorrect email or password.');
    } else {
      if (!name || !email || !pass) { setError('Please fill in all fields.'); return; }
      onLogin({ id: Date.now(), name, email, password: pass, role });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🥦 WasteLess PantryMate</h1>
          <p className="text-gray-500 text-sm mt-1">Smart food management for T&T households</p>
        </div>
        <div className="flex gap-2 mb-6">
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${mode===m?'bg-green-500 text-white shadow':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m==='login'?'Sign In':'Create Account'}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="space-y-4">
          {mode==='register' && <>
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">I am a</label>
              <select value={role} onChange={e=>setRole(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="user">Household User</option>
                <option value="nutritionist">Nutritionist / Healthcare Provider</option>
              </select>
            </div>
          </>}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
          </div>
          <button onClick={submit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            {mode==='login'?'Sign In':'Create Account'}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Demo — User: <span className="font-mono">rachel@example.com / pass123</span>
          &nbsp;·&nbsp;Nutritionist: <span className="font-mono">dr.joseph@ttan.tt / ttan123</span>
        </p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// NUTRITIONIST DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function NutritionistDashboard({ currentUser, sharedProfiles, onLogout }) {
  const [selected, setSelected]   = useState(null);
  const [panel, setPanel]         = useState('progress');
  const [noteText, setNoteText]   = useState('');
  const [planText, setPlanText]   = useState('');
  const [sent, setSent]           = useState([]);

  const sendMsg = (type) => {
    const body = type==='note' ? noteText : planText;
    if (!body.trim() || !selected) return;
    setSent(s => [...s, { id: Date.now(), to: selected.userId, type, body, time: new Date().toLocaleTimeString() }]);
    type==='note' ? setNoteText('') : setPlanText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nutritionist Portal</h1>
            <p className="text-gray-500 text-sm">Welcome, {currentUser.name} · TTAN</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm">
            <LogOut size={16}/> Sign Out
          </button>
        </div>

        {sharedProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-40"/>
            <p className="font-semibold text-lg">No shared profiles yet</p>
            <p className="text-sm mt-1">Patients appear here once they enable sharing from their app.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Patient list */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Patients</p>
              {sharedProfiles.map(p => (
                <button key={p.userId} onClick={() => setSelected(p)}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${selected?.userId===p.userId?'bg-green-500 text-white':'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className={`text-xs mt-0.5 ${selected?.userId===p.userId?'text-green-100':'text-gray-400'}`}>
                    {p.items.length} pantry items · {p.wasteLog.filter(e=>e.action==='wasted').length} waste events
                  </p>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="md:col-span-2 space-y-4">
              {selected ? <>
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex gap-2 mb-4">
                    {[['progress','Progress'],['remind','Reminder'],['mealplan','Meal Plan']].map(([k,lbl]) => (
                      <button key={k} onClick={()=>setPanel(k)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${panel===k?'bg-green-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>

                  {panel==='progress' && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">{selected.name} — Overview</h3>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          ['Pantry Items', selected.items.length, 'blue'],
                          ['Used',         selected.wasteLog.filter(e=>e.action==='used').length,   'green'],
                          ['Wasted',       selected.wasteLog.filter(e=>e.action==='wasted').length, 'red'],
                        ].map(([lbl,val,col]) => (
                          <div key={lbl} className={`bg-${col}-50 rounded-xl p-3 text-center`}>
                            <p className={`text-2xl font-bold text-${col}-600`}>{val}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{lbl}</p>
                          </div>
                        ))}
                      </div>
                      {selected.wasteLog.length > 0 && <>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {[...selected.wasteLog].reverse().slice(0,8).map(e => (
                            <div key={e.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${e.action==='used'?'bg-green-50':'bg-red-50'}`}>
                              {e.action==='used'
                                ? <CheckCircle size={15} className="text-green-500 shrink-0"/>
                                : <XCircle    size={15} className="text-red-500 shrink-0"/>}
                              <span className="text-sm text-gray-700 flex-1">{e.itemName}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.action==='used'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{e.action}</span>
                            </div>
                          ))}
                        </div>
                      </>}
                    </div>
                  )}

                  {panel==='remind' && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Send Reminder to {selected.name}</h3>
                      <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4} resize="none"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="e.g. Great progress this week! Try to use the chicken before Friday — I noticed it's expiring soon."/>
                      <button onClick={()=>sendMsg('note')}
                        className="mt-3 w-full bg-green-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                        <Send size={16}/> Send Reminder
                      </button>
                    </div>
                  )}

                  {panel==='mealplan' && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Push Meal Plan to {selected.name}</h3>
                      <textarea value={planText} onChange={e=>setPlanText(e.target.value)} rows={7}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder={"Monday: Pelau with steamed vegetables\nTuesday: Callaloo soup + whole grain bread\nWednesday: Grilled fish + provision\nThursday: Stew chicken & rice\nFriday: Vegetable stir-fry"}/>
                      <button onClick={()=>sendMsg('mealplan')}
                        className="mt-3 w-full bg-blue-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                        <BookOpen size={16}/> Send Meal Plan
                      </button>
                    </div>
                  )}
                </div>

                {/* Sent log */}
                {sent.filter(m=>m.to===selected.userId).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sent</p>
                    <div className="space-y-2">
                      {sent.filter(m=>m.to===selected.userId).map(m => (
                        <div key={m.id} className={`p-3 rounded-xl text-sm ${m.type==='note'?'bg-yellow-50 border border-yellow-200':'bg-blue-50 border border-blue-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-semibold uppercase ${m.type==='note'?'text-yellow-600':'text-blue-600'}`}>{m.type==='note'?'Reminder':'Meal Plan'}</span>
                            <span className="text-xs text-gray-400">{m.time}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{m.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </> : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-400">
                  <Eye size={40} className="mx-auto mb-3 opacity-40"/>
                  <p className="font-semibold">Select a patient to view their data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN USER APP
// ═════════════════════════════════════════════════════════════════════════════
export default function PantryMate() {
  const [currentUser, setCurrentUser]           = useState(null);
  const [sharedProfiles, setSharedProfiles]     = useState([]);
  const [activeTab, setActiveTab]               = useState('pantry');

  // Pantry state
  const [items, setItems] = useState([
    { id:1, name:'Milk',    category:'Dairy',  quantity:1,  unit:'carton', expiryDate:'2026-02-22', addedDate:'2026-02-15' },
    { id:2, name:'Bread',   category:'Bakery', quantity:1,  unit:'loaf',   expiryDate:'2026-02-21', addedDate:'2026-02-18' },
    { id:3, name:'Eggs',    category:'Dairy',  quantity:12, unit:'count',  expiryDate:'2026-03-01', addedDate:'2026-02-15' },
    { id:4, name:'Chicken', category:'Meat',   quantity:2,  unit:'lb',     expiryDate:'2026-02-23', addedDate:'2026-02-19' },
    { id:5, name:'Rice',    category:'Pantry', quantity:1,  unit:'bag',    expiryDate:'2026-12-01', addedDate:'2026-02-10' },
  ]);

  // ── Waste log ──────────────────────────────────────────────────────────────
  const [wasteLog, setWasteLog]         = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null); // item waiting for used/wasted choice

  // ── Other UI state ─────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm]       = useState(false);
  const [newItem, setNewItem]               = useState({ name:'', category:'Other', quantity:1, unit:'item', expiryDate:'' });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings]             = useState({});
  const [dietFilter, setDietFilter]         = useState([]);
  const [showExpiring, setShowExpiring]     = useState(false);
  const [sharingOn, setSharingOn]           = useState(false);
  const [scanIdx, setScanIdx]               = useState(0);
  const [inboxMessages, setInboxMessages]   = useState([]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = (user) => {
    setCurrentUser(user);
    if (user.role === 'user') {
      setInboxMessages([{
        id: 1, type: 'mealplan', from: 'Dr. Maria Joseph',
        body: 'Monday: Pelau with steamed vegetables\nTuesday: Callaloo soup + whole grain bread\nWednesday: Grilled fish + provision\nThursday: Stew chicken & rice\nFriday: Vegetable stir-fry',
        time: 'Earlier today',
      }]);
    }
  };
  const logout = () => { setCurrentUser(null); setSharingOn(false); };

  // ── Shared profile sync ────────────────────────────────────────────────────
  const pushToShared = (nextItems, nextLog) => {
    if (!sharingOn || !currentUser) return;
    setSharedProfiles(prev => {
      const others = prev.filter(p => p.userId !== currentUser.id);
      return [...others, { userId: currentUser.id, name: currentUser.name, items: nextItems, wasteLog: nextLog }];
    });
  };

  const toggleSharing = () => {
    if (!sharingOn) {
      setSharedProfiles(prev => {
        const others = prev.filter(p => p.userId !== currentUser.id);
        return [...others, { userId: currentUser.id, name: currentUser.name, items, wasteLog }];
      });
      setSharingOn(true);
    } else {
      setSharedProfiles(prev => prev.filter(p => p.userId !== currentUser.id));
      setSharingOn(false);
    }
  };

  // ── Waste tracking: two-step delete ───────────────────────────────────────
  const requestDelete  = (item) => setPendingDelete(item);

  const confirmDelete = (action) => {                          // action = 'used' | 'wasted'
    if (!pendingDelete) return;
    const entry    = { id: Date.now(), itemName: pendingDelete.name, action, date: TODAY.toISOString().split('T')[0] };
    const nextLog  = [...wasteLog, entry];
    const nextItems = items.filter(i => i.id !== pendingDelete.id);
    setWasteLog(nextLog);
    setItems(nextItems);
    pushToShared(nextItems, nextLog);
    setPendingDelete(null);
  };

  // ── Add item ───────────────────────────────────────────────────────────────
  const addItem = () => {
    if (!newItem.name || !newItem.expiryDate) { alert('Please fill in item name and expiry date'); return; }
    const next = [...items, { id: Date.now(), ...newItem, addedDate: TODAY.toISOString().split('T')[0] }];
    setItems(next);
    pushToShared(next, wasteLog);
    setNewItem({ name:'', category:'Other', quantity:1, unit:'item', expiryDate:'' });
    setShowAddForm(false);
  };

  // ── Barcode scan (demo — rotates through queue) ────────────────────────────
  const scanBarcode = () => {
    const scanned = DEMO_SCAN_QUEUE[scanIdx % DEMO_SCAN_QUEUE.length];
    const next = [...items, { id: Date.now(), ...scanned, addedDate: TODAY.toISOString().split('T')[0] }];
    setItems(next);
    pushToShared(next, wasteLog);
    setScanIdx(i => i + 1);
  };

  // ── Recipe matching ────────────────────────────────────────────────────────
  const pantryNames = items.map(i => i.name.toLowerCase());
  const available   = [...pantryNames, ...STAPLES];

  const matchedRecipes = ALL_RECIPES
    .map(r => {
      const missing = r.requiredItems.filter(req =>
        !available.some(p => p.includes(req.toLowerCase()) || req.toLowerCase().includes(p))
      );
      const hasNonStaple = r.requiredItems.some(req => {
        const isStaple = STAPLES.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s));
        return !isStaple && pantryNames.some(p => p.includes(req.toLowerCase()) || req.toLowerCase().includes(p));
      });
      const optional = r.optionalItems.filter(o =>
        available.some(p => p.includes(o.toLowerCase()) || o.toLowerCase().includes(p))
      );
      const meetsFilter = dietFilter.every(d => r.dietaryTags.includes(d));
      const canMake     = missing.length === 0;
      if (!meetsFilter) return null;
      if (!canMake && !(missing.length <= 3 && hasNonStaple)) return null;
      return { ...r, canMake, missingItems: missing, matchScore: canMake ? 10 + optional.length : 5 - missing.length };
    })
    .filter(Boolean)
    .sort((a,b) => b.matchScore - a.matchScore);

  const getIngredients = (recipe) => {
    const m = servings[recipe.id] || 1;
    return recipe.ingredients.map(ing => ({
      ...ing,
      item: ing.perServing > 0
        ? `${(ing.perServing * m).toFixed(1)} ${ing.item.split(' ').slice(1).join(' ')}`
        : ing.item
    }));
  };

  // ── Computed stats ─────────────────────────────────────────────────────────
  const sorted       = [...items].sort((a,b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  const expiringSoon = items.filter(i => { const d = daysUntil(i.expiryDate); return d>=0 && d<=7; }).length;
  const usedCount    = wasteLog.filter(e => e.action==='used').length;
  const wastedCount  = wasteLog.filter(e => e.action==='wasted').length;
  const saveRate     = wasteLog.length > 0 ? Math.round(usedCount / wasteLog.length * 100) : null;

  const CATS  = ['Dairy','Bakery','Produce','Meat','Pantry','Frozen','Other'];
  const UNITS = ['item','count','lb','kg','oz','g','bottle','carton','loaf','bag','can'];

  // ── Gate renders ───────────────────────────────────────────────────────────
  if (!currentUser) return <AuthScreen onLogin={login} />;
  if (currentUser.role === 'nutritionist')
    return <NutritionistDashboard currentUser={currentUser} sharedProfiles={sharedProfiles} onLogout={logout} />;

  // ── User view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Used / Wasted modal ── */}
        {pendingDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Removing: <span className="text-green-600">{pendingDelete.name}</span></h3>
              <p className="text-gray-500 text-sm mb-6">Did you use this or was it wasted? This helps track your food habits.</p>
              <div className="flex gap-3">
                <button onClick={()=>confirmDelete('used')}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                  <CheckCircle size={20}/> Used It
                </button>
                <button onClick={()=>confirmDelete('wasted')}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors">
                  <XCircle size={20}/> Wasted
                </button>
              </div>
              <button onClick={()=>setPendingDelete(null)} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 text-center">Cancel</button>
            </div>
          </div>
        )}

        {/* ── App header ── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🥦 WasteLess PantryMate</h1>
              <p className="text-gray-500 text-sm">Welcome, {currentUser.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleSharing}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${sharingOn?'bg-blue-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Share2 size={15}/>{sharingOn?'Shared':'Share'}
              </button>
              <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                <LogOut size={18}/>
              </button>
            </div>
          </div>

          {sharingOn && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
              <Eye size={15} className="mt-0.5 shrink-0"/>
              Your pantry and waste log are visible to your nutritionist. They can send you reminders and meal plans.
            </div>
          )}

          {/* Inbox */}
          {inboxMessages.length > 0 && (
            <div className="mb-4 space-y-2">
              {inboxMessages.map(m => (
                <div key={m.id} className={`p-3 rounded-xl border text-sm ${m.type==='mealplan'?'bg-purple-50 border-purple-200':'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell size={13} className={m.type==='mealplan'?'text-purple-500':'text-yellow-500'}/>
                    <span className="font-semibold text-gray-700 text-xs">{m.from}</span>
                    <span className="text-xs text-gray-400 ml-auto">{m.time}</span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line text-xs">{m.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-2 mb-4">
            {[
              ['pantry',  'Pantry',              <Package size={16}/>],
              ['recipes', `Recipes (${matchedRecipes.length})`, <ChefHat size={16}/>],
              ['stats',   'My Stats',             <Leaf size={16}/>],
            ].map(([tab,lbl,icon]) => (
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab===tab?'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {icon}{lbl}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1"><Package size={16}/><span className="text-xs opacity-80">Total Items</span></div>
              <div className="text-3xl font-bold">{items.length}</div>
            </div>
            <button onClick={()=>setShowExpiring(!showExpiring)}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-left hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 mb-1"><AlertCircle size={16}/><span className="text-xs opacity-80">Expiring Soon</span></div>
              <div className="text-3xl font-bold">{expiringSoon}</div>
            </button>
          </div>
        </div>

        {/* Expiring panel */}
        {showExpiring && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Expiring Soon</h2>
              <button onClick={()=>setShowExpiring(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            {sorted.filter(i=>{ const d=daysUntil(i.expiryDate); return d>=0&&d<=7; }).length===0
              ? <p className="text-center text-green-600 font-semibold py-4">🎉 Nothing expiring soon!</p>
              : <div className="space-y-2">
                {sorted.filter(i=>{ const d=daysUntil(i.expiryDate); return d>=0&&d<=7; }).map(item => {
                  const s = expiryStatus(daysUntil(item.expiryDate));
                  return (
                    <div key={item.id} className="flex items-center justify-between border border-orange-200 rounded-xl p-3">
                      <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* ══ PANTRY TAB ══ */}
        {activeTab==='pantry' && <>
          <div className="flex gap-3 mb-4">
            <button onClick={()=>setShowAddForm(!showAddForm)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all">
              <Plus size={20}/> Add Item
            </button>
            <button onClick={scanBarcode}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all">
              <Scan size={20}/> Scan Barcode
              <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full">Demo</span>
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Item</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}
                    placeholder="e.g. Chicken, Dasheen, Oats"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" min="1" value={newItem.quantity}
                    onChange={e=>setNewItem({...newItem,quantity:parseInt(e.target.value)||1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={newItem.expiryDate}
                    onChange={e=>setNewItem({...newItem,expiryDate:e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={addItem} className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-colors">Add to Pantry</button>
                <button onClick={()=>setShowAddForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pantry Inventory</h2>
            {sorted.length===0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-40"/>
                <p>Your pantry is empty. Add some items!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map(item => {
                  const s = expiryStatus(daysUntil(item.expiryDate));
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{item.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-gray-500">{item.category} · {item.quantity} {item.unit} · Expires {new Date(item.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <button onClick={()=>requestDelete(item)} className="ml-4 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>}

        {/* ══ RECIPES TAB ══ */}
        {activeTab==='recipes' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChefHat size={24} className="text-green-600"/>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Recipe Suggestions</h2>
                <p className="text-xs text-gray-500">Based on your pantry · 🇹🇹 local & international</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {['vegan','vegetarian','keto','high-protein','low-salt'].map(d => (
                <button key={d} onClick={()=>setDietFilter(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${dietFilter.includes(d)?'bg-green-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {d.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {matchedRecipes.length===0
              ? <p className="text-center text-gray-400 py-8 text-sm">No matches — try adding more pantry items or clearing filters.</p>
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedRecipes.map(recipe => {
                  const mult     = servings[recipe.id] || 1;
                  const srvCount = recipe.baseServings * mult;
                  const isLocal  = recipe.id >= 101;
                  return (
                    <div key={recipe.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all ${recipe.canMake?'border-gray-200 hover:border-green-400':'border-orange-200 bg-orange-50'}`}
                      onClick={e=>{ if(!e.target.closest('.srv')) setSelectedRecipe(recipe.id===selectedRecipe?null:recipe.id); }}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex-1 leading-snug text-sm">{recipe.name}</h3>
                        <div className="flex gap-1 ml-2 shrink-0 flex-wrap justify-end">
                          {isLocal && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">🇹🇹</span>}
                          {!recipe.canMake && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">Need {recipe.missingItems.length}</span>}
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{recipe.difficulty}</span>
                        </div>
                      </div>

                      {!recipe.canMake && (
                        <div className="mb-2 p-2 bg-white rounded-lg border border-orange-200">
                          <p className="text-xs text-orange-700 font-semibold mb-1">Missing:</p>
                          <div className="flex flex-wrap gap-1">
                            {recipe.missingItems.map((m,i)=><span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{m}</span>)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock size={12}/>{recipe.prepTime} min</span>
                        <span className="flex items-center gap-1"><Leaf size={12}/>{recipe.calories} cal</span>
                      </div>

                      {/* Serving adjuster */}
                      <div className="srv flex items-center gap-2 mb-3" onClick={e=>e.stopPropagation()}>
                        <span className="text-xs text-gray-500">Servings:</span>
                        <button onClick={()=>setServings(p=>({...p,[recipe.id]:Math.max(1,(p[recipe.id]||1)-1)}))} className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm hover:bg-gray-300">−</button>
                        <span className="font-semibold text-sm text-gray-800 min-w-[2rem] text-center">{srvCount}</span>
                        <button onClick={()=>setServings(p=>({...p,[recipe.id]:Math.min(10,(p[recipe.id]||1)+1)}))} className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm hover:bg-gray-300">+</button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-1">
                        {recipe.healthBenefits.map((b,i)=><span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{b}</span>)}
                      </div>

                      {selectedRecipe===recipe.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="font-semibold text-gray-800 mb-2 text-sm">Ingredients ({srvCount} serving{srvCount>1?'s':''}):</p>
                          <ul className="text-sm text-gray-600 mb-3 space-y-0.5">
                            {getIngredients(recipe).map((ing,i)=><li key={i}>• {ing.item}</li>)}
                          </ul>
                          <p className="font-semibold text-gray-800 mb-2 text-sm">Instructions:</p>
                          <ol className="text-sm text-gray-600 space-y-1.5">
                            {recipe.instructions.map((step,i)=>(
                              <li key={i} className="flex gap-2"><span className="text-green-600 font-bold shrink-0">{i+1}.</span><span>{step}</span></li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* ══ STATS TAB ══ */}
        {activeTab==='stats' && (
          <div className="space-y-4">

            {/* Waste summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Leaf size={24} className="text-green-600"/>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Waste Tracker</h2>
                  <p className="text-xs text-gray-500">Every item removal is logged here automatically</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{usedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Items Used</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{wastedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Items Wasted</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{saveRate!==null?`${saveRate}%`:'—'}</p>
                  <p className="text-xs text-gray-500 mt-1">Save Rate</p>
                </div>
              </div>

              {saveRate!==null && (
                <div className={`rounded-xl p-4 text-sm font-semibold ${saveRate>=70?'bg-green-50 border border-green-200 text-green-700':saveRate>=40?'bg-yellow-50 border border-yellow-200 text-yellow-700':'bg-red-50 border border-red-200 text-red-700'}`}>
                  {saveRate>=70 ? '🌟 Excellent — you\'re using most of what you buy!'
                    : saveRate>=40 ? '👍 Good progress — check expiry dates regularly.'
                    : '⚠️ A lot is being wasted — try the recipe suggestions to use items up!'}
                </div>
              )}

              {wasteLog.length===0 && (
                <p className="text-center text-gray-400 text-sm py-4">
                  No activity yet. Remove items from your pantry to start tracking.
                </p>
              )}
            </div>

            {/* Activity log */}
            {wasteLog.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">Activity Log</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {[...wasteLog].reverse().map(e => (
                    <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl ${e.action==='used'?'bg-green-50':'bg-red-50'}`}>
                      {e.action==='used'
                        ? <CheckCircle size={16} className="text-green-500 shrink-0"/>
                        : <XCircle    size={16} className="text-red-500 shrink-0"/>}
                      <span className="text-sm text-gray-700 flex-1">{e.itemName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.action==='used'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{e.action}</span>
                      <span className="text-xs text-gray-400 shrink-0">{e.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share toggle */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">Share with Nutritionist</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Allow your nutritionist to view your pantry and waste data</p>
                </div>
                <button onClick={toggleSharing}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${sharingOn?'bg-green-500':'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${sharingOn?'translate-x-7':'translate-x-0.5'}`}/>
                </button>
              </div>
              {sharingOn
                ? <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg p-3">✓ Active — your nutritionist can see your pantry inventory and used/wasted activity in real time.</p>
                : <p className="text-gray-400 text-xs">Off — only you can see your data.</p>
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
