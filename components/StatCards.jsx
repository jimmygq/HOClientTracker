'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

function Card({ label, value, accent, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.bg}`}>
        <svg className={`w-4 h-4 ${accent.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">{label}</div>
        <div className={`text-xl font-bold mt-0.5 ${accent.text}`}>{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default function StatCards({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/stats').then(r => setStats(r.data)).catch(() => {});
  }, [refreshKey]);

  const avgLabel = stats?.avgResolveDays != null
    ? `${stats.avgResolveDays}d`
    : '—';

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card label="Total Open" value={stats?.totalOpen}
        accent={{ bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-gray-900' }}
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      <Card label="Overdue" value={stats?.overdue}
        accent={{ bg: 'bg-red-50', icon: 'text-red-500', text: stats?.overdue > 0 ? 'text-red-600' : 'text-gray-900' }}
        icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
      <Card label="Blocked" value={stats?.blocked}
        accent={{ bg: 'bg-orange-50', icon: 'text-orange-500', text: stats?.blocked > 0 ? 'text-orange-600' : 'text-gray-900' }}
        icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      <Card label="High Priority" value={stats?.highPriority}
        accent={{ bg: 'bg-amber-50', icon: 'text-amber-500', text: 'text-gray-900' }}
        icon="M13 10V3L4 14h7v7l9-11h-7z" />
      <Card label="Resolved All Time" value={stats?.resolvedAllTime}
        accent={{ bg: 'bg-teal-50', icon: 'text-teal-500', text: 'text-teal-700' }}
        icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
      <Card label="Resolved / Week" value={stats?.resolvedThisWeek}
        accent={{ bg: 'bg-green-50', icon: 'text-green-500', text: 'text-gray-900' }}
        icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      <Card label="Avg Resolve Time" value={avgLabel}
        accent={{ bg: 'bg-purple-50', icon: 'text-purple-500', text: 'text-gray-900' }}
        icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </div>
  );
}
