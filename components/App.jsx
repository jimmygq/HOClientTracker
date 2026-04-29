/**
 * HIRE OVERSEAS — CLIENT REQUEST TRACKER
 *
 * EMBEDDABLE AS IFRAME:
 * ---------------------
 * <iframe
 *   src="https://your-deployed-url.com"
 *   width="100%"
 *   height="800"
 *   style="border:none; border-radius:12px;"
 *   title="Hire Overseas Request Tracker"
 * ></iframe>
 */

'use client';

import { useState } from 'react';
import Dashboard from './Dashboard';
import Settings from './Settings';

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="font-bold text-gray-900 text-base tracking-tight">Hire Overseas</span>
            <span className="text-gray-300 font-light text-base">/</span>
            <span className="text-gray-500 text-sm font-medium">Client Request Tracker</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === n.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 min-h-0 max-w-screen-2xl mx-auto w-full overflow-y-auto">
        {page === 'dashboard' && <Dashboard />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
