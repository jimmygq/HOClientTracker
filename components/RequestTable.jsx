'use client';

import { useState } from 'react';
import { StatusBadge, PriorityBadge, DaysOpenBadge, DueDateBadge } from './Badges';

const STATUSES = ['New', 'In Progress', 'Pending Client', 'Blocked', 'Resolved', 'Cancelled'];

const COLUMNS = [
  { key: 'request_id', label: 'ID' },
  { key: 'client_name', label: 'Client' },
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'owner', label: 'Owner' },
  { key: 'date_started', label: 'Days Open' },
  { key: 'due_date', label: 'Due Date' },
];

export default function RequestTable({ requests, onRowClick, onEditClick, onStatusChange }) {
  const [sortKey, setSortKey] = useState('request_id');
  const [sortDir, setSortDir] = useState('desc');
  const [editingStatus, setEditingStatus] = useState(null);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = [...requests].sort((a, b) => {
    const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
        <svg className="mx-auto w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-400 text-sm">No requests found. Create one to get started.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            {COLUMNS.map(col => (
              <th key={col.key}
                className="px-4 py-3 cursor-pointer select-none hover:text-gray-600 whitespace-nowrap transition-colors"
                onClick={() => handleSort(col.key)}>
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-teal-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map(req => {
            const isOverdue = req.due_date && req.due_date < today && !['Resolved', 'Cancelled'].includes(req.status);
            return (
              <tr key={req.request_id}
                onClick={() => onRowClick(req)}
                className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                  req.status === 'Blocked' || isOverdue ? 'bg-red-50/60' : ''
                }`}>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-teal-600">{req.request_id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{req.client_name}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-700" title={req.title}>{req.title}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{req.type}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  {editingStatus === req.request_id ? (
                    <select
                      autoFocus
                      defaultValue={req.status}
                      onChange={e => { onStatusChange(req.request_id, e.target.value); setEditingStatus(null); }}
                      onBlur={() => setEditingStatus(null)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <button onClick={() => setEditingStatus(req.request_id)} title="Click to change status">
                      <StatusBadge status={req.status} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{req.owner || <span className="italic text-gray-300">Unassigned</span>}</td>
                <td className="px-4 py-3"><DaysOpenBadge dateStarted={req.date_started} /></td>
                <td className="px-4 py-3"><DueDateBadge dueDate={req.due_date} status={req.status} /></td>
                <td className="px-2 py-3">
                  <button
                    onClick={e => { e.stopPropagation(); onEditClick(req); }}
                    className="rounded-lg p-1.5 text-gray-300 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    title="Edit request">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
