'use client';

import { useEffect, useState, useCallback } from 'react';
import StatCards from './StatCards';
import FilterBar from './FilterBar';
import RequestTable from './RequestTable';
import RequestDetailPanel from './RequestDetailPanel';
import RequestForm from './RequestForm';
import { useRequests } from '@/hooks/useRequests';

export default function Dashboard() {
  const { requests, loading, error, fetchRequests, createRequest, uploadAttachment } = useRequests();
  const [filters, setFilters] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statsKey, setStatsKey] = useState(0);

  const load = useCallback(() => {
    fetchRequests(filters);
    setStatsKey(k => k + 1);
  }, [filters, fetchRequests]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form, file) {
    setCreating(true);
    try {
      const req = await createRequest(form);
      if (file) await uploadAttachment(req.request_id, file);
      setShowForm(false);
      setSelectedId(req.request_id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create request.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-full min-h-0">

      {/* Left: list view */}
      <div className="flex-1 flex flex-col min-w-0 px-8 py-7">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Requests</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and resolve client requests across all accounts</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setSelectedId(null); }}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          </div>
          <div className="mt-5 border-b border-gray-200" />
        </div>

        <StatCards refreshKey={statsKey} />

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">New Request</h2>
            <RequestForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={creating} />
          </div>
        )}

        <FilterBar filters={filters} onChange={setFilters} />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16 text-sm">Loading requests…</div>
        ) : (
          <RequestTable
            requests={requests}
            onRowClick={req => {
              setShowForm(false);
              setStartInEditMode(false);
              setSelectedId(req.request_id === selectedId ? null : req.request_id);
            }}
            onEditClick={req => {
              setShowForm(false);
              setStartInEditMode(true);
              setSelectedId(req.request_id);
            }}
          />
        )}
      </div>

      {/* Right: detail panel */}
      {selectedId && (
        <div className="w-[500px] flex-shrink-0 border-l bg-white shadow-xl h-full overflow-y-auto">
          <RequestDetailPanel
            requestId={selectedId}
            startInEditMode={startInEditMode}
            onClose={() => { setSelectedId(null); setStartInEditMode(false); }}
            onRefresh={load}
          />
        </div>
      )}
    </div>
  );
}
