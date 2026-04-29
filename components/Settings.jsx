'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function EditableList({ title, items, fields, onAdd, onUpdate, onDelete, emptyText, noBorder }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const blankForm = () => Object.fromEntries(fields.map(f => [f.key, '']));

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true); setError('');
    try { await onAdd(form); setAdding(false); setForm({}); }
    catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(e) {
    e.preventDefault(); setSaving(true); setError('');
    try { await onUpdate(editId, form); setEditId(null); setForm({}); }
    catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    finally { setSaving(false); }
  }

  function startEdit(item) { setEditId(item.id); setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] ?? '']))); setAdding(false); }
  function startAdd() { setAdding(true); setEditId(null); setForm(blankForm()); }

  const fieldInput = (f, formState, setFormState) => f.type === 'select' ? (
    <select value={formState[f.key] || ''} onChange={e => setFormState(p => ({ ...p, [f.key]: e.target.value }))}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
      <option value="">—</option>
      {f.options.map(o => <option key={o}>{o}</option>)}
    </select>
  ) : (
    <input required={f.required} value={formState[f.key] || ''} onChange={e => setFormState(p => ({ ...p, [f.key]: e.target.value }))}
      placeholder={f.placeholder || ''}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44" />
  );

  return (
    <div className={noBorder ? '' : 'rounded-xl border bg-white shadow-sm overflow-hidden'}>
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <button onClick={startAdd} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">+ Add</button>
      </div>
      {error && <div className="px-5 py-2 text-sm text-red-600 bg-red-50 border-b">{error}</div>}
      {adding && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b bg-blue-50 flex flex-wrap gap-3 items-end">
          {fields.map(f => <div key={f.key} className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">{f.label}{f.required && ' *'}</label>{fieldInput(f, form, setForm)}</div>)}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-lg border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">{emptyText}</p>
      ) : (
        <ul className="divide-y">
          {items.map(item => (
            <li key={item.id} className="px-5 py-3">
              {editId === item.id ? (
                <form onSubmit={handleUpdate} className="flex flex-wrap gap-3 items-end">
                  {fields.map(f => <div key={f.key} className="flex flex-col gap-1"><label className="text-xs font-semibold text-gray-600">{f.label}</label>{fieldInput(f, form, setForm)}</div>)}
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{saving ? 'Saving…' : 'Update'}</button>
                    <button type="button" onClick={() => setEditId(null)} className="rounded-lg border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    {fields.map((f, i) => <span key={f.key} className={i === 0 ? 'font-medium text-gray-900 text-sm' : 'text-gray-500 text-xs ml-2'}>{i > 0 && item[f.key] ? `· ${item[f.key]}` : item[f.key]}</span>)}
                    {item.active === 0 && <span className="ml-2 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">inactive</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={async () => { if (confirm('Delete this entry?')) await onDelete(item.id); }} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClientImport({ onImported }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const inputRef = useRef();

  async function uploadFile(file) {
    if (!file) return;
    setStatus('loading');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post('/api/clients/import', fd);
      setStatus(data);
      onImported();
    } catch (err) {
      setStatus({ error: err.response?.data?.error || 'Upload failed.' });
    }
  }

  return (
    <div className="px-5 py-4 border-t bg-gray-50">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Import from CSV or Excel</p>
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); uploadFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-5 py-6 text-center transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
        <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={e => uploadFile(e.target.files[0])} />
        {status === 'loading' ? <p className="text-sm text-gray-500">Uploading…</p> : (
          <><p className="text-sm text-gray-600 font-medium">Drop file here or click to browse</p><p className="text-xs text-gray-400 mt-1">Accepts .csv, .xls, .xlsx — max 5 MB</p></>
        )}
      </div>
      {status && status !== 'loading' && (
        <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${status.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {status.error ? `Error: ${status.error}` : `Imported ${status.added} client${status.added !== 1 ? 's' : ''} — ${status.skipped} skipped.`}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">Expected columns: <code className="bg-gray-100 px-1 rounded">name</code> (required), <code className="bg-gray-100 px-1 rounded">contact_name</code>, <code className="bg-gray-100 px-1 rounded">contact_email</code>, <code className="bg-gray-100 px-1 rounded">notes</code>.</p>
    </div>
  );
}

export default function Settings() {
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);

  const loadClients = async () => { const { data } = await axios.get('/api/clients'); setClients(data); };
  const loadTeam = async () => { const { data } = await axios.get('/api/team'); setTeam(data); };

  useEffect(() => { loadClients(); loadTeam(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      <EditableList title="Team Members" items={team} emptyText="No team members yet."
        fields={[
          { key: 'name', label: 'Name', required: true, placeholder: 'Full name' },
          { key: 'role', label: 'Role', placeholder: 'e.g. Coordinator' },
          { key: 'active', label: 'Status', type: 'select', options: ['1', '0'] },
        ]}
        onAdd={async f => { await axios.post('/api/team', f); await loadTeam(); }}
        onUpdate={async (id, f) => { await axios.put(`/api/team/${id}`, { ...f, active: f.active !== '0' ? 1 : 0 }); await loadTeam(); }}
        onDelete={async id => { await axios.delete(`/api/team/${id}`); await loadTeam(); }}
      />

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <EditableList title="Client Directory" items={clients} noBorder
          emptyText="No clients yet. Add one manually or import from a file below."
          fields={[
            { key: 'name', label: 'Client Name', required: true, placeholder: 'Company name' },
            { key: 'contact_name', label: 'Contact Name', placeholder: 'Primary contact' },
            { key: 'contact_email', label: 'Contact Email', placeholder: 'email@company.com' },
            { key: 'notes', label: 'Notes', placeholder: 'Any notes…' },
          ]}
          onAdd={async f => { await axios.post('/api/clients', f); await loadClients(); }}
          onUpdate={async (id, f) => { await axios.put(`/api/clients/${id}`, f); await loadClients(); }}
          onDelete={async id => { await axios.delete(`/api/clients/${id}`); await loadClients(); }}
        />
        <ClientImport onImported={loadClients} />
      </div>
    </div>
  );
}
