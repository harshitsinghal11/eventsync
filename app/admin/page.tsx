'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  LogOut,
  PlusCircle,
  List,
  ChevronRight,
} from 'lucide-react';
import { getSession, clearSession, AdminSession } from '@/lib/session';
import CreateEventPanel from '@/components/admin/CreateEventPanel';
import ManageEventsPanel from '@/components/admin/ManageEventsPanel';
import CreateOpportunityPanel from '@/components/admin/CreateOpportunityPanel';
import ManageOpportunitiesPanel from '@/components/admin/ManageOpportunitiesPanel';

type SectionId =
  | 'create-event'
  | 'manage-events'
  | 'create-opportunity'
  | 'manage-opportunities';

interface SidebarItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  group: string;
}

const SIDEBAR: SidebarItem[] = [
  { id: 'create-event', label: 'Create Event', icon: PlusCircle, group: 'Events' },
  { id: 'manage-events', label: 'Manage Events', icon: List, group: 'Events' },
  { id: 'create-opportunity', label: 'Create Opportunity', icon: PlusCircle, group: 'Opportunities' },
  { id: 'manage-opportunities', label: 'Manage Opportunities', icon: List, group: 'Opportunities' },
];

const GROUPS = ['Events', 'Opportunities'];

export default function AdminPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSessionState] = useState<AdminSession | null>(null);
  const [active, setActive] = useState<SectionId>('create-event');

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/auth/login');
    } else {
      setSessionState(s);
    }
    setIsMounted(true);
  }, [router]);

  if (!isMounted || !session) return null;

  function handleLogout() {
    clearSession();
    router.replace('/auth/login');
  }

  function renderPanel() {
    switch (active) {
      case 'create-event':
        return <CreateEventPanel />;
      case 'manage-events':
        return <ManageEventsPanel />;
      case 'create-opportunity':
        return <CreateOpportunityPanel />;
      case 'manage-opportunities':
        return <ManageOpportunitiesPanel />;
      default:
        return null;
    }
  }

  const activeItem = SIDEBAR.find((s) => s.id === active)!;

  return (
    <>
      <title>Admin Dashboard - EventSync</title>
      <meta name="description" content="EventSync admin dashboard." />

      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <aside className="w-64 bg-slate-900 text-white flex-col shrink-0 hidden md:flex">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
              <p className="text-sm font-bold text-white leading-tight">EventSync</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {GROUPS.map((group) => (
              <div key={group}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                  {group === 'Events' ? <CalendarDays size={10} className="inline mr-1" /> : <Briefcase size={10} className="inline mr-1" />}
                  {group}
                </p>
                <div className="space-y-0.5">
                  {SIDEBAR.filter((s) => s.group === group).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActive(id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active === id
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} />
                        {label}
                      </div>
                      {active === id && <ChevronRight size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

        </aside>

        <main className="flex-1 overflow-auto flex flex-col">
          <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <activeItem.icon size={15} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{activeItem.label}</h1>
              <p className="text-xs text-slate-400">{activeItem.group}</p>
            </div>
          </div>

          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
