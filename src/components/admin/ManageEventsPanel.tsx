'use client';

import { useState } from 'react';
import {
  Pencil, Trash2, Loader2, AlertCircle,
  CalendarDays, RefreshCw, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/src/hooks/data/useEvents';
import { updateEvent, deleteEvent } from '@/src/actions/eventActions';
import EventForm, { EventFormState } from './EventForm';

function perksToString(perks: string[] | string | undefined): string {
  if (!perks) return '';
  if (Array.isArray(perks)) return perks.join(', ');
  return perks;
}

export default function ManageEventsPanel() {
  const { events, isLoading: loading, isError, mutate } = useEvents();
  const error = isError ? String(isError) : null;
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit drawer state
  const [editId, setEditId] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] = useState<EventFormState | null>(null);
  const [editFetching, setEditFetching] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function load() {
    mutate();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
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
      const ev = events.find(e => e.id === id);
      if (!ev) throw new Error('Event not found');

      const coords: Record<string, unknown>[] = ((ev as unknown as Record<string, unknown>).event_coordinators as Record<string, unknown>[]) ?? [];

      setEditInitialData({
        title:       ev.title ?? '',
        description: ev.description ?? '',
        date:        ev.date ?? '',
        time:        ev.time ?? '',
        venue:       ev.venue ?? '',
        duration:    ev.duration ?? '',
        category:    ev.category ?? '',
        perks:       perksToString(ev.perks),
        registration_link: ev.registration_link ?? '',
        coordinators: coords.map((c) => ({
          localId: crypto.randomUUID(),
          name:    (c.name as string) ?? '',
          phone:   (c.phone as string) ?? '',
        })),
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

  async function handleEditSubmit(data: EventFormState) {
    if (!editId) return { success: false, warning: 'No event selected' };
    
    const result = await updateEvent(editId, {
      ...data,
      perks: data.perks
        ? data.perks.split(',').map((p) => p.trim()).filter(Boolean)
        : [],
      registration_link: data.registration_link.trim() || null,
      coordinators: data.coordinators
        .filter((c) => c.name.trim())
        .map(({ name, phone }) => ({ name, phone })),
    });

    return result as { success: boolean; warning?: string };
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-500 py-16 justify-center">
      <Loader2 size={18} className="animate-spin" /> Loading events…
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Failed to load events</p>
        <p className="text-sm mt-0.5">{error}</p>
        <button onClick={load} className="text-sm font-semibold underline mt-2">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-6">

      {/* ── Events table ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${editId ? 'hidden xl:block' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No events yet</p>
            <p className="text-sm mt-1">Create your first event using the sidebar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Venue</th>
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className={`transition-colors ${editId === ev.id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{ev.title}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-slate-500 whitespace-nowrap">{ev.date ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-500 truncate max-w-[140px]">{ev.venue ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 transition-colors ${
                            editId === ev.id
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                          }`}
                          onClick={() => editId === ev.id ? closeDrawer() : openEdit(ev.id)}
                          title={editId === ev.id ? 'Close editor' : 'Edit event'}
                        >
                          {editId === ev.id ? <X size={14} /> : <Pencil size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(ev.id, ev.title)}
                          disabled={deleting === ev.id}
                          title="Delete event"
                        >
                          {deleting === ev.id
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
                  <span className="text-sm font-bold text-slate-800">Edit Event</span>
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
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
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
                  <EventForm
                    key={editId}
                    initialData={editInitialData}
                    onSubmit={handleEditSubmit}
                    submitLabel="Save Changes"
                    loadingLabel="Saving..."
                    successMessage="Event updated successfully!"
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
