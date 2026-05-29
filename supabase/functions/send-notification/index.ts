// Brokedian Notification Sender Edge Function
// Deploy: supabase functions deploy send-notification --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

interface NotificationPayload {
  type: string
  title: string
  body: string
  email: string
  userId: string
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    const { type, title, body, email } = payload

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured — email not sent')
      return new Response(JSON.stringify({ ok: true, note: 'email skipped' }), { status: 200 })
    }

    const resend = new Resend(RESEND_API_KEY)

    await resend.emails.send({
      from: 'Brokedian <notifications@brokedian.app>',
      to: email,
      subject: title,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f5f5f7;">
          <div style="background: #fff; border-radius: 16px; padding: 32px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; background: #007AFF; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.37 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
              </div>
              <h2 style="font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #1D1D1F; margin: 0 0 4px;">${title}</h2>
              <p style="font-size: 15px; color: #6E6E73; margin: 0;">${body}</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #E8E8EE; padding-top: 16px;">
              <p style="font-size: 12px; color: #86868B; margin: 0;">Sent from Brokedian — Income Control</p>
            </div>
          </div>
        </div>
      `
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    console.error('Notification error:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
