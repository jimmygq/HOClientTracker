'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const TYPES = ['Personnel/Hiring', 'Onboarding', 'Equipment', 'General', 'Contractor Issue', 'Billing Issue', 'Other'];
const STATUSES = ['New', 'In Progress', 'Pending Client', 'Blocked', 'Resolved', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const BLOCKER_OPTIONS = [
  'Client Side', 'Hire Overseas Side', 'Approval Needed',
  'Third Party / External Approval Needed', 'Waiting on Documents',
  'Waiting on Client Response', 'Internal Review Pending', 'Other',
];

const DEFAULT = {
  client_name: '', title: '', type: 'General', status: 'New',
  owner: '', priority: 'Medium',
  date_started: new Date().toISOString().split('T')[0],
  due_date: '', blockers: '',
};

export default function RequestForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...DEFAULT, ...initial });
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    axios.get('/api/clients').then(r => setClients(r.data)).catch(() => {});
    axios.get('/api/team?active=1').then(r => setTeamMembers(r.data)).catch(() => {});
  }, []);

  useEffect(() => { if (initial) setForm({ ...DEFAULT, ...initial }); }, [initial]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Client *</label>
          <select required value={form.client_name} onChange={e => set('client_name', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">— Select a client —</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {clients.length === 0 && <p className="text-xs text-amber-600 mt-1">No clients yet — add them in Settings first.</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Request Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Hire 3 React developers"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Owner / Responsible</label>
          <select value={form.owner} onChange={e => set('owner', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">— Unassigned —</option>
            {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}{m.role ? ` — ${m.role}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date Started</label>
          <input type="date" value={form.date_started} onChange={e => set('date_started', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
          <input type="date" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Blocker Type</label>
        <select value={form.blockers || ''} onChange={e => set('blockers', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">— No blocker —</option>
          {BLOCKER_OPTIONS.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading ? 'Saving…' : initial?.request_id ? 'Save Changes' : 'Create Request'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
