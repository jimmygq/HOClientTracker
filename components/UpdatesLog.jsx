'use client';

import { useState } from 'react';

function formatTs(ts) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function UpdatesLog({ updates = [], onAddUpdate, loading }) {
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim() || !note.trim()) return;
    await onAddUpdate(author.trim(), note.trim());
    setNote('');
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Log</h3>
      {updates.length === 0 ? (
        <p className="text-sm text-gray-400 italic mb-4">No updates yet.</p>
      ) : (
        <ul className="space-y-3 mb-5 max-h-64 overflow-y-auto scrollbar-thin pr-1">
          {updates.map(u => (
            <li key={u.id} className="flex gap-3">
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
              <div>
                <div className="text-xs text-gray-400">{formatTs(u.timestamp)} · <span className="font-medium text-gray-600">{u.author}</span></div>
                <div className="text-sm text-gray-700 mt-0.5">{u.note}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add an update note…" rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        <button type="submit" disabled={loading || !author.trim() || !note.trim()}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Add Update'}
        </button>
      </form>
    </div>
  );
}
