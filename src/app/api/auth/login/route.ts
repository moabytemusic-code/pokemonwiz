import { NextRequest, NextResponse } from 'next/server';
import { login, logout } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password, role } = await req.json();
  const result = await login(password, role);
  if (result) {
    return NextResponse.json({ success: true, role: result });
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}
