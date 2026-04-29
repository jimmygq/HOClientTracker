'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatusBadge, PriorityBadge, DaysOpenBadge, DueDateBadge } from './Badges';
import RequestForm from './RequestForm';
import UpdatesLog from './UpdatesLog';
import SlackPingButton from './SlackPingButton';
import { useRequests } from '@/hooks/useRequests';

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function RequestDetailPanel({ requestId, onClose, onRefresh }) {
  const [request, setRequest] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingUpdate, setAddingUpdate] = useState(false);
  const { fetchRequest, updateRequest, addUpdate } = useRequests();

  const load = useCallback(async () => {
    if (!requestId) return;
    try { setRequest(await fetchRequest(requestId)); } catch {}
  }, [requestId, fetchRequest]);

  useEffect(() => { load(); setEditing(false); }, [load]);

  async function handleSave(form) {
    setSaving(true);
    try {
      setRequest(await updateRequest(requestId, { ...form, _author: 'Team' }));
      setEditing(false);
      onRefresh?.();
    } finally { setSaving(false); }
  }

  async function handleMarkBlocked() {
    setSaving(true);
    try {
      setRequest(await updateRequest(requestId, { status: 'Blocked', _author: 'Team' }));
      onRefresh?.();
    } finally { setSaving(false); }
  }

  async function handleAddUpdate(author, note) {
    setAddingUpdate(true);
    try { setRequest(await addUpdate(requestId, author, note)); }
    finally { setAddingUpdate(false); }
  }

  if (!request) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b sticky top-0 bg-white z-10">
        <div>
          <div className="font-mono text-xs font-semibold text-blue-600 mb-1">{request.request_id}</div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{request.title}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <DaysOpenBadge dateStarted={request.date_started} />
            <DueDateBadge dueDate={request.due_date} status={request.status} />
          </div>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-700 text-xl leading-none mt-1" aria-label="Close">×</button>
      </div>

      <div className="px-6 py-5 flex-1 space-y-6">
        {request.blockers && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">⚠ Blocker:</span> {request.blockers}
          </div>
        )}

        {editing ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Edit Request</h3>
            <RequestForm initial={request} onSubmit={handleSave} onCancel={() => setEditing(false)} loading={saving} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client">{request.client_name}</Field>
              <Field label="Type">{request.type}</Field>
              <Field label="Owner">{request.owner || <span className="italic text-gray-400">Unassigned</span>}</Field>
              <Field label="Date Started">{request.date_started}</Field>
              <Field label="Due Date">{request.due_date || <span className="italic text-gray-400">Not set</span>}</Field>
              <Field label="Last Updated">{new Date(request.last_updated).toLocaleString()}</Field>
              <Field label="Blockers">{request.blockers || <span className="italic text-gray-400">None</span>}</Field>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                Edit
              </button>
              {request.status !== 'Blocked' && (
                <button onClick={handleMarkBlocked} disabled={saving}
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                  Mark Blocked
                </button>
              )}
              <SlackPingButton requestId={request.request_id} />
            </div>
          </>
        )}

        <div className="border-t pt-5">
          <UpdatesLog updates={request.updates || []} onAddUpdate={handleAddUpdate} loading={addingUpdate} />
        </div>
      </div>
    </div>
  );
}
