import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SessionData {
  isLoggedIn: boolean;
  email?: string;
  role?: 'master' | 'client';
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'change-...',
  cookieName: 'pokemon-wiz-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
  return session;
}

export async function login(password: string, role?: 'master' | 'client'): Promise<'master' | 'client' | false> {
  if (password === process.env.ADMIN_PASSWORD && (!role || role === 'master')) {
    const session = await getSession();
    session.isLoggedIn = true;
    session.email = 'master@pokemonwiz';
    session.role = 'master';
    await session.save();
    return 'master';
  }
  if (password === process.env.CLIENT_PASSWORD && (!role || role === 'client')) {
    const session = await getSession();
    session.isLoggedIn = true;
    session.email = 'client@pokemonwiz';
    session.role = 'client';
    await session.save();
    return 'client';
  }
  return false;
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

export async function requireAuth(): Promise<void> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/login');
  }
}
