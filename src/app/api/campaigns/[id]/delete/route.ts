import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = parseInt(id);

  // Delete campaign_agents first (foreign key)
  await supabase.from('campaign_agents').delete().eq('campaign_id', cid);
  // Delete campaign
  await supabase.from('campaigns').delete().eq('id', cid);

  return NextResponse.redirect(new URL('/admin/campaigns', req.url));
}
