'use client';

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  'Pending Client': 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
  Resolved: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{priority}</span>;
}

export function DaysOpenBadge({ dateStarted }) {
  const days = Math.floor((Date.now() - new Date(dateStarted)) / (1000 * 60 * 60 * 24));
  let cls = 'bg-green-100 text-green-800';
  if (days >= 10) cls = 'bg-red-100 text-red-800';
  else if (days >= 5) cls = 'bg-amber-100 text-amber-800';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{days}d open</span>;
}

export function DueDateBadge({ dueDate, status }) {
  if (!dueDate) return null;
  const resolved = status === 'Resolved' || status === 'Cancelled';
  const today = new Date().toISOString().split('T')[0];
  const overdue = !resolved && dueDate < today;
  const dueToday = !resolved && dueDate === today;

  let cls = 'bg-gray-100 text-gray-600';
  let label = `Due ${dueDate}`;
  if (overdue) { cls = 'bg-red-100 text-red-700'; label = `⚠ Overdue · ${dueDate}`; }
  else if (dueToday) { cls = 'bg-amber-100 text-amber-700'; label = 'Due today'; }

  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}
