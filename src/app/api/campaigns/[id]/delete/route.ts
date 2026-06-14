import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cid = parseInt(id);

    if (!cid || isNaN(cid)) {
      return NextResponse.redirect(new URL('/admin/campaigns?error=Invalid campaign ID', req.url));
    }

    // Delete related records first to avoid FK constraint violations
    // cascade: campaign_agents (FK), but inventory, audit_logs, transactions are no-action
    const { error: errInventory } = await supabase
      .from('inventory')
      .update({ campaign_id: null })
      .eq('campaign_id', cid);

    if (errInventory) {
      console.error('Inventory unlink error:', errInventory);
      return NextResponse.redirect(new URL(`/admin/campaigns?error=Failed to unlink inventory: ${errInventory.message}`, req.url));
    }

    const { error: errAudit } = await supabase
      .from('audit_logs')
      .update({ campaign_id: null })
      .eq('campaign_id', cid);

    if (errAudit) {
      console.error('Audit log unlink error:', errAudit);
      // Non-blocking — proceed anyway
    }

    const { error: errTx } = await supabase
      .from('transactions')
      .update({ campaign_id: null })
      .eq('campaign_id', cid);

    if (errTx) {
      console.error('Transaction unlink error:', errTx);
      // Non-blocking
    }

    // Delete campaign_agents
    const { error: errCA } = await supabase
      .from('campaign_agents')
      .delete()
      .eq('campaign_id', cid);

    if (errCA) {
      console.error('Campaign agents delete error:', errCA);
      return NextResponse.redirect(new URL(`/admin/campaigns?error=Failed to remove agent assignments: ${errCA.message}`, req.url));
    }

    // Finally delete the campaign itself
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', cid);

    if (error) {
      console.error('Delete campaign error:', error);
      return NextResponse.redirect(new URL(`/admin/campaigns?error=Delete failed: ${error.message}`, req.url));
    }

    return NextResponse.redirect(new URL('/admin/campaigns?deleted=true', req.url));
  } catch (e) {
    console.error('Delete campaign unexpected error:', e);
    return NextResponse.redirect(new URL(`/admin/campaigns?error=Unexpected error: ${e instanceof Error ? e.message : 'Unknown'}`, req.url));
  }
}
