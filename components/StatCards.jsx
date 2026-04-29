'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

function Card({ label, value, color, textColor }) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm flex flex-col gap-1 ${color}`}>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-3xl font-bold ${textColor || 'text-gray-800'}`}>{value ?? '—'}</span>
    </div>
  );
}

export default function StatCards({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/stats').then(r => setStats(r.data)).catch(() => {});
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card label="Total Open" value={stats?.totalOpen} color="border-blue-200" />
      <Card label="Overdue" value={stats?.overdue} color="border-red-300" textColor={stats?.overdue > 0 ? 'text-red-600' : 'text-gray-800'} />
      <Card label="Blocked" value={stats?.blocked} color="border-orange-200" textColor={stats?.blocked > 0 ? 'text-orange-600' : 'text-gray-800'} />
      <Card label="High Priority" value={stats?.highPriority} color="border-amber-200" />
      <Card label="Resolved This Week" value={stats?.resolvedThisWeek} color="border-green-200" />
    </div>
  );
}
