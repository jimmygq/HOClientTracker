'use client';

import { useEffect, useState, useCallback } from 'react';
import StatCards from './StatCards';
import FilterBar from './FilterBar';
import RequestTable from './RequestTable';
import RequestDetailPanel from './RequestDetailPanel';
import RequestForm from './RequestForm';
import { useRequests } from '@/hooks/useRequests';

export default function Dashboard() {
  const { requests, loading, error, fetchRequests, createRequest } = useRequests();
  const [filters, setFilters] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statsKey, setStatsKey] = useState(0);

  const load = useCallback(() => {
    fetchRequests(filters);
    setStatsKey(k => k + 1);
  }, [filters, fetchRequests]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form) {
    setCreating(true);
    try {
      const req = await createRequest(form);
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
      <div className="flex-1 flex flex-col min-w-0 px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">Client Requests</h1>
          <button onClick={() => { setShowForm(true); setSelectedId(null); }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
            + New Request
          </button>
        </div>

        <StatCards refreshKey={statsKey} />

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm mb-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">New Request</h2>
            <RequestForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={creating} />
          </div>
        )}

        <FilterBar filters={filters} onChange={setFilters} />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12 text-sm">Loading requests…</div>
        ) : (
          <RequestTable requests={requests} onRowClick={req => {
            setShowForm(false);
            setSelectedId(req.request_id === selectedId ? null : req.request_id);
          }} />
        )}
      </div>

      {selectedId && (
        <div className="w-[480px] flex-shrink-0 border-l bg-white shadow-xl h-full overflow-y-auto">
          <RequestDetailPanel requestId={selectedId} onClose={() => setSelectedId(null)} onRefresh={load} />
        </div>
      )}
    </div>
  );
}
