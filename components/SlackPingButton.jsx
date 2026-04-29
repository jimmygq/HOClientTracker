'use client';

import { useState } from 'react';
import axios from 'axios';

export default function SlackPingButton({ requestId }) {
  const [status, setStatus] = useState('idle');
  const [author, setAuthor] = useState('');

  async function handlePing() {
    if (!author.trim()) { alert('Please enter your name before pinging Slack.'); return; }
    setStatus('loading');
    try {
      await axios.post(`/api/requests/${requestId}/ping`, { author: author.trim() });
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-36" />
      <button onClick={handlePing} disabled={status === 'loading'}
        className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
          status === 'sent' ? 'bg-green-600 text-white' : status === 'error' ? 'bg-red-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}>
        {status === 'loading' ? 'Sending…' : status === 'sent' ? '✓ Sent!' : status === 'error' ? 'Failed' : '🔔 Ping Slack'}
      </button>
    </div>
  );
}
