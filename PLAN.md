# Brokedian Project Analysis & Reference

## 1. Project Overview & Purpose

**Brokedian** is a single-file Progressive Web Application (PWA) designed as a personal income control dashboard for freelancers and small business owners in Thailand. The app helps users answer the core question: *"Am I going to be broke next month or not?"*

**Core Functionality:**
- Track invoices and client payments (paid/pending/overdue)
- Manage quotes and estimates with conversion tracking
- Simulate financial runway based on savings, expenses, and pipeline deals
- Generate professional A4 invoices with PromptPay QR codes
- Export data to CSV and import/export business profiles as JSON

---

## 2. File Structure & Relationships

```
E:\Git\brokedian\
├── index.html           # Main application (2286 lines) - ALL code inline
├── sw.js                # Service Worker for PWA offline support
├── manifest.json        # PWA manifest
├── PLAN.md              # This document
├── GEMINI.md            # AI agent guidelines
└── .opencode/           # Agent configuration
    ├── prompts/agents/   # Specialized agent prompts
    └── instructions/    # Instructions for agents
```

**File Relationships:**
- `index.html` references `manifest.json` via `<link rel="manifest">`
- `index.html` loads `sw.js` via service worker registration
- `sw.js` caches `index.html` and `manifest.json` for offline use
- All UI, logic, and styling in single `index.html`

---

## 3. Core Dependencies

### External CDN Resources:
| Resource | URL | Purpose |
|----------|-----|---------|
| Google Fonts - Syne | `fonts.googleapis.com/css2?family=Syne:wght@700;800` | Logo/headings font |
| Google Fonts - DM Sans | `fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800` | Body text font |
| Google Fonts - JetBrains Mono | `fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800` | Numeric values |
| CropperJS CSS | `cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css` | Logo cropping UI |
| CropperJS JS | `cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js` | Logo cropping logic |

### No Build System:
- Pure vanilla JavaScript (no framework)
- No npm/node dependencies
- No bundler required
- Runs directly in browser

---

## 4. App Architecture

**Type:** Single-file PWA (all HTML/CSS/JS in `index.html`)

**Architecture Pattern:** State-driven UI with direct DOM rendering

**Key Architectural Notes:**
1. **State Management**: All data in JavaScript arrays/objects, synced to localStorage
2. **Rendering**: `renderAppContent()` function acts as main dispatcher
3. **Navigation**: Manual screen switching via `switchScreen()` - toggles CSS classes
4. **No Router**: Single page, all content in one HTML file
5. **Offline-First**: Service worker caches core assets; falls back to cached `index.html`

**Data Flow:**
```
User Action → Event Handler → Update Data Model → saveState() → localStorage → renderAppContent() → DOM Update
```

---

## 5. Current Feature Set

### Screens (6 Total):

| Screen ID | Navigation Label | Purpose |
|-----------|------------------|---------|
| `dashboard` | Dashboard | Main overview with hero metric, runway status, metrics grid, analytics chart |
| `clients` | Invoices | Invoice CRUD with line-item tables |
| `quotes` | Quotes | Quote/estimate management with conversion to invoice |
| `forecast` | Forecast | Runway simulator with pipeline deal weights |
| `summary` | History | Summary view + CSV export + data tools |
| `profile` | Settings (icon) | Business profile, branding, logo upload |

### Data Models:

**Invoice (`clients` array)**
```javascript
{
  id: "c_1747060800000",
  name: "Agoda Bangkok HQ",
  project: "Localization Platform Architecture",
  status: "paid" | "pending" | "late",
  date: "2026-05-01",
  items: [{ desc: "Service description", qty: 1, cost: 120000 }, ...]
}
```

**Quote (`quotes` array)**
```javascript
{
  id: "q_1747060800000",
  name: "True Digital Group",
  project: "E-Commerce Pipeline Audit",
  status: "sent" | "accepted" | "expired",
  expiry: "2026-05-30",
  items: [{ desc: "...", qty: 1, cost: 45000 }, ...]
}
```

**Pipeline Deal (`pipelineDeals` array)**
```javascript
{
  id: "p_1747060800000",
  name: "Lazada Regional Marketing Hub",
  amount: 160000,
  prob: 75,  // probability percentage
  month: "current" | "next"
}
```

**Business Profile (`biz` object)**
```javascript
{
  name: "Brokedian Technology Consultancies",
  address: "88 T-One Building, ...",
  taxid: "0105565123456",
  email: "billing@brokedian.co.th",
  phone: "+66 81 555 9876",
  bank: "Siam Commercial Bank...",
  promptpay: "0105565123456",
  signature: "Authorized Signatory: ...",
  footer: "Payment terms text...",
  color: "#7C6EF5",  // brand color
  logo: "data:image/jpeg;base64,..."  // base64 encoded
}
```

**Forecast Config (`brokedian_cfg`)**
```javascript
{
  savings: "150000",     // liquid savings
  burn: "45000",         // monthly expenses
  tax: "7",              // VAT/tax rate %
  currency: "฿"           // currency symbol
}
```

### LocalStorage Keys:

| Key | Data Type | Purpose |
|-----|-----------|---------|
| `brokedian_clients` | JSON array | Invoice data |
| `brokedian_quotes` | JSON array | Quote/estimate data |
| `brokedian_pipeline` | JSON array | Forecast pipeline deals |
| `brokedian_biz` | JSON object | Business profile |
| `brokedian_cfg` | JSON object | Forecast settings |
| `brokedian_wiped` | flag | Factory reset trigger |

---

## 6. Known Constraints & Design Decisions

### Design Decisions:
1. **Thailand-First**: Default currency is THB (฿), PromptPay integration for local payments, Thai Tax ID field
2. **Mobile-First**: Bottom navigation on mobile, sidebar on desktop (breakpoint: 1024px)
3. **Color-Coded Status**: Green (paid), Yellow (pending), Red (overdue)
4. **No Backend**: All data persisted in browser localStorage only
5. **No User Authentication**: Single-user local app
6. **Logo Storage**: Base64 encoded in localStorage (limited size)

### Technical Constraints:
1. **LocalStorage Limits**: ~5-10MB depending on browser; images stored as base64
2. **No Real PDF Generation**: Uses browser print dialog with CSS @media print
3. **QR Code**: Uses external QRServer API (not offline-capable)
4. **Service Worker**: Only caches core files; external fonts not cached offline
5. **Date Handling**: Uses native JS Date, stored as ISO strings (YYYY-MM-DD)

### Runway Calculation Logic:
```
Hero Pipeline = Paid + Pending + Late + Quote Pipeline + Weighted Forecast

Runway Months = Savings / Monthly Burn Rate

Adjusted Pool = Savings + (Weighted Pipeline Inflow × Tax Multiplier)
Simulated Months = Adjusted Pool / Monthly Burn
```

---

## 7. Key Technical Notes

### Print System:
- `@media print` CSS handles A4 formatting
- Uses `window.print()` with print dialog
- Hides all UI except invoice preview modal
- CSS transforms scale invoice to fit screen
- Print styles include page-break-inside: avoid

### PWA Offline Support:
- Service Worker (`sw.js`) caches `index.html`, `manifest.json`, and root
- Cache-first strategy for core assets
- Network-first with offline fallback for external resources
- Push notification support (push event handler included)

### Data Persistence:
- All saves go through `saveState(key, data)` wrapper
- Try-catch around localStorage writes to handle quota errors
- Export/Import supports CSV for data and JSON for full backup

### Image Cropping:
- Uses CropperJS library for logo upload
- Crops to 512x512 JPEG at 92% quality
- Stores as data URL in localStorage

---

## 8. Default Sample Data

On first load (if no localStorage), app initializes with:

**Invoices:**
- Agoda Bangkok HQ - ฿120,000 - Paid
- SCB 10X Venture Studio - ฿85,000 - Pending

**Quotes:**
- True Digital Group - ฿45,000 - Sent

**Pipeline:**
- Lazada Regional - ฿160,000 - 75% probability
- Bangkok Bank Innovation Lab - ฿220,000 - 40% probability

**Business Profile:** Pre-filled with "Brokedian Technology Consultancies" sample data

---

*Document generated: May 2026*
*This is a living reference document - update as features evolve.*