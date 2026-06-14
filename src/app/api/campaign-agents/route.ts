import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../db';
import { redirect } from 'next/navigation';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  // Handle form-encoded submissions (from HTML forms)
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const method = formData.get('_method') as string | null;

    if (method === 'DELETE') {
      // Remove agent from campaign
      const url = new URL(req.url);
      const campaign_id = parseInt(url.searchParams.get('campaign_id') || formData.get('campaign_id') as string);
      const agent_id = parseInt(formData.get('agent_id') as string);

      if (!campaign_id || !agent_id) {
        return NextResponse.redirect(new URL('/admin/campaigns', req.url));
      }

      await supabase
        .from('campaign_agents')
        .delete()
        .eq('campaign_id', campaign_id)
        .eq('agent_id', agent_id);

      return NextResponse.redirect(new URL(`/admin/campaigns/${campaign_id}`, req.url));
    }

    // Assign agent to campaign
    const campaign_id = parseInt(formData.get('campaign_id') as string);
    const agent_id = parseInt(formData.get('agent_id') as string);

    if (!campaign_id || !agent_id) {
      return NextResponse.redirect(new URL('/admin/campaigns', req.url));
    }

    await supabase
      .from('campaign_agents')
      .insert({ campaign_id, agent_id, is_lead: false });

    return NextResponse.redirect(new URL(`/admin/campaigns/${campaign_id}`, req.url));
  }

  // Handle JSON submissions
  const body = await req.json();
  const { campaign_id, agent_id, is_lead } = body;

  if (!campaign_id || !agent_id) {
    return NextResponse.json({ error: 'campaign_id and agent_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('campaign_agents')
    .insert({ campaign_id, agent_id, is_lead: is_lead || false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaign_id = parseInt(searchParams.get('campaign_id') || '');
  const agent_id = parseInt(searchParams.get('agent_id') || '');

  if (!campaign_id || !agent_id) {
    return NextResponse.json({ error: 'campaign_id and agent_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('campaign_agents')
    .delete()
    .eq('campaign_id', campaign_id)
    .eq('agent_id', agent_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
