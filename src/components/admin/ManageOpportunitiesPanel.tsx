'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Loader2, AlertCircle,
  Briefcase, RefreshCw, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOpportunities } from '@/src/hooks/data/useOpportunities';
import { updateOpportunity, deleteOpportunity } from '@/src/actions/opportunityActions';
import { Button } from '@/components/ui/button';
import OpportunityForm, { OpportunityFormState } from './OpportunityForm';

const TYPE_COLORS: Record<string, string> = {
  Research:   'bg-teal-100 text-teal-700',
  Internship: 'bg-amber-100 text-amber-700',
  Leadership: 'bg-indigo-100 text-indigo-700',
  Volunteer:  'bg-rose-100 text-rose-700',
  Other:      'bg-slate-100 text-slate-600',
};

export default function ManageOpportunitiesPanel() {
  const { opportunities: opps, isLoading: loading, isError, mutate } = useOpportunities();
  const error = isError ? String(isError) : null;
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit drawer
  const [editId, setEditId] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] = useState<OpportunityFormState | null>(null);
  const [editFetching, setEditFetching] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function load() {
    mutate();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteOpportunity(id);
      mutate();
      if (editId === id) closeDrawer();
    } catch (err) {
      alert(String(err).replace('Error: ', ''));
    } finally {
      setDeleting(null);
    }
  }

  async function openEdit(id: string) {
    setEditId(id);
    setEditFetching(true);
    setEditError(null);
    setEditInitialData(null);

    try {
      const op = opps.find(o => o.id === id);
      if (!op) throw new Error('Opportunity not found');

      setEditInitialData({
        title:        op.title        ?? '',
        description:  op.description  ?? '',
        organization: op.organization ?? '',
        deadline:     op.deadline     ?? '',
        contact_info: op.contact_info ?? '',
        type:         op.type         ?? '',
        eligibility:  op.eligibility  ?? '',
        registration_link: op.registration_link ?? '',
      });
    } catch (err) {
      setEditError(String(err).replace('Error: ', ''));
    } finally {
      setEditFetching(false);
    }
  }

  function closeDrawer() {
    setEditId(null);
    setEditInitialData(null);
    setEditError(null);
  }

  async function handleEditSubmit(data: OpportunityFormState) {
    if (!editId) return { success: false, error: 'No opportunity selected' };

    const result = await updateOpportunity(editId, {
      ...data,
      registration_link: data.registration_link.trim() || null,
    });
    
    return result as { success: boolean; error?: string };
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-500 py-16 justify-center">
      <Loader2 size={18} className="animate-spin" /> Loading opportunities…
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Failed to load opportunities</p>
        <p className="text-sm mt-0.5">{error}</p>
        <button onClick={load} className="text-sm font-semibold underline mt-2">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-6">

      {/* ── Opportunities table ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${editId ? 'hidden xl:block' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            {opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {opps.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No opportunities yet</p>
            <p className="text-sm mt-1">Create your first opportunity using the sidebar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Organization</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Deadline</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Type</th>
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {opps.map((op) => (
                  <tr
                    key={op.id}
                    className={`transition-colors ${
                      editId === op.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                        {op.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-slate-500 truncate max-w-[140px]">
                        {op.organization ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-500 whitespace-nowrap">
                        {op.deadline ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {op.type ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[op.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {op.type}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* Edit toggle */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 transition-colors ${
                            editId === op.id
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                          }`}
                          onClick={() => editId === op.id ? closeDrawer() : openEdit(op.id)}
                          title={editId === op.id ? 'Close editor' : 'Edit opportunity'}
                        >
                          {editId === op.id ? <X size={14} /> : <Pencil size={14} />}
                        </Button>
                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(op.id, op.title)}
                          disabled={deleting === op.id}
                          title="Delete opportunity"
                        >
                          {deleting === op.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit drawer ── */}
      <AnimatePresence>
        {editId && (
          <motion.div
            key="edit-drawer"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
            className="w-full shrink-0 xl:sticky xl:top-8 xl:w-[440px]"
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Pencil size={14} className="text-primary" />
                  <span className="text-sm font-bold text-slate-800">Edit Opportunity</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Fetching skeleton */}
              {editFetching ? (
                <div className="p-5 space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                      <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : editError ? (
                <div className="p-5">
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm font-medium">
                    {editError}
                  </div>
                </div>
              ) : editInitialData ? (
                <div className="p-5 max-h-[calc(100vh-14rem)] overflow-y-auto">
                  <OpportunityForm
                    key={editId}
                    initialData={editInitialData}
                    onSubmit={handleEditSubmit}
                    submitLabel="Save Changes"
                    loadingLabel="Saving..."
                    successMessage="Updated — changes are live on the public page!"
                    onSuccess={mutate}
                    hideHeader={true}
                    layout="vertical"
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
