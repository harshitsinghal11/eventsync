import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

type SignupPayload = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

/**
 * POST /api/auth/signup
 * Body: { name: string; email: string; password: string; confirmPassword: string }
 */
export async function POST(request: Request) {
  try {
    let payload: SignupPayload;

    try {
      payload = (await request.json()) as SignupPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email =
      typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';
    const confirmPassword =
      typeof payload.confirmPassword === 'string' ? payload.confirmPassword : '';

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Name, email, password, and confirm password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirm password must match.' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) {
      console.error('[signup] users lookup error:', existingUserError.message);
      return NextResponse.json(
        { error: 'Database error while checking existing user.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password }]);

    if (insertError) {
      const duplicateEmail =
        insertError.code === '23505' ||
        insertError.message.toLowerCase().includes('duplicate key');

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }

      console.error('[signup] users insert error:', insertError.message);
      return NextResponse.json(
        { error: 'Failed to create account. Check users table schema and RLS.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: { name, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[signup] unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
