import Link from 'next/link';
import { CalendarDays, Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CalendarDays size={16} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Event<span className="text-primary">Sync</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Your campus hub for discovering events, opportunities, and connections that matter.
            </p>
            <div className="flex gap-3 mt-4">
              {[Globe, Mail, Phone].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon size={14} className="text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/events', label: 'Events' },
                { href: '/opportunity', label: 'Opportunities' },
                { href: '/', label: 'About' },
                { href: '/', label: 'Contact' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/auth/login', label: 'Login' },
                { href: '/auth/signup', label: 'Sign Up' },
                { href: '/admin', label: 'Admin' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-500">© 2026 EventSync. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
