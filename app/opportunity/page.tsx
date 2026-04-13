'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Building2, Clock, ChevronRight,
  Loader2, AlertCircle, Briefcase, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  deadline?: string;
  contact_info?: string;
  type?: string;
  eligibility?: string;
}

type OppType = 'All' | 'Internship' | 'Volunteer' | 'Research' | 'Leadership' | 'Other';

const TYPES: OppType[] = ['All', 'Internship', 'Research', 'Leadership', 'Volunteer', 'Other'];

const TYPE_COLORS: Record<string, string> = {
  Research: 'bg-teal-100 text-teal-700',
  Leadership: 'bg-indigo-100 text-indigo-700',
  Volunteer: 'bg-rose-100 text-rose-700',
  Internship: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-600',
};

const TYPE_BAR: Record<string, string> = {
  Research: 'from-teal-700 to-teal-900',
  Leadership: 'from-indigo-700 to-indigo-900',
  Volunteer: 'from-rose-700 to-rose-900',
  Internship: 'from-amber-700 to-amber-900',
  Other: 'from-slate-700 to-slate-900',
};

// Deadline filter options
type DeadlineFilter = 'all' | 'this-week' | 'this-month' | 'next-month' | 'expired';

const DEADLINE_FILTERS: { value: DeadlineFilter; label: string }[] = [
  { value: 'all', label: 'Any deadline' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'next-month', label: 'Next month' },
  { value: 'expired', label: 'Expired' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDeadline(str?: string): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function matchesDeadlineFilter(deadlineStr: string | undefined, filter: DeadlineFilter): boolean {
  if (filter === 'all') return true;
  const d = parseDeadline(deadlineStr);
  if (!d) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (filter === 'expired') return deadlineDay < today;

  if (filter === 'this-week') {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return deadlineDay >= today && deadlineDay <= weekEnd;
  }

  if (filter === 'this-month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  if (filter === 'next-month') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return d.getFullYear() === nextMonth.getFullYear() && d.getMonth() === nextMonth.getMonth();
  }

  return true;
}

function formatDeadline(str?: string): string {
  if (!str) return '—';
  const d = parseDeadline(str);
  if (!d) return str;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpiringSoon(str?: string): boolean {
  const d = parseDeadline(str);
  if (!d) return false;
  const diff = d.getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' as const },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpportunityPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<OppType>('All');
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('all');

  // ── Fetch ────────────────────────────────────────────────────────────────

  async function fetchOpps() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load opportunities.');
      setOpps(json.data ?? json.opportunities ?? json ?? []);
    } catch (err) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOpps(); }, []);

  // ── Filter (client-side, reactive) ───────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opps.filter((op) => {
      const matchSearch =
        !q ||
        op.title.toLowerCase().includes(q) ||
        (op.organization ?? '').toLowerCase().includes(q);

      const matchType =
        activeType === 'All' || op.type === activeType;

      const matchDeadline = matchesDeadlineFilter(op.deadline, deadlineFilter);

      return matchSearch && matchType && matchDeadline;
    });
  }, [opps, search, activeType, deadlineFilter]);

  const hasActiveFilters = search !== '' || activeType !== 'All' || deadlineFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setActiveType('All');
    setDeadlineFilter('all');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <title>Opportunities – EventSync</title>
      <meta name="description" content="Find internships, volunteer roles, research positions, and leadership opportunities on campus." />

      {/* Page Header */}
      <section className="bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
              Build Your Future
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Opportunities
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Internships, volunteer roles, research positions, and leadership programs — all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 space-y-3">

          {/* Row 1: search + deadline filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input
                type="text"
                placeholder="Search by title or organization…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Deadline filter */}
            <div className="flex gap-1.5 flex-wrap">
              {DEADLINE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDeadlineFilter(value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${deadlineFilter === value
                    ? 'bg-blue-950 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: type tabs + clear */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeType === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap shrink-0"
                >
                  <X size={12} /> Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="container mx-auto px-4">

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
              <Loader2 size={20} className="animate-spin" /> Loading opportunities…
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 max-w-lg mx-auto">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Failed to load opportunities</p>
                <p className="text-sm mt-0.5">{error}</p>
                <button onClick={fetchOpps} className="text-sm font-semibold underline mt-2">
                  Retry
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Briefcase size={36} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-semibold text-lg">No opportunities match your filters</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or clearing the filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {filtered.length} opportunit{filtered.length !== 1 ? 'ies' : 'y'} found
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-3 text-xs font-semibold text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group border border-slate-100"
                  >
                    {/* Top accent bar */}
                    <div
                      className={`h-2 bg-gradient-to-r ${TYPE_BAR[opp.type ?? ''] ?? 'from-slate-700 to-slate-900'
                        }`}
                    />

                    <div className="p-6">
                      {/* Type badge */}
                      <div className="flex items-start justify-between mb-3">
                        {opp.type ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[opp.type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {opp.type}
                          </span>
                        ) : <span />}

                        {/* Urgency pill */}
                        {isExpiringSoon(opp.deadline) && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 animate-pulse">
                            Closing soon
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {opp.title}
                      </h3>

                      {opp.organization && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
                          <Building2 size={13} className="shrink-0" />
                          <span className="line-clamp-1">{opp.organization}</span>
                        </div>
                      )}

                      {opp.deadline && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                          <Clock size={13} className="shrink-0" />
                          <span>Deadline: {formatDeadline(opp.deadline)}</span>
                        </div>
                      )}

                      {opp.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-5">
                          {opp.description}
                        </p>
                      )}

                      <Link
                        href={`/opportunity/${opp.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                      >
                        Learn More <ChevronRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

