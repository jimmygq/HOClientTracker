'use client';

import { useState } from 'react';
import { StatusBadge, PriorityBadge, DaysOpenBadge, DueDateBadge } from './Badges';

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

export default function RequestTable({ requests, onRowClick }) {
  const [sortKey, setSortKey] = useState('request_id');
  const [sortDir, setSortDir] = useState('desc');

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = [...requests].sort((a, b) => {
    const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (requests.length === 0) {
    return <div className="rounded-xl border bg-white p-12 text-center text-gray-400 shadow-sm">No requests found. Create one to get started.</div>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {COLUMNS.map(col => (
              <th key={col.key} className="px-4 py-3 cursor-pointer select-none hover:text-gray-800 whitespace-nowrap" onClick={() => handleSort(col.key)}>
                {col.label}{sortKey === col.key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(req => {
            const isOverdue = req.due_date && req.due_date < today && !['Resolved', 'Cancelled'].includes(req.status);
            return (
              <tr key={req.request_id}
                className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-blue-50 ${
                  req.status === 'Blocked' || isOverdue ? 'bg-red-50' : ''
                }`}
                onClick={() => onRowClick(req)}>
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{req.request_id}</td>
                <td className="px-4 py-3 font-medium">{req.client_name}</td>
                <td className="px-4 py-3 max-w-xs truncate" title={req.title}>{req.title}</td>
                <td className="px-4 py-3 text-gray-500">{req.type}</td>
                <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                <td className="px-4 py-3 text-gray-600">{req.owner || <span className="text-gray-400 italic">Unassigned</span>}</td>
                <td className="px-4 py-3"><DaysOpenBadge dateStarted={req.date_started} /></td>
                <td className="px-4 py-3"><DueDateBadge dueDate={req.due_date} status={req.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
