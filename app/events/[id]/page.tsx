'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
    Calendar,
    MapPin,
    Clock,
    Timer,
    ArrowLeft,
    Gift,
    Phone,
    User,
    AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupabaseEvent {
    id: string;
    title: string;
    description?: string;
    date?: string;
    time?: string;
    venue?: string;
    duration?: string;
    perks?: string | string[];
    category?: string;
    [key: string]: unknown;
}

interface Coordinator {
    id: string;
    event_id: string;
    name: string;
    phone?: string;
    [key: string]: unknown;
}

interface FetchState {
    event: SupabaseEvent | null;
    coordinators: Coordinator[];
    loading: boolean;
    error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise perks — Supabase may store as JSON array or comma-separated string */
function parsePerks(raw: string | string[] | undefined | null): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return raw
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

const categoryColors: Record<string, string> = {
    Tech: 'bg-blue-100 text-blue-700',
    Academic: 'bg-green-100 text-green-700',
    Social: 'bg-pink-100 text-pink-700',
    Sports: 'bg-orange-100 text-orange-700',
    Cultural: 'bg-purple-100 text-purple-700',
};

const categoryBg: Record<string, string> = {
    Tech: 'from-blue-800 to-blue-950',
    Academic: 'from-green-800 to-green-950',
    Social: 'from-pink-800 to-pink-950',
    Sports: 'from-orange-800 to-orange-950',
    Cultural: 'from-purple-800 to-purple-950',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded-lg ${className ?? ''}`} />;
}

function LoadingSkeleton() {
    return (
        <>
            {/* Hero skeleton */}
            <section className="bg-slate-800 py-20">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-4 w-28 mb-8 bg-slate-700" />
                    <Skeleton className="h-6 w-24 mb-4 bg-slate-700" />
                    <Skeleton className="h-12 w-2/3 mb-3 bg-slate-700" />
                    <Skeleton className="h-5 w-1/2 bg-slate-700" />
                </div>
            </section>

            {/* Body skeleton */}
            <section className="py-12 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                            <Skeleton className="h-4 w-full mt-4" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-40 w-full" />
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
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Couldn't load event</h2>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">{message}</p>
                <Link
                    href="/events"
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Events
                </Link>
            </div>
        </section>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [state, setState] = useState<FetchState>({
        event: null,
        coordinators: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function load() {
            setState({ event: null, coordinators: [], loading: true, error: null });
            try {
                const res = await fetch(`/api/events/${id}`);
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.error ?? `HTTP ${res.status}`);
                }

                if (!cancelled) {
                    setState({
                        event: json.event,
                        coordinators: json.coordinators ?? [],
                        loading: false,
                        error: null,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setState({ event: null, coordinators: [], loading: false, error: String(err) });
                }
            }
        }

        load();
        return () => { cancelled = true; };
    }, [id]);

    const { event, coordinators, loading, error } = state;

    // ── Loading ──
    if (loading) return <LoadingSkeleton />;

    // ── Error ──
    if (error || !event) return <ErrorState message={error ?? 'Event not found.'} />;

    // ── Resolved ──
    const perks = parsePerks(event.perks as string | string[] | undefined);
    const heroBg = categoryBg[event.category ?? ''] ?? 'from-slate-800 to-slate-950';
    const categoryBadge = categoryColors[event.category ?? ''] ?? 'bg-slate-100 text-slate-700';

    const detailItems = [
        { icon: Calendar, label: 'Date', value: event.date },
        { icon: Clock, label: 'Time', value: event.time },
        { icon: MapPin, label: 'Venue', value: event.venue },
        { icon: Timer, label: 'Duration', value: event.duration },
    ].filter((item) => Boolean(item.value));

    return (
        <>
            <title>{event.title} – EventSync</title>
            <meta name="description" content={event.description ?? `Details for ${event.title}`} />

            {/* ── Hero Banner ── */}
            <section className={`bg-gradient-to-br ${heroBg} py-20 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Events
                    </Link>

                    {event.category && (
                        <div className="mb-4">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${categoryBadge}`}>
                                {event.category}
                            </span>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 max-w-2xl leading-tight">
                        {event.title}
                    </h1>

                    {event.description && (
                        <p className="text-white/70 text-lg max-w-xl leading-relaxed">{event.description}</p>
                    )}
                </div>
            </section>

            {/* ── Body ── */}
            <section className="py-12 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── Main Column ── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* About */}
                            {event.description && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45 }}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                                >
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-5">About This Event</h2>
                                    <div className="space-y-4">
                                        {event.description.split('\n\n').map((para, i) => (
                                            <p key={i} className="text-slate-600 leading-relaxed">{para}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Perks */}
                            {perks.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.08 }}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                                >
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <Gift size={15} className="text-amber-600" />
                                        </div>
                                        <h2 className="text-xl font-extrabold text-slate-900">Perks</h2>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {perks.map((perk, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                                                <span className="text-slate-600 text-sm leading-relaxed">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Coordinators */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.16 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <User size={15} className="text-primary" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-900">Coordinators</h2>
                                </div>

                                {coordinators.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No coordinators listed for this event.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {coordinators.map((coord, i) => (
                                            <motion.div
                                                key={coord.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                                                className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                                            >
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-bold text-primary">
                                                        {coord.name?.charAt(0).toUpperCase() ?? '?'}
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{coord.name}</p>
                                                    {coord.phone ? (
                                                        <a
                                                            href={`tel:${coord.phone}`}
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                                                        >
                                                            <Phone size={11} />
                                                            {coord.phone}
                                                        </a>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 mt-0.5">No phone listed</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* CTA */}
                            <div className="pt-2">
                                <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-10 py-3.5 rounded-xl shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                                    Register Interest
                                </button>
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <div className="space-y-6">
                            {/* Event Details Card */}
                            {detailItems.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: 0.1 }}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                                >
                                    <h3 className="font-bold text-slate-900 text-lg mb-5">Event Details</h3>
                                    <div className="space-y-4">
                                        {detailItems.map(({ icon: Icon, label, value }) => (
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

                            {/* Coordinator count pill */}
                            {coordinators.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.45, delay: 0.18 }}
                                    className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <User size={16} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {coordinators.length} Coordinator{coordinators.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-slate-500">Available for queries</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

