import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { LeafIcon, LogoFull, LogoWordmarkStacked } from './Logo';

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

function AuthScreen({ onLogin }) {
  const [mode, setMode]       = useState('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [role, setRole]       = useState('user');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoWordmarkStacked size="lg" />
          </div>
          <p className="text-gray-400 text-sm mt-2">Smart food management for T&amp;T households</p>
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
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Rachel Salandy" />
          </div>
        )}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="you@example.com" />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="••••••••" />
        </div>
        {mode === 'register' && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">I am registering as</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="user">Household User</option>
              <option value="dietician">Dietitian / Healthcare Provider</option>
            </select>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <button onClick={submit} disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}

function DietitianDashboard({ currentUser, onLogout, dbRecipes, config }) {
  const [patients, setPatients]           = useState([]);
  const [selected, setSelected]           = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');
  const [msgBody, setMsgBody]             = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [goal, setGoal]                   = useState('');
  const [mealPlan, setMealPlan]           = useState({});
  const [notification, setNotification]   = useState('');

  const DAYS  = config.days;
  const SLOTS = config.mealSlots;

  useEffect(() => { fetchPatients(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatients = async () => {
    const res = await fetch(`${API}/api/sharing/patients`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) { setPatients(data); if (data.length) setSelected(data[0]); }
  };

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  const sendMessage = async () => {
    if (!msgBody.trim() || !selected) return;
    await fetch(`${API}/api/messages`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ toUserId: selected.userId, body: msgBody, type: 'reminder' })
    });
    setMsgBody(''); notify('Message sent!');
  };

  const saveRecord = async () => {
    if (!selected) return;
    await fetch(`${API}/api/sharing/patient-record`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ userId: selected.userId, currentGoal: goal, clinicalNotes })
    });
    notify('Record saved!');
  };

  const pushMealPlan = async () => {
    if (!selected) return;
    await fetch(`${API}/api/mealplanner/push`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ patientId: selected.userId, planData: mealPlan })
    });
    notify('Meal plan pushed to patient!');
  };

  const saveRate = (p) => {
    if (!p) return 0;
    const total = p.wasteLog?.length || 0;
    const used  = p.wasteLog?.filter(w => w.action === 'used').length || 0;
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const recipes = dbRecipes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">{notification}</div>
      )}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dietitian Portal</h1>
          <p className="text-sm text-gray-500">Welcome, {currentUser.name}</p>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500 px-4 py-2 border rounded-lg">Sign out</button>
      </div>
      <div className="flex h-screen">
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Patients ({patients.length})</p>
          {patients.length === 0 && <p className="text-sm text-gray-400">No patients sharing data yet</p>}
          {patients.map(p => (
            <button key={p.userId} onClick={() => { setSelected(p); setActiveTab('overview'); }}
              className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${selected?.userId === p.userId ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}>
              <p className="font-medium text-sm text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">{p.items?.length || 0} pantry items · {saveRate(p)}% save rate</p>
            </button>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400"><p>Select a patient to view their data</p></div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
                {saveRate(selected) < 50 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm">
                    ⚠️ High waste rate — {100 - saveRate(selected)}% of items wasted
                  </div>
                )}
              </div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['overview','messages','mealplan','goals','recipes'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? 'bg-green-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border">
                    <h3 className="font-semibold text-gray-700 mb-3">Pantry ({selected.items?.length || 0} items)</h3>
                    {selected.items?.slice(0, 8).map((item, i) => {
                      const badge = expiryBadge(item);
                      return (
                        <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="text-sm text-gray-700">{item.name}</span>
                          {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white rounded-xl p-4 border">
                    <h3 className="font-semibold text-gray-700 mb-3">Waste activity</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{selected.wasteLog?.filter(w => w.action === 'used').length || 0}</p>
                        <p className="text-xs text-green-600">Used</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-500">{selected.wasteLog?.filter(w => w.action === 'wasted').length || 0}</p>
                        <p className="text-xs text-red-500">Wasted</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{saveRate(selected)}%</p>
                        <p className="text-xs text-blue-600">Save rate</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">Clinical notes</h3>
                    <textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} rows={3}
                      placeholder="Add clinical notes..."
                      className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                    <button onClick={saveRecord} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Save notes</button>
                  </div>
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="bg-white rounded-xl p-4 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Send message to {selected.name}</h3>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {selected.messages?.map((m, i) => (
                      <div key={i} className={`p-3 rounded-xl text-sm ${m.from_user_id === currentUser.id ? 'bg-green-50 text-green-800 ml-8' : 'bg-gray-50 text-gray-700 mr-8'}`}>
                        <p className="font-medium text-xs mb-1">{m.sender_name} · {new Date(m.sent_at).toLocaleDateString()}</p>
                        {m.body}
                      </div>
                    ))}
                  </div>
                  <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={3}
                    placeholder="Type a reminder or message..."
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  <button onClick={sendMessage} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Send message</button>
                </div>
              )}
              {activeTab === 'mealplan' && (
                <div className="bg-white rounded-xl p-4 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Build meal plan for {selected.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
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
                                <select value={mealPlan[day]?.[slot]?.id || ''}
                                  onChange={e => {
                                    const recipe = recipes.find(r => r.id === parseInt(e.target.value));
                                    setMealPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: recipe || null } }));
                                  }}
                                  className="w-full text-xs border rounded p-1">
                                  <option value="">--</option>
                                  {recipes.filter(r => !r.meal_type || r.meal_type.includes(slot)).map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                  ))}
                                </select>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={pushMealPlan} className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Push meal plan to patient</button>
                </div>
              )}
              {activeTab === 'goals' && (
                <div className="bg-white rounded-xl p-4 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Set goal for {selected.name}</h3>
                  <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={4}
                    placeholder="e.g. Reduce waste to under 2 items per week."
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  <button onClick={saveRecord} className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium">Save goal</button>
                </div>
              )}
              {activeTab === 'recipes' && (
                <div className="bg-white rounded-xl p-4 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Recommend a recipe to {selected.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recipes.slice(0, 10).map(r => (
                      <div key={r.id} className="border rounded-xl p-3 flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.prep_time}min · {r.calories}cal · {r.difficulty}</p>
                        </div>
                        <button onClick={async () => {
                          await fetch(`${API}/api/messages`, {
                            method: 'POST', headers: authHeaders(),
                            body: JSON.stringify({ toUserId: selected.userId, body: `I recommend trying: ${r.name}. ${r.instructions?.slice(0,100)}...`, type: 'recipe' })
                          });
                          notify(`${r.name} recommended!`);
                        }} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg">Send</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HouseholdDashboard({ currentUser, onLogout, config }) {
  const [activeTab, setActiveTab]             = useState('pantry');
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

  const DAYS       = config.days;
  const SLOTS      = config.mealSlots;
  const DIET_TAGS  = config.dietTags;
  const MEAL_TYPES = config.mealTypes;

  const suggestTimer = React.useRef(null);
  const notify = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchPantry(), fetchWaste(), fetchRecipes(), fetchLeftovers(),
      fetchGoals(), fetchMealPlan(), fetchRewards(), fetchRecommendations(),
      fetchSharingStatus(), fetchNotifications(), fetchAiInsight(),
      fetchUnits(), fetchCategories()
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
  const fetchAiInsight      = async () => { const r = await fetch(`${API}/api/recommendations/ai-insight`,    { headers: authHeaders() }); if (r.ok) { const d = await r.json(); setAiInsight(d.insight || ''); } };

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

  const scanBarcode = async () => {
    const r = await fetch(`${API}/api/barcode/scan`, { headers: authHeaders() });
    if (r.ok) { const item = await r.json(); setNewItem({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiryDate: item.expiryDate }); setShowAddForm(true); }
  };

  const stats = {
    total:    wasteLog.length,
    used:     wasteLog.filter(w => w.action === 'used').length,
    wasted:   wasteLog.filter(w => w.action === 'wasted').length,
    saveRate: wasteLog.length > 0 ? Math.round((wasteLog.filter(w => w.action === 'used').length / wasteLog.length) * 100) : 0
  };

  const expiringSoon   = items.filter(i => i.days_left !== null && i.days_left !== undefined && i.days_left <= 3);
  const unreadCount    = notifications.filter(n => !n.is_read).length;

  const filteredRecipes = dbRecipes.filter(r => {
    const matchDiet   = dietFilter.length === 0 || dietFilter.every(f => r.dietary_tags?.includes(f));
    const matchMeal   = !mealTypeFilter || r.meal_type?.includes(mealTypeFilter);
    const matchSearch = !recipeSearch || r.name?.toLowerCase().includes(recipeSearch.toLowerCase()) || r.missingItems?.some(m => m.toLowerCase().includes(recipeSearch.toLowerCase()));
    return matchDiet && matchMeal && matchSearch;
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
        <div onClick={() => setActiveTab('pantry')} className="cursor-pointer flex flex-col gap-0.5">
          <LogoFull size="sm" />
          <p className="text-xs text-gray-400 pl-1">{greeting()}, {currentUser.name?.split(' ')[0] || 'there'}! 👋</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
          <button onClick={() => setShowPdfOptions(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200">Share PDF</button>
          <button onClick={onLogout} className="text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 border rounded-lg">Out</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {aiInsight && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 15h.01M16 15h.01"/><line x1="3" y1="16" x2="1" y2="16"/><line x1="21" y1="16" x2="23" y2="16"/></svg>
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1">Smart insight</p>
                <p className="text-sm text-green-800 leading-relaxed">{aiInsight}</p>
              </div>
            </div>
          </div>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Scan barcode</button>
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm">{recipe.name}</span>
                      {recipe.is_local === 1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🇹🇹 Local</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{recipe.prep_time}min · {recipe.calories}cal · {recipe.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${recipe.missing === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {recipe.missing === 0 ? 'Can make now' : `Missing ${recipe.missing}`}
                    </span>
                    {recipe.missing > 0 && recipe.missingItems?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Need: {recipe.missingItems.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
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
            {mealPlan?.pushed_by && <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">📅 Your dietitian sent you this meal plan</div>}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6">
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
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
              {selectedRecipe.ingredients?.length > 0 ? selectedRecipe.ingredients.map((ing, i) => {
                const isMissing = selectedRecipe.missingItems?.some(m => ing.ingredient_name?.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(ing.ingredient_name?.toLowerCase()));
                return (
                  <span key={i} className={`inline-block text-sm px-2 py-0.5 rounded-full mr-1 mb-1 ${isMissing ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {ing.quantity > 0 ? `${parseFloat(ing.quantity).toFixed(2)} ${ing.unit || ''} ${ing.ingredient_name}`.trim() : ing.ingredient_name}
                  </span>
                );
              }) : selectedRecipe.ingredients_text?.split(',').map((ing, i) => (
                <span key={i} className="inline-block text-sm px-2 py-0.5 rounded-full mr-1 mb-1 bg-green-50 text-green-700">{ing.trim()}</span>
              ))}
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedRecipe.instructions}</p>
            </div>
            <button onClick={async () => {
              const cookRes = await fetch(`${API}/api/recipes/${selectedRecipe.id}/cook`, { method: 'POST', headers: authHeaders() });
              const cookData = await cookRes.json();
              setSelectedRecipe(null); await fetchPantry(); await fetchRewards();
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
              <p className="text-sm text-gray-600">📊 Save rate: {stats.saveRate}%</p>
              <p className="text-sm text-gray-600">✅ {stats.used} items used · ❌ {stats.wasted} wasted</p>
              {rewards && <p className="text-sm text-gray-600">🏅 Badge: {rewards.badge}</p>}
            </div>
            <p className="text-xs text-gray-400 mb-4">To save as PDF: use your browser's Print function and select "Save as PDF"</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPdfOptions(false)} className="flex-1 border rounded-xl py-2.5 text-gray-600 text-sm">Close</button>
              <button onClick={() => { setShowPdfOptions(false); window.print(); }} className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium">Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex max-w-2xl mx-auto">
          {[
            { tab: 'pantry',     label: 'Pantry',  icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
            { tab: 'recipes',    label: 'Recipes', icon: <><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></> },
            { tab: 'allrecipes', label: 'Browse',  icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
            { tab: 'mealplan',   label: 'Planner', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { tab: 'stats',      label: 'Stats',   icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
          ].map(({ tab, label, icon }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center py-3 transition-all ${activeTab === tab ? 'text-green-600' : 'text-gray-400'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
              <span className="text-xs mt-0.5 font-medium">{label}</span>
              {activeTab === tab && <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5"/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AllRecipesTab({ API, authHeaders, notify, config }) {
  const [recipes, setRecipes]   = useState([]);
  const [search, setSearch]     = useState('');
  const [mealType, setMealType] = useState('');
  const [dietTag, setDietTag]   = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  const DIET_TAGS  = config.dietTags;
  const MEAL_TYPES = config.mealTypes;

  useEffect(() => { fetchAll(); }, [search, mealType, dietTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.append('search', search);
    if (mealType) params.append('mealType', mealType);
    if (dietTag)  params.append('dietary', dietTag);
    const r = await fetch(`${API}/api/recipes?${params}`, { headers: authHeaders() });
    if (r.ok) setRecipes(await r.json());
    setLoading(false);
  };

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
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setDietTag('')} className={`text-xs px-3 py-1 rounded-full border ${dietTag === '' ? 'bg-green-500 text-white border-green-500' : 'text-gray-500 border-gray-200'}`}>All diets</button>
        {DIET_TAGS.map(tag => (
          <button key={tag} onClick={() => setDietTag(dietTag === tag ? '' : tag)} className={`text-xs px-3 py-1 rounded-full border ${dietTag === tag ? 'bg-green-500 text-white border-green-500' : 'text-gray-500 border-gray-200'}`}>{tag}</button>
        ))}
      </div>
      {loading && <p className="text-center text-gray-400 py-8">Loading recipes...</p>}
      {!loading && recipes.map(r => (
        <div key={r.id} onClick={() => setSelected(r)} className="bg-white rounded-xl border p-4 mb-2 cursor-pointer hover:border-green-300">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-800">{r.name}</span>
                {r.is_local === 1 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🇹🇹</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{r.prep_time}min · {r.calories}cal · {r.difficulty}</p>
              {r.meal_type && <p className="text-xs text-blue-500 mt-0.5">{r.meal_type}</p>}
            </div>
            {r.dietary_tags && (
              <div className="flex flex-wrap gap-1 max-w-24">
                {r.dietary_tags.split(',').slice(0,2).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            )}
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
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Ingredients</h4>
              <p className="text-sm text-gray-600">{selected.ingredients}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Instructions</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selected.instructions}</p>
            </div>
          </div>
        </div>
      )}
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API}/api/config`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setConfig(data))
      .catch(() => setConfig({ days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], mealSlots: ['breakfast','lunch','dinner','snack'], dietTags: [], mealTypes: ['breakfast','lunch','dinner','snack'] }));
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

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