# Brokedian — Project Status Report

## Overview
Thailand-focused invoicing + financial runway PWA for freelancers. Originally single-file localStorage app, now migrating to SaaS with Supabase backend.

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS PWA (`index.html` ~3061 lines + `styles.css` ~760 lines) |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage) |
| External JS | `supabase.js` (~298 lines) — Supabase client wrapper + auth + data sync |
| Email | Resend (via `send-notification` Edge Function) |
| Push | Web Push API (via `sw.js` + VAPID) |
| PDF | html2pdf.js (mobile) / `window.print()` (desktop) |
| QR | qrcode-generator 1.4.4 (PromptPay codes) |
| Image crop | CropperJS 1.6.2 (logo upload) |

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~3061 | Main app: HTML structure, UI logic, business logic, DICTIONARY |
| `styles.css` | ~760 | All styles: variables, layout, components, print, auth, i18n Thai |
| `supabase.js` | ~298 | Supabase client: auth, notifications, data sync, push subscription |
| `sw.js` | 67 | Service worker: offline cache (v13), push handler |
| `supabase-schema.sql` | 205 | Full DB schema: 7 tables, RLS policies, triggers |
| `STATUS.md` | — | This file |

### Edge Functions (source written, deployment status unknown)

| Function | File | Purpose |
|----------|------|---------|
| `send-notification` | `supabase/functions/send-notification/index.ts` | Sends branded HTML emails via Resend |
| `vapid-public-key` | `supabase/functions/vapid-public-key/index.ts` | Returns VAPID public key for Web Push |

## Database (Supabase)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User business info, tier, brand color, logo | `auth.uid() = id` |
| `clients` | Invoices with line items (JSONB), status, amounts | `auth.uid() = user_id` |
| `quotes` | Quotes with items, expiry, status | `auth.uid() = user_id` |
| `forecast_deals` | Pipeline deals with probability, amount | `auth.uid() = user_id` |
| `notification_prefs` | 6 boolean toggles (email + push per event) | `auth.uid() = user_id` |
| `notifications` | Log of sent notifications | `auth.uid() = user_id` |
| `push_subscriptions` | Web Push subscription data (JSONB) | `auth.uid() = user_id` |

Each data table (`clients`, `quotes`, `forecast_deals`) has a `local_id` column with a unique index on `(user_id, local_id)` for idempotent upsert during localStorage → cloud sync.

### Triggers
- `handle_new_user()` — on auth signup, auto-creates profile + notification_prefs row
- `update_updated_at()` — on UPDATE of any table, sets `updated_at = NOW()`

## Auth

| Method | Status |
|--------|--------|
| Email + Password | Implemented (email confirmation: ON by default in Supabase) |
| Google OAuth | Implemented (PKCE flow, redirect handling) |

Flow: `onAuthStateChange` listener → calls `afterAuth()` → push subscribe → load profile → migrate localStorage → hydrate cloud data → load notif prefs → render.

## Notification System

### Event Types (3)
1. `invoice_created` — when a new invoice is saved
2. `payment_received` — when an invoice status changes to "paid"
3. (overdue reminders — defined in prefs UI but not yet wired to a cron)

### Delivery Channels
| Channel | Mechanism | Status |
|---------|-----------|--------|
| In-app | Insert to `notifications` table | Implemented |
| Email | Resend via `send-notification` Edge Function | Source ready, needs deploy |
| Push | Web Push via service worker + VAPID | Source ready, needs deploy |

### Current Behavior
- `canSendNotification()` is a stub — always returns `{allowed: true, remaining: Infinity}` (FREE_LIMITS.notifications = 3 is defined but not enforced)
- `useNotification()` calls `supabaseClient.sendNotification()` which inserts to DB and calls Edge Function
- Notification prefs UI is gated: toggles only save for Pro users (free users see a banner prompting upgrade)

## Data Sync

| Function | Trigger | What it does |
|----------|---------|-------------|
| `saveState(key, data)` | Any data mutation | Writes to localStorage, then calls `supabaseClient.syncData()` if signed in |
| `syncData(key, data)` | Called from saveState | Upserts each item to the corresponding Supabase table |
| `loadData(key)` | Called from `hydrateMergedCloudData()` | Fetches all rows for user from Supabase, replaces localStorage |
| `migrateLocalData()` | Called once per user from `afterAuth()` | Pushes existing localStorage (clients, quotes, pipeline, biz) to Supabase |
| `saveProfileInfo()` | Profile form input | Saves to localStorage + calls `updateProfile()` on Supabase |

Sync supports `local_id` for idempotent upsert — existing records are updated, new ones inserted.

## Free Tier Limits

| Limit | Value | Enforced? |
|-------|-------|-----------|
| Clients | 5 | Yes |
| Invoices/month | 5 | Yes |
| Quotes/month | 5 | Yes |
| Pipeline deals | 3 | Yes |
| Line items | 5 | Yes |
| Notifications | 3 (defined) | No — `canSendNotification` is a permanent stub returning `Infinity` |

## Environment Variables (Supabase Secrets)

| Secret | Purpose | Set? |
|--------|---------|------|
| `RESEND_API_KEY` | Resend email API key | Set by user |
| `VAPID_PUBLIC_KEY` | Web Push public key | Set by user |
| `VAPID_PRIVATE_KEY` | Web Push private key | Set by user |

## Cache

| Reference | Value |
|-----------|-------|
| `styles.css` version | `v=52` |
| SW internal version | `v13` |
| SW ASSETS | `./`, `index.html`, `manifest.json`, `styles.css?v=52`, `supabase.js` |

## Latest Changes (2026-06-01)

### Sign-out consolidation
Removed duplicate sign-out buttons. Previously there were 4 sign-out buttons total:
- 1 in `nav-bottom-actions` (hidden on mobile)
- 3 `mobile-logout-btn` in page headers (dashboard, invoices, profile — hidden on desktop)

Now there's exactly **1** sign-out button as a `.nav-item` in the main nav with `data-auth-signed-in` — visible on both mobile and desktop when signed in. The `.mobile-logout-btn` CSS class and all page-header sign-out buttons were removed.

### Files changed
- `index.html` — removed 3 mobile-logout-btn + 1 nav-bottom-actions sign out, added 1 nav-item sign out
- `styles.css` — removed `.mobile-logout-btn` CSS rules (-4 lines)

## What's Still Pending

1. **Deploy Edge Functions** — `send-notification` and `vapid-public-key` need `supabase functions deploy` from `E:\Git\brokedian`
2. **Test email auth** — may need to disable email confirmation in Supabase Auth settings
3. **Test Google OAuth redirect** — Site URL must be `http://localhost:3000` in Supabase Auth settings
4. **Stripe payments** (฿59/mo Broke Pro) — Phase 3
5. **Android build** (TWA → Google Play) — Phase 4
6. **iOS App Store** — Phase 5
