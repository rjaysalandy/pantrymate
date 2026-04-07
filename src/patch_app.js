#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const appPath = path.join(process.env.HOME, 'Desktop/pantrymate/src/App.js');
let src = fs.readFileSync(appPath, 'utf8');

src = src.replace(
  `const [newItem, setNewItem]             = useState({ name:'', category:'Produce', quantity:1, unit:'item', expiryDate:'' });`,
  `const [newItem, setNewItem]             = useState({ name:'', category_id:'', unit_id:'', quantity:1, expiryDate:'' });
  const [editItem, setEditItem]           = useState(null);
  const [units, setUnits]                 = useState([]);
  const [categories, setCategories]       = useState([]);
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);`
);

src = src.replace(
  `await Promise.all([
      fetchPantry(), fetchWaste(), fetchRecipes(), fetchLeftovers(),
      fetchGoals(), fetchMealPlan(), fetchRewards(), fetchRecommendations(),
      fetchSharingStatus(), fetchNotifications(), fetchAiInsight()
    ]);`,
  `await Promise.all([
      fetchPantry(), fetchWaste(), fetchRecipes(), fetchLeftovers(),
      fetchGoals(), fetchMealPlan(), fetchRewards(), fetchRecommendations(),
      fetchSharingStatus(), fetchNotifications(), fetchAiInsight(),
      fetchUnits(), fetchCategories()
    ]);`
);

src = src.replace(
  `  const fetchNotifications = async () => {
    const res = await fetch(\`\${API}/api/notifications\`, { headers: authHeaders() });
    if (res.ok) setNotifications(await res.json());
  };`,
  `  const fetchNotifications = async () => {
    const res = await fetch(\`\${API}/api/notifications\`, { headers: authHeaders() });
    if (res.ok) setNotifications(await res.json());
  };
  const fetchUnits = async () => {
    const res = await fetch(\`\${API}/api/units\`, { headers: authHeaders() });
    if (res.ok) setUnits(await res.json());
  };
  const fetchCategories = async () => {
    const res = await fetch(\`\${API}/api/categories\`, { headers: authHeaders() });
    if (res.ok) setCategories(await res.json());
  };
  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    const res = await fetch(\`\${API}/api/suggestions?q=\${encodeURIComponent(q)}\`, { headers: authHeaders() });
    if (res.ok) setSuggestions(await res.json());
  };
  const saveEditItem = async () => {
    if (!editItem) return;
    if (editItem.expiry_date) {
      const today = new Date().toISOString().split('T')[0];
      if (editItem.expiry_date < today) { notify('Expiry date cannot be in the past'); return; }
    }
    const res = await fetch(\`\${API}/api/pantry/\${editItem.id}\`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({
        name: editItem.name,
        quantity: editItem.quantity,
        unit_id: editItem.unit_id || null,
        category_id: editItem.category_id || null,
        expiry_date: editItem.expiry_date || null
      })
    });
    if (res.ok) { setEditItem(null); await fetchPantry(); notify('Item updated!'); }
  };`
);

src = src.replace(
  `  const addItem = async () => {
    if (!newItem.name.trim()) return;
    const res = await fetch(\`\${API}/api/pantry\`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(newItem)
    });
    if (res.ok) {
      setShowAddForm(false);
      setNewItem({ name:'', category:'Produce', quantity:1, unit:'item', expiryDate:'' });
      await fetchPantry();
      notify('Item added!');
    }
  };`,
  `  const addItem = async () => {
    if (!newItem.name.trim()) return;
    if (newItem.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (newItem.expiryDate < today) { notify('Expiry date cannot be in the past'); return; }
    }
    const res = await fetch(\`\${API}/api/pantry\`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        unit_id: newItem.unit_id || null,
        category_id: newItem.category_id || null,
        expiry_date: newItem.expiryDate || null
      })
    });
    if (res.ok) {
      setShowAddForm(false);
      setNewItem({ name:'', category_id:'', unit_id:'', quantity:1, expiryDate:'' });
      setSuggestions([]);
      await fetchPantry();
      notify('Item added!');
    }
  };`
);

src = src.replace(
  `await fetch(\`\${API}/api/recipes/\${selectedRecipe.id}/use\`, { method: 'POST', headers: authHeaders() });
              setSelectedRecipe(null);
              await fetchRewards();
              notify('Recipe cooked — points awarded!');`,
  `const cookRes = await fetch(\`\${API}/api/recipes/\${selectedRecipe.id}/cook\`, { method: 'POST', headers: authHeaders() });
              const cookData = await cookRes.json();
              setSelectedRecipe(null);
              await fetchPantry();
              await fetchRewards();
              const reduced = cookData.reduced?.length ? \` Pantry updated: \${cookData.reduced.join(', ')}.\` : '';
              notify(\`Recipe cooked — points awarded!\${reduced}\`);`
);

src = src.replace(
  `              <div>
                <label className="text-sm text-gray-600">Item name</label>
                <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Dasheen, Chicken, Oats"
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>`,
  `              <div className="relative">
                <label className="text-sm text-gray-600">Item name</label>
                <input value={newItem.name}
                  onChange={e => {
                    setNewItem({...newItem, name: e.target.value});
                    fetchSuggestions(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. Dasheen, Chicken, Oats"
                  className="mt-1 w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li key={i} className="px-4 py-2 text-sm hover:bg-green-50 cursor-pointer"
                        onMouseDown={() => {
                          setNewItem({...newItem, name: s});
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>`
);

src = src.replace(
  `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Unit</label>
                  <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    {['item','kg','g','lb','litre','ml','pack','tin','bottle','bag','bunch'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>`,
  `              <div className="grid grid-cols-2 gap-3">
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
                  <select value={newItem.unit_id} onChange={e => setNewItem({...newItem, unit_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    {['weight','volume','count','other'].map(grp => (
                      <optgroup key={grp} label={grp.charAt(0).toUpperCase()+grp.slice(1)}>
                        {units.filter(u => u.category === grp).map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>`
);

src = src.replace(
  `      {/* Delete confirmation modal */}`,
  `      {/* Edit item modal */}
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
                  <select value={editItem.unit_id || ''} onChange={e => setEditItem({...editItem, unit_id: e.target.value})}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select...</option>
                    {['weight','volume','count','other'].map(grp => (
                      <optgroup key={grp} label={grp.charAt(0).toUpperCase()+grp.slice(1)}>
                        {units.filter(u => u.category === grp).map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
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

      {/* Delete confirmation modal */}`
);

fs.writeFileSync(appPath, src, 'utf8');
console.log('App.js patched successfully.');