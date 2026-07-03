import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react';
import { getSession } from '@/src/lib/server/auth';
import { createSupabaseClient } from '@/src/lib/server/supabase';
import { Button } from '@/components/ui/button';

// Force dynamic rendering since we depend on cookies/session
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Admins should use /admin instead
  if (session.role === 'admin' || session.role === 'superadmin') {
    redirect('/admin');
  }

  const supabase = createSupabaseClient();
  let registrations: { id: string; events: Record<string, unknown> }[] = [];
  let errorMsg: string | null = null;

  if (supabase) {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*, events(*)')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load registrations:', error);
      errorMsg = 'Failed to load your registrations.';
    } else {
      registrations = data || [];
    }
  } else {
    errorMsg = 'Database not configured.';
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {session.name || 'Student'}!
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your event registrations and campus activities.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">My Registrations</h2>
            <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {registrations.length} Events
            </div>
          </div>

          <div className="p-6">
            {errorMsg ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">{errorMsg}</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <CalendarDays size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 mb-2">No registrations yet</p>
                <p className="mb-6">You haven&apos;t registered for any events. Discover what&apos;s happening on campus!</p>
                <Link href="/events">
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all">
                    Browse Events <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((reg) => {
                  const event = reg.events;
                  if (!event) return null;
                  
                  return (
                    <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all bg-white flex flex-col h-full group">
                      <div className="mb-auto">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                            Registered
                          </span>
                          {event.category && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                              {event.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 mt-4 text-sm text-slate-600">
                          {event.date && (
                            <div className="flex items-center gap-2">
                              <CalendarDays size={14} className="text-primary/70" />
                              <span>{event.date}</span>
                            </div>
                          )}
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-primary/70" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-primary/70" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
