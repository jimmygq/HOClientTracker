'use client';

const STATUSES = ['New', 'In Progress', 'Pending Client', 'Blocked', 'Resolved', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function FilterBar({ filters, onChange }) {
  function set(key, value) { onChange({ ...filters, [key]: value }); }

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <input
        type="text"
        placeholder="Search ID, title, client…"
        value={filters.search || ''}
        onChange={e => set('search', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
      />
      <select value={filters.status || ''} onChange={e => set('status', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <select value={filters.priority || ''} onChange={e => set('priority', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="">All Priorities</option>
        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
      </select>
      <input type="text" placeholder="Filter by owner…" value={filters.owner || ''} onChange={e => set('owner', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44" />
      <input type="text" placeholder="Filter by client…" value={filters.client || ''} onChange={e => set('client', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44" />
      {Object.values(filters).some(Boolean) && (
        <button onClick={() => onChange({})} className="text-sm text-gray-500 hover:text-red-500 underline">Clear filters</button>
      )}
    </div>
  );
}
