import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cid = parseInt(id);

    if (!cid) {
      return NextResponse.redirect(new URL('/admin/campaigns', req.url));
    }

    // Delete campaign_agents first (foreign key constraint)
    await supabase.from('campaign_agents').delete().eq('campaign_id', cid);
    // Delete campaign
    const { error } = await supabase.from('campaigns').delete().eq('id', cid);

    if (error) {
      console.error('Delete error:', error);
    }

    return NextResponse.redirect(new URL('/admin/campaigns', req.url));
  } catch (e) {
    console.error('Delete campaign error:', e);
    return NextResponse.redirect(new URL('/admin/campaigns', req.url));
  }
}
