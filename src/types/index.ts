export interface AdminSession {
  id: string | number;
  email: string;
  name?: string | null;
  role: string;
  loginAt: string;
  expiresAt: string;
}

export interface Coordinator {
  id?: string;
  event_id?: string;
  name: string;
  role?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
  duration?: string;
  registration_link?: string;
  perks?: string;
  created_at?: string;
  updated_at?: string;
  event_coordinators?: Coordinator[];
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  deadline?: string;
  contact_info?: string;
  type?: string;
  stipend?: string;
  eligibility?: string;
  registration_link?: string;
  created_at?: string;
  updated_at?: string;
}
