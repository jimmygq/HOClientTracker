'use client';

const STATUSES = ['New', 'In Progress', 'Pending Client', 'Blocked', 'Resolved', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const inputCls = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700';

export default function FilterBar({ filters, onChange }) {
  function set(key, value) { onChange({ ...filters, [key]: value }); }
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap gap-2.5 mb-5 items-center">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="text"
          placeholder="Search ID, title, client…"
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className={`${inputCls} pl-9 w-56`}
        />
      </div>

      <select value={filters.status || ''} onChange={e => set('status', e.target.value)} className={inputCls}>
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>

      <select value={filters.priority || ''} onChange={e => set('priority', e.target.value)} className={inputCls}>
        <option value="">All Priorities</option>
        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
      </select>

      <input type="text" placeholder="Filter by owner…" value={filters.owner || ''} onChange={e => set('owner', e.target.value)}
        className={`${inputCls} w-40`} />

      <input type="text" placeholder="Filter by client…" value={filters.client || ''} onChange={e => set('client', e.target.value)}
        className={`${inputCls} w-40`} />

      {hasFilters && (
        <button onClick={() => onChange({})}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
