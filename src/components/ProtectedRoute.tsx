'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';

/**
 * Client-side route guard for pages that require an admin session.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      router.replace('/auth/login');
    }
  }, [router, session]);

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
