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

export default function RequestDetailPanel({ requestId, startInEditMode, onClose, onRefresh }) {
  const [request, setRequest] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { fetchRequest, updateRequest, deleteRequest, addUpdate, uploadAttachment } = useRequests();

  const load = useCallback(async () => {
    if (!requestId) return;
    try { setRequest(await fetchRequest(requestId)); } catch {}
  }, [requestId, fetchRequest]);

  useEffect(() => { load(); setEditing(!!startInEditMode); setConfirmDelete(false); }, [load, startInEditMode]);

  async function handleSave(form, file) {
    setSaving(true);
    try {
      let updated = await updateRequest(requestId, { ...form, _author: 'Team' });
      if (file) updated = await uploadAttachment(requestId, file);
      setRequest(updated);
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

  async function handleMarkResolved() {
    setSaving(true);
    try {
      setRequest(await updateRequest(requestId, { status: 'Resolved', _author: 'Team' }));
      onRefresh?.();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRequest(requestId);
      onRefresh?.();
      onClose();
    } finally { setDeleting(false); }
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
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              {request.status !== 'Blocked' && request.status !== 'Resolved' && (
                <button onClick={handleMarkBlocked} disabled={saving}
                  className="rounded-lg border border-orange-300 px-4 py-1.5 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-60 transition-colors">
                  Mark Blocked
                </button>
              )}
              {request.status !== 'Resolved' && (
                <button onClick={handleMarkResolved} disabled={saving}
                  className="rounded-lg border border-teal-300 px-4 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60 transition-colors">
                  Mark Resolved
                </button>
              )}
              <SlackPingButton requestId={request.request_id} />
              {confirmDelete ? (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500">Delete this request?</span>
                  <button onClick={handleDelete} disabled={deleting}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                    {deleting ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Client">{request.client_name}</Field>
              <Field label="Type">{request.type}</Field>
              <Field label="Owner">{request.owner || <span className="italic text-gray-400">Unassigned</span>}</Field>
              <Field label="Date Started">{request.date_started}</Field>
              <Field label="Due Date">{request.due_date || <span className="italic text-gray-400">Not set</span>}</Field>
              <Field label="Last Updated">{new Date(request.last_updated).toLocaleString()}</Field>
              <Field label="Blockers">{request.blockers || <span className="italic text-gray-400">None</span>}</Field>
            </div>
            {request.notes && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">{request.notes}</p>
              </div>
            )}
            {request.attachment_url && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Attachment</div>
                <a href={request.attachment_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  View attachment
                </a>
              </div>
            )}
          </>
        )}

        <div className="border-t pt-5">
          <UpdatesLog updates={request.updates || []} onAddUpdate={handleAddUpdate} loading={addingUpdate} />
        </div>
      </div>
    </div>
  );
}
