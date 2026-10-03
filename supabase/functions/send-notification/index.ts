import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async request => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { userId, title, body, type = 'general', data = {} } = await request.json();
  if (!userId || !title) return new Response('userId and title are required', { status: 400 });
  const { data: notification, error } = await supabase.from('notifications').insert({ user_id: userId, title, body, type, data }).select().single();
  if (error) return new Response(error.message, { status: 400 });
  // Send FCM/Web Push here using secrets; never expose provider credentials to the client.
  return Response.json(notification);
});
