'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkRegistrationStatus, registerForEvent } from '@/src/actions/registrationActions';

export default function RegistrationButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [status, setStatus] = useState<{ isRegistered: boolean; isAuthenticated: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await checkRegistrationStatus(eventId);
        setStatus(result);
      } catch (err) {
        console.error('Failed to fetch registration status:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [eventId]);

  async function handleRegister() {
    if (!status?.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const res = await registerForEvent(eventId);
      if (res.error) {
        setError(res.error);
      } else {
        setStatus({ isRegistered: true, isAuthenticated: true });
        // Redirect to dashboard to see registration, or just show success
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <Button disabled className="w-full h-12 rounded-xl bg-slate-100 text-slate-400">
        <Loader2 size={18} className="animate-spin mr-2" />
        Checking status...
      </Button>
    );
  }

  if (status?.isRegistered) {
    return (
      <Button disabled className="w-full h-12 rounded-xl font-bold bg-green-100 text-green-700 hover:bg-green-100 border-none opacity-100 flex items-center justify-center gap-2">
        <CheckCircle2 size={18} />
        Registered
      </Button>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <Button
        onClick={handleRegister}
        disabled={registering}
        className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-2"
      >
        {registering ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CalendarPlus size={18} />
            {status?.isAuthenticated ? 'Register Now' : 'Log in to Register'}
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
    </div>
  );
}
