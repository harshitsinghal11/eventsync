'use client';

import { useState, FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  organization: string;
  deadline: string;
  contact_info: string;
  type: string;
  eligibility: string;
  registration_link: string;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  organization: '',
  deadline: '',
  contact_info: '',
  type: '',
  eligibility: '',
  registration_link: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateOpportunityPanel() {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function setField(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setSuccess(false);
      setError(null);
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          registration_link: form.registration_link.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create opportunity.');
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full">
      <p className="text-slate-500 text-sm mb-6">
        Fill in the details below to publish a new opportunity. It will appear on the
        public Opportunities page immediately.
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
              Opportunity created and live on the public page!
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
          {/* ── Opportunity Details Card ── */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Opportunity Details
            </h2>

        {/* Title */}
        <Field label="Title *" htmlFor="op-title">
          <Input
            id="op-title"
            value={form.title}
            onChange={setField('title')}
            placeholder="e.g. Research Assistant – AI Lab"
            required
          />
        </Field>

        {/* Description */}
        <Field label="Description" htmlFor="op-desc">
          <textarea
            id="op-desc"
            value={form.description}
            onChange={setField('description')}
            rows={4}
            placeholder="Describe the opportunity, responsibilities, and what applicants can expect…"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </Field>

        {/* Organization + Deadline */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Organization" htmlFor="op-org">
            <Input
              id="op-org"
              value={form.organization}
              onChange={setField('organization')}
              placeholder="e.g. IIT Research Cell"
            />
          </Field>
          <Field label="Deadline" htmlFor="op-deadline">
            <Input
              id="op-deadline"
              type="date"
              value={form.deadline}
              onChange={setField('deadline')}
            />
          </Field>
          </div>
        </div>

        {/* ── Extended Details Card ── */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            Registration & Info
          </h2>

            {/* Contact Info */}
            <Field label="Contact Info *" htmlFor="op-contact">
          <Input
            id="op-contact"
            value={form.contact_info}
            onChange={setField('contact_info')}
            placeholder="Email, phone number, or URL"
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Shown on the detail page — email, phone, or a link all work.
          </p>
        </Field>

        {/* Type */}
        <Field label="Type" htmlFor="op-type">
          <select
            id="op-type"
            value={form.type}
            onChange={setField('type')}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select type</option>
            {['Research', 'Internship', 'Leadership', 'Volunteer', 'Other'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        {/* Eligibility */}
        <Field label="Eligibility" htmlFor="op-eligibility">
          <Input
            id="op-eligibility"
            value={form.eligibility}
            onChange={setField('eligibility')}
            placeholder="e.g. 2nd year and above, CGPA ≥ 7.5"
          />
        </Field>

        {/* Registration Link */}
        <Field label="Registration Link" htmlFor="op-reg-link">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none select-none">URL</span>
            <Input
              id="op-reg-link"
              type="url"
              value={form.registration_link}
              onChange={setField('registration_link')}
              placeholder="https://forms.google.com/..."
              className="pl-10"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Optional — link to the application form or portal.</p>
            </Field>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-bold text-base shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin mr-2" />Creating…</>
          ) : (
            'Create Opportunity'
          )}
        </Button>
      </form>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </Label>
      {children}
    </div>
  );
}

