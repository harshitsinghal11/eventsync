'use client';

import { useState, FormEvent } from 'react';
import { CheckCircle2, Loader2, UserPlus, Trash2, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coordinator {
  id: string;   // local key only — not sent to DB
  name: string;
  phone: string;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  duration: string;
  category: string;
  perks: string;
  registration_link: string;
}

const EMPTY_FORM: FormState = {
  title: '', description: '', date: '', time: '',
  venue: '', duration: '', category: '', perks: '',
  registration_link: '',
};

function newCoordinator(): Coordinator {
  return { id: crypto.randomUUID(), name: '', phone: '' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateEventPanel() {
  const [form, setForm]               = useState<FormState>(EMPTY_FORM);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [warning, setWarning]         = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  // ── Field helpers ──────────────────────────────────────────────────────────

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setSuccess(false);
      setError(null);
      setWarning(null);
    };
  }

  // ── Coordinator helpers ────────────────────────────────────────────────────

  function addCoordinator() {
    setCoordinators((prev) => [...prev, newCoordinator()]);
  }

  function updateCoordinator(id: string, field: 'name' | 'phone', value: string) {
    setCoordinators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  }

  function removeCoordinator(id: string) {
    setCoordinators((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setWarning(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          perks: form.perks
            ? form.perks.split(',').map((p) => p.trim()).filter(Boolean)
            : [],
          registration_link: form.registration_link.trim() || null,
          coordinators: coordinators
            .filter((c) => c.name.trim())
            .map(({ name, phone }) => ({ name, phone })),
        }),
      });

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error('Server returned an invalid response.');
      }

      if (!res.ok) throw new Error(json.error ?? 'Failed to create event.');

      if (json.warning) setWarning(json.warning);

      setSuccess(true);
      setForm(EMPTY_FORM);
      setCoordinators([]);
    } catch (err) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Shared input class to force light theme rendering
  const lightInputClass = "bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 focus-visible:ring-primary";

  return (
    <div className="mx-auto w-full">
      <p className="text-slate-500 text-sm mb-6">
        Fill in the details below to add a new event. Add coordinators at the bottom.
      </p>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-5"
          >
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              Event created successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning banner */}
      <AnimatePresence>
        {warning && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm font-medium">
              ⚠ {warning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ── Event Details Card ── */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Event Details</h2>

            <Field label="Title *" htmlFor="ev-title">
              <Input
                id="ev-title"
                value={form.title}
                onChange={setField('title')}
                placeholder="e.g. Tech Hackathon 2026"
                required
                disabled={loading}
                className={lightInputClass}
              />
            </Field>

            <Field label="Description" htmlFor="ev-desc">
              <textarea
                id="ev-desc"
                value={form.description}
                onChange={setField('description')}
                rows={4}
                placeholder="Describe the event…"
                disabled={loading}
                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 resize-none disabled:cursor-not-allowed disabled:opacity-50 ${lightInputClass}`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date *" htmlFor="ev-date">
                <Input id="ev-date" type="date" value={form.date} onChange={setField('date')} required disabled={loading} className={lightInputClass} />
              </Field>
              <Field label="Time" htmlFor="ev-time">
                <Input id="ev-time" type="time" value={form.time} onChange={setField('time')} disabled={loading} className={lightInputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Venue" htmlFor="ev-venue">
                <Input id="ev-venue" value={form.venue} onChange={setField('venue')} placeholder="e.g. Main Auditorium" disabled={loading} className={lightInputClass} />
              </Field>
              <Field label="Duration" htmlFor="ev-duration">
                <Input id="ev-duration" value={form.duration} onChange={setField('duration')} placeholder="e.g. 3 hours" disabled={loading} className={lightInputClass} />
              </Field>
            </div>

            <Field label="Category" htmlFor="ev-category">
              <select
                id="ev-category"
                value={form.category}
                onChange={setField('category')}
                disabled={loading}
                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${lightInputClass}`}
              >
                <option value="">Select category</option>
                {['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Perks" htmlFor="ev-perks">
              <Input
                id="ev-perks"
                value={form.perks}
                onChange={setField('perks')}
                placeholder="Comma-separated, e.g. Certificate, Cash Prize, Goodies"
                disabled={loading}
                className={lightInputClass}
              />
              <p className="text-xs text-slate-400 mt-1">Separate multiple perks with commas.</p>
            </Field>

            <Field label="Registration Link" htmlFor="ev-reg-link">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none select-none">URL</span>
                <Input
                  id="ev-reg-link"
                  type="url"
                  value={form.registration_link}
                  onChange={setField('registration_link')}
                  placeholder="https://forms.google.com/..."
                  className={`pl-10 ${lightInputClass}`}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Optional — link to the registration form or portal.</p>
            </Field>
          </div>

          {/* ── Coordinators Card ── */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Coordinators</h2>
                <p className="text-xs text-slate-400 mt-0.5">Optional — add one or more event coordinators.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCoordinator}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <UserPlus size={14} />
                Add
              </Button>
            </div>

            {/* Empty state */}
            {coordinators.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <User size={22} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">No coordinators added yet.</p>
              </div>
            )}

            {/* Coordinator rows */}
            <AnimatePresence initial={false}>
              {coordinators.map((coord, index) => (
                <motion.div
                  key={coord.id}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mt-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-2">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-600">
                          <User size={11} className="inline mr-1" />Name *
                        </Label>
                        <Input
                          value={coord.name}
                          onChange={(e) => updateCoordinator(coord.id, 'name', e.target.value)}
                          placeholder="Full name"
                          className={`h-9 text-sm rounded-lg ${lightInputClass}`}
                          required={coordinators.some((c) => c.name.trim())}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-600">
                          <Phone size={11} className="inline mr-1" />Phone
                        </Label>
                        <Input
                          value={coord.phone}
                          onChange={(e) => updateCoordinator(coord.id, 'phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className={`h-9 text-sm rounded-lg ${lightInputClass}`}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCoordinator(coord.id)}
                      disabled={loading}
                      className="mt-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      title="Remove coordinator"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Submit ── */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-bold text-base shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin mr-2" />Creating Event…</>
          ) : (
            'Create Event'
          )}
        </Button>
      </form>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">{label}</Label>
      {children}
    </div>
  );
}