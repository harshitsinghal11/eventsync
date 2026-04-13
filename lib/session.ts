const SESSION_KEY = 'admin_session';

export type AdminSession = {
  id?: string | number;
  email: string;
  name?: string | null;
  role?: string;
  loginAt?: string;
  [key: string]: unknown;
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getSession(): AdminSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session: AdminSession) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}
