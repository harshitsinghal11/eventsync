'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Building2,
  Clock,
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
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
  stipend?: string;
  eligibility?: string;
  [key: string]: unknown;
}

interface FetchState {
  opportunity: Opportunity | null;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  Research:   'bg-teal-100 text-teal-700',
  Leadership: 'bg-indigo-100 text-indigo-700',
  Volunteer:  'bg-rose-100 text-rose-700',
  Internship: 'bg-amber-100 text-amber-700',
};

const typeBg: Record<string, string> = {
  Research:   'from-teal-700 to-teal-950',
  Leadership: 'from-indigo-700 to-indigo-950',
  Volunteer:  'from-rose-700 to-rose-950',
  Internship: 'from-amber-700 to-amber-950',
};

/**
 * Detect the type of contact info and return an appropriate icon + href.
 * Handles email, phone, URL, or plain text.
 */
function parseContactInfo(raw: string): {
  icon: React.ElementType;
  label: string;
  href: string | null;
} {
  const trimmed = raw.trim();
  if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(trimmed)) {
    return { icon: Mail, label: trimmed, href: `mailto:${trimmed}` };
  }
  if (/^[+\d][\d\s\-().]{6,}$/.test(trimmed)) {
    return { icon: Phone, label: trimmed, href: `tel:${trimmed.replace(/\s/g, '')}` };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { icon: ExternalLink, label: trimmed, href: trimmed };
  }
  return { icon: MessageSquare, label: trimmed, href: null };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className ?? ''}`} />;
}

function LoadingSkeleton() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-slate-800 py-20">
        <div className="container mx-auto px-4 space-y-4">
          <Skeleton className="h-4 w-36 bg-slate-700" />
          <Skeleton className="h-6 w-24 bg-slate-700" />
          <Skeleton className="h-12 w-2/3 bg-slate-700" />
          <Skeleton className="h-5 w-48 bg-slate-700" />
        </div>
      </section>

      {/* Body skeleton */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-36 mt-4" />
            </div>
            {/* Sidebar */}
            <div className="space-y-4">
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <section className="py-24 bg-slate-50 min-h-[60vh] flex items-center">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Couldn't load opportunity</h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">{message}</p>
        <Link
          href="/opportunity"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
        >
          <ArrowLeft size={16} /> Back to Opportunities
        </Link>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<FetchState>({
    opportunity: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setState({ opportunity: null, loading: true, error: null });
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }

        if (!cancelled) {
          setState({ opportunity: json.opportunity, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ opportunity: null, loading: false, error: String(err) });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const { opportunity: opp, loading, error } = state;

  // ── Loading ──
  if (loading) return <LoadingSkeleton />;

  // ── Error ──
  if (error || !opp) return <ErrorState message={error ?? 'Opportunity not found.'} />;

  // ── Resolved ──
  const heroBg      = typeBg[opp.type ?? '']    ?? 'from-slate-800 to-slate-950';
  const typeBadge   = typeColors[opp.type ?? ''] ?? 'bg-slate-100 text-slate-700';
  const contact     = opp.contact_info ? parseContactInfo(String(opp.contact_info)) : null;

  const sidebarItems = [
    { icon: Building2, label: 'Organization', value: opp.organization },
    { icon: Clock,     label: 'Deadline',     value: opp.deadline },
  ].filter((item) => Boolean(item.value));

  return (
    <>
      <title>{opp.title} – EventSync</title>
      <meta name="description" content={opp.description ?? `Details for ${opp.title}`} />

      {/* ── Hero Banner ── */}
      <section className={`bg-gradient-to-br ${heroBg} py-20 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/opportunity"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {opp.type && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${typeBadge}`}>
                {opp.type}
              </span>
            )}
            {opp.stipend && (
              <span className="text-xs font-semibold text-green-300 bg-green-900/40 px-3 py-1.5 rounded-full">
                {String(opp.stipend)}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 max-w-2xl leading-tight">
            {opp.title}
          </h1>

          {opp.organization && (
            <p className="text-white/70 text-lg flex items-center gap-2">
              <Building2 size={16} className="shrink-0" />
              {String(opp.organization)}
            </p>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main Column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              {opp.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                >
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-5">
                    About This Opportunity
                  </h2>
                  <div className="space-y-4">
                    {String(opp.description)
                      .split('\n\n')
                      .map((para, i) => (
                        <p key={i} className="text-slate-600 leading-relaxed">
                          {para}
                        </p>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Contact Info */}
              {contact && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                >
                  <h2 className="text-xl font-extrabold text-slate-900 mb-5">Contact</h2>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <contact.icon size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Reach out via</p>
                      {contact.href ? (
                        <a
                          href={contact.href}
                          target={contact.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline break-all"
                        >
                          {contact.label}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-slate-800 break-all">
                          {contact.label}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <div className="pt-2">
                <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-10 py-3.5 rounded-xl shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Apply Now
                </button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">

              {/* Key Details */}
              {sidebarItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <h3 className="font-bold text-slate-900 text-lg mb-5">Details</h3>
                  <div className="space-y-4">
                    {sidebarItems.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">{label}</p>
                          <p className="text-sm font-semibold text-slate-800">{String(value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Deadline urgency pill */}
              {opp.deadline && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3"
                >
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Application Deadline</p>
                    <p className="text-sm text-amber-700 font-semibold mt-0.5">
                      {String(opp.deadline)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Submit your application before this date.</p>
                  </div>
                </motion.div>
              )}

              {/* Eligibility */}
              {opp.eligibility && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.24 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <h3 className="font-bold text-slate-900 text-base mb-3">Eligibility</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{String(opp.eligibility)}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

