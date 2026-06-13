import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SessionData {
  isLoggedIn: boolean;
  email?: string;
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

export async function login(password: string): Promise<boolean> {
  if (password === process.env.ADMIN_PASSWORD) {
    const session = await getSession();
    session.isLoggedIn = true;
    session.email = 'admin@pokemonwiz';
    await session.save();
    return true;
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
