'use client';

import StatCards from './StatCards';
import { useState } from 'react';

export default function Overview() {
  const [statsKey] = useState(0);

  return (
    <div className="px-8 py-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all client request activity</p>
        <div className="mt-5 border-b border-gray-200" />
      </div>

      <div className="mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Request Stats</h2>
        <StatCards refreshKey={statsKey} />
      </div>
    </div>
  );
}
