// VAPID Public Key for Web Push
// Deploy: supabase functions deploy vapid-public-key --no-verify-jwt
// Set env: supabase secrets set VAPID_PUBLIC_KEY=your_key_here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async () => {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
  return new Response(JSON.stringify({ publicKey }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
