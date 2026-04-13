'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--secondary)))' }}
    >
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white/90">404</h1>
            <h2 className="text-2xl font-semibold text-white/90">Page Not Found</h2>
            <p className="text-white/90">
              Sorry, the page you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/">
              <button
                className="px-8 py-3 bg-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ color: 'hsl(var(--primary))' }}
              >
                Go Home
              </button>
            </Link>
            <button
              className="px-8 py-3 bg-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ color: 'hsl(var(--primary))' }}
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
