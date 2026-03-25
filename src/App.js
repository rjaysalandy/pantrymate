import React, { useState } from 'react';
import { Plus, Scan, Trash2, Package, AlertCircle, ChefHat, Clock, Users, Leaf, Share2, Bell, BookOpen, LogOut, CheckCircle, XCircle, Send, Eye, Target, Flag } from 'lucide-react';

const MOCK_PATIENT_RECORDS = {
  1: {
    dob: '1998-05-14', phone: '868-555-0101', address: 'Chaguanas, Trinidad',
    diagnosis: ['Type 2 Diabetes (pre-diabetic)', 'Overweight (BMI 27.4)'],
    allergies: ['Shellfish'], dietaryRestrictions: ['Low sugar', 'Reduced sodium'],
    currentGoal: 'Reduce weekly food waste to under 2 items and cook at home 4x per week',
    goalTarget: 2, nextAppointment: '2026-03-10',
    notes: 'Patient is motivated and engaged. Responds well to positive reinforcement.',
    joinedDate: '2026-01-15',
  },
};

const STAPLES = ['salt','pepper','sugar','oil','olive oil','garlic','onion','butter','green seasoning','browning'];

const DEMO_SCAN_QUEUE = [
  { name: 'Rolled Oats',      category: 'Pantry', quantity: 1, unit: 'bag',       expiry_date: '2026-12-01' },
  { name: 'Low Fat Milk',     category: 'Dairy',  quantity: 1, unit: 'carton',    expiry_date: '2026-04-05' },
  { name: 'Canned Chickpeas', category: 'Pantry', quantity: 1, unit: 'can',       expiry_date: '2027-06-01' },
  { name: 'Greek Yogurt',     category: 'Dairy',  quantity: 1, unit: 'container', expiry_date: '2026-04-10' },
  { name: 'Brown Rice',       category: 'Pantry', quantity: 1, unit: 'bag',       expiry_date: '2026-12-01' },
  { name: 'Canned Tuna',      category: 'Pantry', quantity: 1, unit: 'can',       expiry_date: '2027-01-01' },
];

const API = process.env.REACT_APP_API_URL;

function getDateStr(item) {
  return item.expiry_date || item.expiryDate || '';
}

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const clean = String(dateStr).split('T')[0];
  const date  = new Date(clean + 'T00:00:00');
  if (isNaN(date.getTime())) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / 86400000);
}

function expiryStatus(days) {
  if (days < 0)  return { label: 'Expired',      cls: 'bg-red-100 text-red-800 border-red-200' };
  if (days <= 3) return { label: days + 'd left', cls: 'bg-orange-100 text-orange-800 border-orange-200' };
  if (days <= 7) return { label: days + 'd left', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  return           { label: days + 'd left',      cls: 'bg-green-100 text-green-800 border-green-200' };
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const clean = String(dateStr).split('T')[0];
  const date  = new Date(clean + 'T00:00:00');
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode]   = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [name, setName]   = useState('');
  const [role, setRole]   = useState('user');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (mode === 'login') {
      try {
        const res  = await fetch(`${API}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || 'Login failed');
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } catch { setError('Cannot connect to server. Please try again.'); }
    } else {
      if (!name || !email || !pass) return setError('Please fill in all fields.');
      try {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pass, role })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || 'Registration failed');
        const loginRes  = await fetch(`${API}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) return setError('Registered but login failed. Please sign in.');
        localStorage.setItem('token', loginData.token);
        onLogin(loginData.user);
      } catch { setError('Cannot connect to server. Please try again.'); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">WasteLess PantryMate</h1>
          <p className="text-gray-500 text-sm mt-1">Smart food management for T&T households</p>
        </div>
        <div className="flex gap-2 mb-6">
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={'flex-1 py-2 rounded-xl font-semibold text-sm transition-all ' + (mode===m?'bg-green-500 text-white shadow':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m==='login'?'Sign In':'Create Account'}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="space-y-4">
          {mode==='register' && (
            <>
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
                  <option value="dietician">Dietitian / Healthcare Provider</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
          </div>
          <button onClick={submit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            {mode==='login'?'Sign In':'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DIETITIAN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function DietitianDashboard({ currentUser, sharedProfiles, onLogout, dbRecipes }) {
  const [selected, setSelected]               = useState(null);
  const [panel, setPanel]                     = useState('overview');
  const [noteText, setNoteText]               = useState('');
  const [planText, setPlanText]               = useState('');
  const [goalText, setGoalText]               = useState('');
  const [sent, setSent]                       = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [patientRecords, setPatientRecords]   = useState(MOCK_PATIENT_RECORDS);
  const [editingNotes, setEditingNotes]       = useState(false);
  const [clinicalNotes, setClinicalNotes]     = useState('');

  const sendMsg = (type, body) => {
    const msgBody = body || (type === 'note' ? noteText : type === 'mealplan' ? planText : goalText);
    if (!msgBody.trim() || !selected) return;
    setSent(s => [...s, { id: Date.now(), to: selected.userId, type, body: msgBody, time: 'Just now' }]);
    if (type === 'note') setNoteText('');
    if (type === 'mealplan') setPlanText('');
    if (type === 'goal') setGoalText('');
  };

  const saveAppointment = () => {
    if (!appointmentDate || !selected) return;
    setPatientRecords(r => ({ ...r, [selected.userId]: { ...(r[selected.userId]||{}), nextAppointment: appointmentDate } }));
    setAppointmentDate('');
  };

  const saveClinicalNotes = () => {
    if (!selected) return;
    setPatientRecords(r => ({ ...r, [selected.userId]: { ...(r[selected.userId]||{}), notes: clinicalNotes } }));
    setEditingNotes(false);
  };

  const getFlags = (profile) => {
    const flags       = [];
    const wastedCount = profile.wasteLog.filter(e => e.action==='wasted').length;
    const usedCount   = profile.wasteLog.filter(e => e.action==='used').length;
    const total       = wastedCount + usedCount;
    const wasteRate   = total > 0 ? Math.round(wastedCount/total*100) : 0;
    const expiring    = profile.items.filter(i => { const d=daysUntil(getDateStr(i)); return d>=0&&d<=3; });
    if (wasteRate>50&&total>0) flags.push({ type:'warning', msg:'High waste rate: '+wasteRate+'% of removed items wasted' });
    if (expiring.length>0)     flags.push({ type:'alert',   msg:expiring.length+' item(s) expiring within 3 days' });
    if (profile.items.length===0) flags.push({ type:'info', msg:'Pantry is empty - patient may need support with shopping' });
    return flags;
  };

  const record          = selected ? (patientRecords[selected.userId]||{}) : null;
  const sentForSelected = selected ? sent.filter(m => m.to===selected.userId) : [];
  const flags           = selected ? getFlags(selected) : [];
  const patientStats    = selected ? (() => {
    const wasted   = selected.wasteLog.filter(e => e.action==='wasted').length;
    const used     = selected.wasteLog.filter(e => e.action==='used').length;
    const total    = wasted + used;
    const saveRate = total > 0 ? Math.round(used/total*100) : null;
    return { wasted, used, total, saveRate };
  })() : null;

  const panelTabs = [
    ['overview','Overview'],['clinical','Clinical'],['remind','Reminder'],
    ['mealplan','Meal Plan'],['goals','Goals'],['recipes','Recipes'],['history','History'],
  ];

  const recipes = dbRecipes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dietitian Portal</h1>
            <p className="text-gray-500 text-sm">Welcome, {currentUser.name} · Dietitian Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-500 text-xs">Patients sharing</p>
              <p className="text-2xl font-bold text-blue-600">{sharedProfiles.length}</p>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm">
              <LogOut size={16}/> Sign Out
            </button>
          </div>
        </div>

        {sharedProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center text-gray-400">
            <Users size={56} className="mx-auto mb-4 opacity-30"/>
            <p className="font-semibold text-xl text-gray-500">No patients sharing yet</p>
            <p className="text-sm mt-2 max-w-sm mx-auto">Patients appear here once they enable sharing from the Stats tab in their app.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Patients</p>
                {sharedProfiles.map(p => {
                  const pFlags     = getFlags(p);
                  const pWasted    = p.wasteLog.filter(e=>e.action==='wasted').length;
                  const pTotal     = p.wasteLog.length;
                  const pWasteRate = pTotal>0 ? Math.round(pWasted/pTotal*100) : 0;
                  const rec        = patientRecords[p.userId]||{};
                  return (
                    <button key={p.userId} onClick={() => { setSelected(p); setPanel('overview'); }}
                      className={'w-full text-left p-3 rounded-xl mb-2 transition-all border '+(selected?.userId===p.userId?'bg-blue-600 text-white border-blue-600':'bg-gray-50 hover:bg-gray-100 text-gray-700 border-transparent')}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{p.name}</p>
                        {pFlags.length>0 && <Flag size={12} className={selected?.userId===p.userId?'text-yellow-300':'text-orange-500'}/>}
                      </div>
                      <p className={'text-xs '+(selected?.userId===p.userId?'text-blue-200':'text-gray-400')}>{p.items.length} pantry items</p>
                      {pTotal>0 && <p className={'text-xs mt-0.5 '+(selected?.userId===p.userId?'text-blue-200':'text-gray-400')}>Waste rate: {pWasteRate}%</p>}
                      {rec.nextAppointment && <p className={'text-xs mt-1 '+(selected?.userId===p.userId?'text-blue-200':'text-blue-500')}>Appt: {rec.nextAppointment}</p>}
                    </button>
                  );
                })}
              </div>
              {selected && patientStats && (
                <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[['In Pantry',selected.items.length,'blue'],['Save Rate',patientStats.saveRate!==null?patientStats.saveRate+'%':'-','green'],['Used',patientStats.used,'green'],['Wasted',patientStats.wasted,'red']].map(([lbl,val,col]) => (
                      <div key={lbl} className={'bg-'+col+'-50 rounded-xl p-3 text-center'}>
                        <p className={'text-xl font-bold text-'+col+'-600'}>{val}</p>
                        <p className="text-xs text-gray-500">{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 space-y-4">
              {selected ? (
                <>
                  {flags.length>0 && (
                    <div className="space-y-2">
                      {flags.map((f,i) => (
                        <div key={i} className={'flex items-center gap-3 p-3 rounded-xl text-sm font-medium '+(f.type==='warning'?'bg-red-50 border border-red-200 text-red-700':f.type==='alert'?'bg-orange-50 border border-orange-200 text-orange-700':'bg-blue-50 border border-blue-200 text-blue-700')}>
                          <Flag size={15} className="shrink-0"/>{f.msg}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex gap-1.5 mb-5 flex-wrap">
                      {panelTabs.map(([k,lbl]) => (
                        <button key={k} onClick={() => setPanel(k)}
                          className={'py-1.5 px-3 rounded-xl text-xs font-semibold transition-all '+(panel===k?'bg-blue-600 text-white shadow':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                          {lbl}
                        </button>
                      ))}
                    </div>

                    {panel==='overview' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">{selected.name} - Overview</h3>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Pantry</p>
                        {selected.items.length===0 ? (
                          <p className="text-sm text-gray-400 mb-4 bg-gray-50 rounded-xl p-3">Pantry is empty.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {selected.items.map(item => {
                              const s = expiryStatus(daysUntil(getDateStr(item)));
                              return (
                                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 text-sm">
                                  <span className="text-gray-700 font-medium truncate mr-2">{item.name}</span>
                                  <span className={'text-xs font-semibold px-1.5 py-0.5 rounded-full border shrink-0 '+s.cls}>{s.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {selected.wasteLog.length>0 && (
                          <>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</p>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {[...selected.wasteLog].reverse().slice(0,6).map(e => (
                                <div key={e.id} className={'flex items-center gap-3 p-2.5 rounded-lg '+(e.action==='used'?'bg-green-50':'bg-red-50')}>
                                  {e.action==='used'?<CheckCircle size={14} className="text-green-500 shrink-0"/>:<XCircle size={14} className="text-red-500 shrink-0"/>}
                                  <span className="text-sm text-gray-700 flex-1">{e.item_name||e.itemName}</span>
                                  <span className={'text-xs font-semibold px-2 py-0.5 rounded-full '+(e.action==='used'?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>{e.action}</span>
                                  <span className="text-xs text-gray-400 shrink-0">{e.date}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {panel==='clinical' && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 text-lg">{selected.name} - Clinical Profile</h3>
                        {record.dob && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {[['Date of Birth',record.dob],['Phone',record.phone],['Address',record.address],['Patient Since',record.joinedDate]].map(([lbl,val]) => (
                              <div key={lbl}>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{lbl}</p>
                                <p className="text-gray-800">{val}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {record.diagnosis && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Diagnosis</p>
                            <div className="flex flex-wrap gap-2">
                              {record.diagnosis.map((d,i) => <span key={i} className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-medium">{d}</span>)}
                            </div>
                          </div>
                        )}
                        {record.allergies && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Allergies</p>
                            <div className="flex flex-wrap gap-2">
                              {record.allergies.map((a,i) => <span key={i} className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">⚠ {a}</span>)}
                            </div>
                          </div>
                        )}
                        {record.dietaryRestrictions && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Dietary Restrictions</p>
                            <div className="flex flex-wrap gap-2">
                              {record.dietaryRestrictions.map((r,i) => <span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{r}</span>)}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Next Appointment</p>
                          <div className="flex gap-2">
                            <input type="date" value={appointmentDate} onChange={e=>setAppointmentDate(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"/>
                            <button onClick={saveAppointment} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">Save</button>
                          </div>
                          {record.nextAppointment && <p className="text-sm text-blue-600 font-medium mt-2">Scheduled: {record.nextAppointment}</p>}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Clinical Notes</p>
                            <button onClick={() => { setEditingNotes(!editingNotes); setClinicalNotes(record.notes||''); }}
                              className="text-xs text-blue-500 hover:text-blue-700 font-semibold">{editingNotes?'Cancel':'Edit'}</button>
                          </div>
                          {editingNotes ? (
                            <>
                              <textarea value={clinicalNotes} onChange={e=>setClinicalNotes(e.target.value)} rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"/>
                              <button onClick={saveClinicalNotes} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">Save Notes</button>
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{record.notes||'No notes yet. Click Edit to add clinical notes.'}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {panel==='remind' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">Send Reminder to {selected.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">Messages appear in the patient inbox immediately.</p>
                        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 resize-none"
                          placeholder="e.g. Great progress this week! Try to use the chicken before Friday."/>
                        <button onClick={() => sendMsg('note')}
                          className="mt-3 w-full bg-green-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600">
                          <Send size={16}/> Send Reminder
                        </button>
                      </div>
                    )}

                    {panel==='mealplan' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">Push Meal Plan to {selected.name}</h3>
                        {record.diagnosis && record.diagnosis.some(d=>d.toLowerCase().includes('diabetes')) && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 text-xs text-yellow-700 font-medium">
                            ⚠ Diabetes flag - prioritise low-GI carbohydrates and avoid high-sugar meals.
                          </div>
                        )}
                        <textarea value={planText} onChange={e=>setPlanText(e.target.value)} rows={8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Monday: Grilled fish with provision&#10;Tuesday: Callaloo soup&#10;Wednesday: Channa curry&#10;Thursday: Baked chicken&#10;Friday: Sweet potato bowl"/>
                        <button onClick={() => sendMsg('mealplan')}
                          className="mt-3 w-full bg-blue-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600">
                          <BookOpen size={16}/> Send Meal Plan
                        </button>
                      </div>
                    )}

                    {panel==='goals' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">Goal Setting - {selected.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">Set measurable behaviour change targets for this patient.</p>
                        {record.currentGoal && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Active Goal</p>
                            <p className="text-sm text-gray-700">{record.currentGoal}</p>
                          </div>
                        )}
                        {record.goalTarget && patientStats && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Goal Progress</p>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm text-gray-600">Target: max {record.goalTarget} waste events/week</p>
                              <p className={'text-sm font-bold '+(patientStats.wasted<=record.goalTarget?'text-green-600':'text-red-600')}>
                                {patientStats.wasted<=record.goalTarget?'On Track':'Needs Work'}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={'h-2 rounded-full '+(patientStats.wasted<=record.goalTarget?'bg-green-500':'bg-red-500')}
                                style={{ width: Math.min(100,(patientStats.wasted/Math.max(record.goalTarget*2,1))*100)+'%' }}/>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{patientStats.wasted} waste events this session</p>
                          </div>
                        )}
                        <textarea value={goalText} onChange={e=>setGoalText(e.target.value)} rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="e.g. Reduce weekly food waste to under 2 items and cook at home 4x per week"/>
                        <button onClick={() => sendMsg('goal')}
                          className="mt-3 w-full bg-purple-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-600">
                          <Target size={16}/> Set New Goal
                        </button>
                      </div>
                    )}

                    {panel==='recipes' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">Push Recipe to {selected.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">Browse and send a recipe based on what is in the patient pantry.</p>
                        {record.allergies && (
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 text-xs text-orange-700">
                            ⚠ Allergy alert: {record.allergies.join(', ')} - check ingredients before sending.
                          </div>
                        )}
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {recipes.map(recipe => {
                            const pNames  = selected.items.map(i=>i.name.toLowerCase());
                            const avail   = [...pNames, ...STAPLES];
                            const reqItems = recipe.ingredients ? recipe.ingredients.split(',').map(i=>i.trim().toLowerCase()) : [];
                            const missing = reqItems.filter(req=>!avail.some(p=>p.includes(req)||req.includes(p)));
                            const canMake = missing.length === 0;
                            return (
                              <div key={recipe.id} className={'border rounded-xl p-3 '+(canMake?'border-green-200 bg-green-50':'border-gray-200')}>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-sm text-gray-800">{recipe.name} {recipe.is_local?'(TT)':''}</p>
                                  <div className="flex items-center gap-2">
                                    {canMake && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Can make now</span>}
                                    <button onClick={() => sendMsg('note','Try this recipe: '+recipe.name+'\n\nIngredients:\n'+recipe.ingredients+'\n\nInstructions:\n'+recipe.instructions)}
                                      className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-600">Send</button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500">{recipe.prep_time} min - {recipe.calories} cal - {recipe.difficulty}</p>
                                {!canMake && missing.length>0 && <p className="text-xs text-orange-600 mt-1">Missing: {missing.join(', ')}</p>}
                              </div>
                            );
                          })}
                          {recipes.length===0 && <p className="text-sm text-gray-400 text-center py-4">No recipes available.</p>}
                        </div>
                      </div>
                    )}

                    {panel==='history' && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4">Communication History - {selected.name}</h3>
                        {sentForSelected.length===0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">No messages sent yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {[...sentForSelected].reverse().map(m => {
                              const styleMap = { note:'bg-yellow-50 border-yellow-200 text-yellow-600', mealplan:'bg-blue-50 border-blue-200 text-blue-600', goal:'bg-purple-50 border-purple-200 text-purple-600' };
                              const labelMap = { note:'Reminder', mealplan:'Meal Plan', goal:'Goal' };
                              const s = styleMap[m.type]||'bg-green-50 border-green-200 text-green-600';
                              const parts = s.split(' ');
                              return (
                                <div key={m.id} className={'p-3 rounded-xl text-sm border '+parts[0]+' '+parts[1]}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className={'text-xs font-bold uppercase tracking-wide '+parts[2]}>{labelMap[m.type]||'Message'}</span>
                                    <span className="text-xs text-gray-400">{m.time}</span>
                                  </div>
                                  <p className="text-gray-700 whitespace-pre-line text-xs leading-relaxed">{m.body}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center text-gray-400">
                  <Eye size={48} className="mx-auto mb-4 opacity-30"/>
                  <p className="font-semibold text-lg text-gray-500">Select a patient</p>
                  <p className="text-sm mt-1">Choose a patient from the list to view their profile and data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function PantryMate() {
  const [currentUser, setCurrentUser]       = useState(null);
  const [sharedProfiles, setSharedProfiles] = useState([]);
  const [activeTab, setActiveTab]           = useState('pantry');
  const [items, setItems]                   = useState([]);
  const [wasteLog, setWasteLog]             = useState([]);
  const [dbRecipes, setDbRecipes]           = useState([]);
  const [pendingDelete, setPendingDelete]   = useState(null);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [newItem, setNewItem]               = useState({ name:'', category:'Other', quantity:1, unit:'item', expiryDate:'' });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings]             = useState({});
  const [dietFilter, setDietFilter]         = useState([]);
  const [showExpiring, setShowExpiring]     = useState(false);
  const [sharingOn, setSharingOn]           = useState(false);
  const [scanIdx, setScanIdx]               = useState(0);
  const [inboxMessages, setInboxMessages]   = useState([]);

  const fetchPantry = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/pantry`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (err) {
      console.error('Failed to fetch pantry:', err);
    }
  };

  const fetchWasteLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/waste`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setWasteLog(data);
    } catch (err) {
      console.error('Failed to fetch waste log:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/recipes/match`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDbRecipes(data.recipes || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    }
  };

  const login = async (user) => {
    setCurrentUser(user);
    await fetchRecipes();
    if (user.role === 'user') {
      setInboxMessages([]);
      await fetchPantry();
      await fetchWasteLog();
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSharingOn(false);
    setItems([]);
    setWasteLog([]);
    setDbRecipes([]);
    localStorage.removeItem('token');
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

  const requestDelete = (item) => setPendingDelete(item);

  const confirmDelete = async (action) => {
    if (!pendingDelete) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/waste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item_name: pendingDelete.name, action, pantry_item_id: pendingDelete.id })
      });
      await fetchPantry();
      await fetchWasteLog();
      setPendingDelete(null);
    } catch (err) {
      console.error('Failed to log waste:', err);
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.expiryDate) { alert('Please fill in item name and expiry date'); return; }
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/pantry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newItem.name, category: newItem.category, quantity: newItem.quantity, unit: newItem.unit, expiry_date: newItem.expiryDate })
      });
      if (res.ok) {
        await fetchPantry();
        await fetchRecipes();
        setNewItem({ name:'', category:'Other', quantity:1, unit:'item', expiryDate:'' });
        setShowAddForm(false);
      }
    } catch (err) { console.error('Failed to add item:', err); }
  };

  const scanBarcode = () => {
    const scanned = DEMO_SCAN_QUEUE[scanIdx % DEMO_SCAN_QUEUE.length];
    setItems(prev => [...prev, { id: Date.now(), ...scanned }]);
    setScanIdx(i => i + 1);
  };

  const pantryNames = items.map(i => i.name.toLowerCase());
  const available   = [...pantryNames, ...STAPLES];

  const matchedRecipes = dbRecipes.filter(r => {
    const required = r.ingredients ? r.ingredients.split(',').map(i=>i.trim().toLowerCase()) : [];
    const missing  = required.filter(req => !available.some(p=>p.includes(req)||req.includes(p)));
    const hasMatch = required.some(req => pantryNames.some(p=>p.includes(req)||req.includes(p)));
    const meetsFilter = dietFilter.every(d => (r.dietary_tags||'').includes(d));
    if (!meetsFilter) return false;
    if (missing.length > 3 && !hasMatch) return false;
    r.canMake      = missing.length === 0;
    r.missingItems = missing;
    return true;
  }).sort((a,b) => (a.canMake===b.canMake?0:a.canMake?-1:1));

  const sorted       = [...items].sort((a,b) => daysUntil(getDateStr(a)) - daysUntil(getDateStr(b)));
  const expiringSoon = items.filter(i => { const d=daysUntil(getDateStr(i)); return d>=0&&d<=7; }).length;
  const usedCount    = wasteLog.filter(e => e.action==='used').length;
  const wastedCount  = wasteLog.filter(e => e.action==='wasted').length;
  const saveRate     = wasteLog.length > 0 ? Math.round(usedCount/wasteLog.length*100) : null;

  const CATS  = ['Dairy','Bakery','Produce','Meat','Pantry','Frozen','Cooked / Prepared','Other'];
  const UNITS = ['item','count','lb','kg','oz','g','bottle','carton','loaf','bag','can'];

  if (!currentUser) return <AuthScreen onLogin={login}/>;
  if (currentUser.role === 'dietician')
    return <DietitianDashboard currentUser={currentUser} sharedProfiles={sharedProfiles} onLogout={logout} dbRecipes={dbRecipes}/>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">

        {pendingDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Removing: <span className="text-green-600">{pendingDelete.name}</span></h3>
              <p className="text-gray-500 text-sm mb-6">Did you use this or was it wasted?</p>
              <div className="flex gap-3">
                <button onClick={()=>confirmDelete('used')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600">
                  <CheckCircle size={20}/> Used It
                </button>
                <button onClick={()=>confirmDelete('wasted')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600">
                  <XCircle size={20}/> Wasted
                </button>
              </div>
              <button onClick={()=>setPendingDelete(null)} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 text-center">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">WasteLess PantryMate</h1>
              <p className="text-gray-500 text-sm">Welcome, {currentUser.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleSharing}
                className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all '+(sharingOn?'bg-blue-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
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
              Your pantry and waste log are visible to your dietitian.
            </div>
          )}

          {inboxMessages.length > 0 && (
            <div className="mb-4 space-y-2">
              {inboxMessages.map(m => (
                <div key={m.id} className={'p-3 rounded-xl border text-sm '+(m.type==='mealplan'?'bg-purple-50 border-purple-200':'bg-yellow-50 border-yellow-200')}>
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

          <div className="flex gap-2 mb-4">
            {[['pantry','Pantry',<Package size={16}/>],['recipes','Recipes ('+matchedRecipes.length+')',<ChefHat size={16}/>],['stats','My Stats',<Leaf size={16}/>]].map(([tab,lbl,icon]) => (
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={'flex-1 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 '+(activeTab===tab?'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {icon}{lbl}
              </button>
            ))}
          </div>

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

        {showExpiring && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Expiring Soon</h2>
              <button onClick={()=>setShowExpiring(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            {sorted.filter(i=>{ const d=daysUntil(getDateStr(i)); return d>=0&&d<=7; }).length===0
              ? <p className="text-center text-green-600 font-semibold py-4">Nothing expiring soon!</p>
              : <div className="space-y-2">
                {sorted.filter(i=>{ const d=daysUntil(getDateStr(i)); return d>=0&&d<=7; }).map(item => {
                  const s = expiryStatus(daysUntil(getDateStr(item)));
                  return (
                    <div key={item.id} className="flex items-center justify-between border border-orange-200 rounded-xl p-3">
                      <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full border '+s.cls}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {activeTab==='pantry' && (
          <>
            <div className="flex gap-3 mb-4">
              <button onClick={()=>setShowAddForm(!showAddForm)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all">
                <Plus size={20}/> Add Item
              </button>
              <button onClick={scanBarcode}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all">
                <Scan size={20}/> Scan Barcode <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full">Demo</span>
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
                    <input type="date" value={newItem.expiryDate} onChange={e=>setNewItem({...newItem,expiryDate:e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"/>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={addItem} className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600">Add to Pantry</button>
                  <button onClick={()=>setShowAddForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
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
                    const s = expiryStatus(daysUntil(getDateStr(item)));
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">{item.name}</span>
                              <span className={'px-2 py-0.5 rounded-full text-xs font-semibold border '+s.cls}>{s.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{item.category} - {parseFloat(item.quantity)} {item.unit} - Expires {formatDate(getDateStr(item))}</p>
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
          </>
        )}

        {activeTab==='recipes' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChefHat size={24} className="text-green-600"/>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Recipe Suggestions</h2>
                <p className="text-xs text-gray-500">Based on your pantry - local and international</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {['vegan','vegetarian','high-protein','low-salt','low-sugar','low-fat','high-fibre','dairy-free'].map(d => (
                <button key={d} onClick={()=>setDietFilter(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}
                  className={'px-3 py-1.5 rounded-full text-xs font-semibold transition-all '+(dietFilter.includes(d)?'bg-green-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {d.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            {items.length===0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Your pantry is empty — add items to get recipe suggestions.</p>
            ) : matchedRecipes.length===0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No matches - try adding more pantry items or clearing filters.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedRecipes.map(recipe => {
                  const mult     = servings[recipe.id] || 1;
                  const srvCount = (recipe.base_servings||1) * mult;
                  return (
                    <div key={recipe.id}
                      className={'border-2 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all '+(recipe.canMake?'border-gray-200 hover:border-green-400':'border-orange-200 bg-orange-50')}
                      onClick={()=>setSelectedRecipe(recipe.id===selectedRecipe?null:recipe.id)}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex-1 leading-snug text-sm">{recipe.name}</h3>
                        <div className="flex gap-1 ml-2 shrink-0">
                          {recipe.is_local && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">TT</span>}
                          {!recipe.canMake && recipe.missingItems.length>0 && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">Need {recipe.missingItems.length}</span>}
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{recipe.difficulty}</span>
                        </div>
                      </div>
                      {!recipe.canMake && recipe.missingItems.length>0 && (
                        <div className="mb-2 p-2 bg-white rounded-lg border border-orange-200">
                          <p className="text-xs text-orange-700 font-semibold mb-1">Missing:</p>
                          <div className="flex flex-wrap gap-1">
                            {recipe.missingItems.map((m,i)=><span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{m}</span>)}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock size={12}/>{recipe.prep_time} min</span>
                        <span className="flex items-center gap-1"><Leaf size={12}/>{recipe.calories} cal</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3" onClick={e=>e.stopPropagation()}>
                        <span className="text-xs text-gray-500">Servings:</span>
                        <button onClick={()=>setServings(p=>({...p,[recipe.id]:Math.max(1,(p[recipe.id]||1)-1)}))} className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm hover:bg-gray-300">-</button>
                        <span className="font-semibold text-sm text-gray-800 min-w-8 text-center">{srvCount}</span>
                        <button onClick={()=>setServings(p=>({...p,[recipe.id]:Math.min(10,(p[recipe.id]||1)+1)}))} className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm hover:bg-gray-300">+</button>
                      </div>
                      {recipe.dietary_tags && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {recipe.dietary_tags.split(',').map((t,i)=><span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{t.trim()}</span>)}
                        </div>
                      )}
                      {selectedRecipe===recipe.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="font-semibold text-gray-800 mb-2 text-sm">Ingredients ({srvCount} serving{srvCount>1?'s':''}):</p>
                          <p className="text-sm text-gray-600 mb-3">{recipe.ingredients}</p>
                          <p className="font-semibold text-gray-800 mb-2 text-sm">Instructions:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{recipe.instructions}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab==='stats' && (
          <div className="space-y-4">
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
                  <p className="text-3xl font-bold text-blue-600">{saveRate!==null?saveRate+'%':'—'}</p>
                  <p className="text-xs text-gray-500 mt-1">Save Rate</p>
                </div>
              </div>
              {saveRate!==null && (
                <div className={'rounded-xl p-4 text-sm font-semibold '+(saveRate>=70?'bg-green-50 border border-green-200 text-green-700':saveRate>=40?'bg-yellow-50 border border-yellow-200 text-yellow-700':'bg-red-50 border border-red-200 text-red-700')}>
                  {saveRate>=70?'Excellent - you are using most of what you buy!':saveRate>=40?'Good progress - check expiry dates regularly.':'A lot is being wasted - try the recipe suggestions to use items up!'}
                </div>
              )}
              {wasteLog.length===0 && <p className="text-center text-gray-400 text-sm py-4">No activity yet. Remove items from your pantry to start tracking.</p>}
            </div>

            {wasteLog.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">Activity Log</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {[...wasteLog].reverse().map(e => (
                    <div key={e.id} className={'flex items-center gap-3 p-3 rounded-xl '+(e.action==='used'?'bg-green-50':'bg-red-50')}>
                      {e.action==='used'?<CheckCircle size={16} className="text-green-500 shrink-0"/>:<XCircle size={16} className="text-red-500 shrink-0"/>}
                      <span className="text-sm text-gray-700 flex-1">{e.item_name||e.itemName}</span>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full '+(e.action==='used'?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>{e.action}</span>
                      <span className="text-xs text-gray-400 shrink-0">{e.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">Share with Your Dietitian</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Allow your dietitian to view your pantry and waste data</p>
                </div>
                <button onClick={toggleSharing}
                  className={'relative w-14 h-7 rounded-full transition-colors duration-200 '+(sharingOn?'bg-green-500':'bg-gray-300')}>
                  <div className={'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 '+(sharingOn?'translate-x-7':'translate-x-0.5')}/>
                </button>
              </div>
              {sharingOn
                ? <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg p-3">Active - your dietitian can see your pantry and waste activity in real time.</p>
                : <p className="text-gray-400 text-xs">Off - only you can see your data.</p>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}