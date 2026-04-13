'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CalendarDays, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession, AdminSession } from '@/lib/session';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isAuthRoute = pathname.startsWith('/auth');

  // Check session on mount and whenever the path changes (e.g. after login/logout routing)
  useEffect(() => {
    setSession(getSession());
    setIsMounted(true);
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/opportunity', label: 'Opportunities' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <CalendarDays size={16} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Event<span className="text-primary">Sync</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                  ? 'bg-[#0F172B] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            {!isMounted ? (
              <div className="w-[160px] h-9 bg-slate-100 rounded-lg animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-blue-100 text-blue-800 hover:bg-blue-200 shadow-sm active:scale-95"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    clearSession();
                    setSession(null);
                    router.push('/');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-95"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isAuthRoute
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'bg-blue-800 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-95'
                  }`}
              >
                Login
              </Link>
            )}
          </div>


          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isMounted ? null : session ? (
                <>
                  <Link
                    href="/admin"
                    className="mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      clearSession();
                      setSession(null);
                      setIsMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white text-center"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
