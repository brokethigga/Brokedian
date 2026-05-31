# Brokedian — Project Status Report

## Overview
Brokedian is a Thailand-focused invoicing + financial runway PWA for freelancers. Originally a single-file localStorage app, now undergoing SaaS migration with Supabase backend.

## Architecture
| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS PWA (single `index.html` + `styles.css` + `supabase.js`) |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage) |
| Email | Resend (via Supabase Edge Function) |
| Push | Web Push API (via service worker + VAPID) |
| PDF | Client-side html2pdf (mobile) / `window.print()` (desktop) |

## Current Progress

### Completed
- Supabase project + database schema (profiles, clients, quotes, forecast_deals, notification_prefs, notifications, push_subscriptions)
- Row Level Security on all tables for multi-tenant isolation
- Auth triggers: auto-create profile + notification_prefs on signup
- Auth UI: email/password sign up + sign in, Google OAuth
- PKCE flow for OAuth redirect handling
- `onAuthStateChange` listener for session management
- Notification preferences UI (6 toggles: email + push × 3 event types)
- Service worker push event handler
- Data migration layer: `saveState()` auto-syncs to Supabase, `afterAuth()` migrates localStorage data on first login, profile syncs to `profiles` table
- Edge Function source: `send-notification` (Resend email), `vapid-public-key`
- Resend API key + VAPID keys stored in Supabase secrets

### In Progress / Pending
- Deploy Edge Functions (`supabase functions deploy send-notification --no-verify-jwt` + `vapid-public-key`) — needs `cd E:\Git\brokedian` first
- Test auth flows: email sign-up, sign-in, Google sign-in
- Stripe payment integration (฿59/mo Broke Pro)
- Android build (TWA → Google Play)
- iOS App Store submission

## Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User business profile (extends `auth.users`) |
| `clients` | Invoices with line items |
| `quotes` | Quotes/estimates with line items |
| `forecast_deals` | Pipeline deals for runway forecast |
| `notification_prefs` | Per-user email/push toggle settings |
| `notifications` | Notification log |
| `push_subscriptions` | Web Push subscription data |

## Environment Variables (Supabase Secrets)
- `RESEND_API_KEY` — for sending transactional emails
- `VAPID_PUBLIC_KEY` — Web Push public key
- `VAPID_PRIVATE_KEY` — Web Push private key

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Main app (~3100 lines, all UI + JS logic) |
| `styles.css` | All styles (~730 lines, v=51) |
| `supabase.js` | Supabase client, auth, notification, data sync |
| `sw.js` | Service worker (offline cache + push) |
| `supabase-schema.sql` | Full DB schema + RLS + triggers |
| `supabase/functions/send-notification/index.ts` | Email sending Edge Function |
| `supabase/functions/vapid-public-key/index.ts` | VAPID public key Edge Function |

## Free Tier Limits
- 5 clients, 5 invoices/month, 5 quotes/month, 3 pipeline deals, 5 line items
- Notifications: unlimited (real email + push)

## Pro Tier (฿59/month — not yet implemented)
- Unlimited everything, no watermark, priority support
- Stripe payment integration pending

## Next Milestones
1. Deploy Edge Functions
2. Test auth flows
3. Stripe subscription integration
4. Android Google Play launch
5. iOS App Store submission
