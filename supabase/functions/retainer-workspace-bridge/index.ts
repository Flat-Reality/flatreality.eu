import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-retainer-bridge-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

function timingSafeEqual(left: string, right: string) {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function stringArray(value: unknown, maximum = 30) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, maximum)
    : [];
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const { data: expectedToken, error: tokenError } = await supabase.rpc('get_retainer_workspace_bridge_token');
    if (tokenError || !timingSafeEqual(request.headers.get('x-retainer-bridge-token') ?? '', String(expectedToken ?? ''))) {
      return json({ error: 'Bridge authorization failed.' }, 401);
    }

    const body = await request.json();
    const action = String(body.action ?? '');

    if (action === 'snapshot') {
      const { data, error } = await supabase
        .from('partner_inquiries')
        .select('id,reference,created_at,updated_at,name,organization,email,project_url,project_description,selected_services,budget_range,timeline,status,privacy_acknowledged,privacy_notice_version,marketing_consent,retainer_configuration,workspace_assignee_ids')
        .eq('inquiry_type', 'retainer_plus')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ inquiries: data ?? [] });
    }

    if (action === 'update_inquiry') {
      const inquiryId = String(body.inquiryId ?? '');
      const status = String(body.status ?? '');
      const assigneeIds = stringArray(body.assigneeIds, 100);
      if (!inquiryId) return json({ error: 'Inquiry ID is required.' }, 400);
      if (!['new', 'reviewing', 'contacted', 'proposal', 'won', 'lost', 'spam'].includes(status)) {
        return json({ error: 'Unsupported inquiry status.' }, 400);
      }
      const { data, error } = await supabase
        .from('partner_inquiries')
        .update({ status, workspace_assignee_ids: assigneeIds, updated_at: new Date().toISOString() })
        .eq('id', inquiryId)
        .eq('inquiry_type', 'retainer_plus')
        .select('id,status,workspace_assignee_ids,updated_at')
        .single();
      if (error) throw error;
      return json({ inquiry: data });
    }

    if (action === 'publish_catalogue') {
      const offerings = Array.isArray(body.offerings) ? body.offerings : [];
      const rows = offerings.slice(0, 100).map((item: Record<string, unknown>) => ({
        id: String(item.id ?? '').slice(0, 100),
        type: String(item.type ?? ''),
        category: String(item.category ?? '').slice(0, 120),
        title: String(item.title ?? '').slice(0, 160),
        description: String(item.description ?? '').slice(0, 2000),
        tags: stringArray(item.tags),
        roles: stringArray(item.roles),
        published: Boolean(item.published),
        availability: ['available', 'limited', 'unavailable', 'unknown'].includes(String(item.availability)) ? String(item.availability) : 'unknown',
        checked_at: item.checkedAt ? String(item.checkedAt) : null,
        reason_code: item.reasonCode ? String(item.reasonCode).slice(0, 100) : null,
        updated_at: new Date().toISOString(),
      })).filter((item) => item.id && ['specialist', 'team', 'capacity'].includes(item.type) && item.category && item.title);
      if (!rows.length) return json({ published: 0 });
      const { error } = await supabase.from('retainer_offerings').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return json({ published: rows.length });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected bridge error.' }, 500);
  }
});
