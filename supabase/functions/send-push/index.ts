// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2'
import { initializeApp, cert, getApps } from 'npm:firebase-admin@12.2.0/app'
import { getMessaging } from 'npm:firebase-admin@12.2.0/messaging'

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: Deno.env.get('FIREBASE_PROJECT_ID')!,
      clientEmail: Deno.env.get('FIREBASE_CLIENT_EMAIL')!,
      privateKey: Deno.env.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    }),
  })
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const notif = payload.record

    if (!notif) return new Response('No record', { status: 400 })

    let query = sb.from('push_subscriptions').select('fcm_token, user_id')

    if (notif.user_id) {
      query = query.eq('user_id', notif.user_id)
    } else if (notif.role_id) {
      const { data: usuarios } = await sb
        .from('users')
        .select('id')
        .eq('role_id', notif.role_id)
      const ids = (usuarios || []).map((u) => u.id)
      if (ids.length === 0) return new Response('Sin usuarios', { status: 200 })
      query = query.in('user_id', ids)
    } else {
      return new Response('Sin destinatarios', { status: 200 })
    }

    const { data: subs } = await query

    if (!subs || subs.length === 0) {
      return new Response('Sin tokens', { status: 200 })
    }

    const tokens = [...new Set(subs.map((s) => s.fcm_token))]

    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notif.titulo || 'Ecosvuelos',
        body: notif.mensaje || '',
      },
      data: {
        tipo: notif.tipo || 'info',
        entidad: notif.entidad || '',
        entidad_id: String(notif.entidad_id || ''),
      },
    })

    return new Response(
      JSON.stringify({
        ok: true,
        enviados: res.successCount,
        fallidos: res.failureCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})