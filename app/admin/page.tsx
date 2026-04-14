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
  Menu,
  X,
} from 'lucide-react';
import { getSession, clearSession, AdminSession } from '@/lib/session';

// Depending on your setup, you might want to dynamically import these later
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  function handleNavClick(id: SectionId) {
    setActive(id);
    setIsMobileMenuOpen(false); // Close mobile menu when an item is clicked
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

  // Extracted Sidebar Content for reuse in both Desktop and Mobile views
  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard size={15} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Admin
            </p>
            <p className="text-sm font-bold text-white leading-tight">EventSync</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          className="md:hidden p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              {group === 'Events' ? (
                <CalendarDays size={10} className="inline mr-1" />
              ) : (
                <Briefcase size={10} className="inline mr-1" />
              )}
              {group}
            </p>
            <div className="space-y-0.5">
              {SIDEBAR.filter((s) => s.group === group).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
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

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <title>Admin Dashboard - EventSync</title>
      <meta name="description" content="EventSync admin dashboard." />

      <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex shrink-0">
          {SidebarContent}
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 flex md:hidden"
              >
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <activeItem.icon size={15} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                {activeItem.label}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">{activeItem.group}</p>
            </div>
          </header>

          {/* Dynamic Panel Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="h-full"
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