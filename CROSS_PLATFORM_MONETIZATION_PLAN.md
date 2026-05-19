# Brokedian Cross-Platform Monetization Plan

## Goal

Ship Brokedian as one product that works in three places:

- Browser app for desktop freelancers.
- iOS app distributed through the App Store.
- Android app distributed through Google Play.

The recommended route is to keep the web app as the source of truth and package it with Capacitor for iOS and Android. This avoids maintaining separate native codebases while still allowing native app store distribution.

## Recommended Architecture

### Phase 1: Stabilize Current PWA

- Keep the current static PWA working in browsers.
- Fix local-only billing limits, offline caching, and data durability issues.
- Add smoke tests for core flows: create invoice, mark paid, create quote, convert quote, export data.
- Replace CDN-only critical assets with local vendored assets before production release.

### Phase 2: Create Shared Web App Build

- Move from single-file HTML to a simple app structure with `src/`, `public/`, and a build output directory.
- Use one responsive UI for mobile, tablet, and desktop.
- Keep browser deployment as the primary distribution channel.
- Add Capacitor only after the web app has a stable build output.

### Phase 3: Add Backend For Revenue

Use Supabase for:

- User accounts and sessions.
- Cloud sync across desktop, iOS, and Android.
- Tenant isolation with Row Level Security.
- Business profiles and logo storage.
- Data import from existing localStorage exports.

Use Stripe or a Thai payment gateway for:

- Pro subscriptions.
- Billing portal.
- Webhook-driven account entitlement updates.

Important: localStorage-based Pro status is fine for demos, but it cannot protect paid features in production. Production entitlements must come from the backend.

### Phase 4: Package Native Apps

Use Capacitor:

- `web/` or `dist/` remains the shared app bundle.
- `ios/` and `android/` are generated wrappers.
- Native plugins can be added only where they matter: share sheet, file export, push notifications, app badge, secure storage.

For App Store compliance:

- Digital subscriptions inside the iOS app may need Apple In-App Purchase.
- If selling access on the website, keep checkout and account management available in the browser.
- Avoid hard-coding Stripe checkout as the only purchase route inside iOS until App Store rules are reviewed for the final business model.

## Product Tiers

### Free

- Limited invoices and active records.
- Watermarked PDFs.
- Local-only use or limited sync.

### Pro

- Unlimited invoices.
- No watermark.
- Cloud sync across browser, iOS, and Android.
- Priority support.

### Agency

- Multiple business profiles.
- Team access.
- White-label exports.

## Immediate Next Build Tasks

1. Add a package-managed web build.
2. Split inline JavaScript into modules.
3. Add Supabase schema and auth.
4. Replace demo Pro toggle with server-backed entitlements.
5. Add Capacitor and generate iOS/Android projects.
6. Add app icons, splash screens, privacy policy, terms, and store metadata.

