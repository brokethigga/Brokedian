# Brokedian UX Ease-of-Use Plan

## Goal

Make Brokedian understandable within the first 30 seconds.

Users should quickly understand:

- What the app does.
- What to do first.
- What each screen is for.
- Which action to take next.

The app should feel like a practical income control tool for freelancers and small business owners, not a dashboard that requires prior knowledge of its data model.

## Current Friction

- The dashboard shows financial numbers immediately, but it does not clearly say how to start.
- Demo/sample data can make the app feel already filled instead of user-owned.
- Labels like "Total Monthly Backlog Pipeline" and "Income Forecast Simulator" are too technical.
- Empty states exist, but they are not strong enough as workflow guidance.
- Account, Pro, cloud sync, ad credits, and business settings compete for attention.
- Some actions require users to understand the app model before the UI explains it.
- The app mixes several mental models: invoices, clients, quotes, forecast deals, runway, Pro, ads, and cloud sync.
- First-time users may not know whether they should create an invoice, set business details, sign in, or configure forecast settings first.

## Recommended UX Improvements

### 1. Add a Dashboard "Start Here" Panel

Add a compact onboarding panel near the top of the dashboard for new/local users.

Suggested steps:

1. Set up your business.
2. Create your first invoice.
3. Add a quote for work you might win.
4. Add future income to forecast runway.

Each step should have one clear button that opens the relevant screen or modal.

The panel should include:

- A short title: "Start here"
- One-sentence explanation: "Add your business and income so Brokedian can show whether next month is covered."
- A "Hide guide" action saved to `localStorage`.
- A "Show guide" action in the account hub.

### 2. Make Empty States Actionable

Each empty screen should tell users what belongs there and provide the next action.

Recommended empty states:

- Dashboard recent activity: "Invoices you create will appear here."
- Invoices: "Create your first invoice to track money owed or paid."
- Quotes: "Create a quote for work you have not won yet."
- Forecast: "Add expected future income to see how long your cash lasts."

Each empty state should include a direct button where useful:

- "Create invoice"
- "Create quote"
- "Add future income"
- "Set business info"

### 3. Simplify Product Language

Replace technical labels with language users can understand quickly.

Suggested copy changes:

| Current | Suggested |
| --- | --- |
| Total Monthly Backlog Pipeline | Money you can track this month |
| Income Analytics Breakdown | Income breakdown |
| Income Forecast Simulator | Future income |
| Simulated Client Funnel Adjustments | Expected future work |
| Business Configuration Settings | Business settings |
| Create estimate offer | Create quote |
| Add Target Deal Forecast | Add future income |
| Projected Runway Evaluation | Estimated runway |

Keep Thai dictionary entries aligned with the same simpler intent.

### 4. Improve Form Guidance

Add short helper text inside key forms so users know what will happen after saving.

Recommended helpers:

- Invoice modal: "Use invoices for work you already billed or need to bill."
- Quote modal: "Use quotes for work you are proposing before it becomes an invoice."
- Forecast modal: "Use future income for likely deals that are not invoices yet."
- Business settings: "These details appear on your invoice PDFs."

Improve placeholders:

- Client name
- Client address
- What did you do?
- Quantity
- Price
- Expected deal value
- Chance of closing

Make save buttons outcome-oriented:

- Save invoice
- Save quote
- Save forecast
- Save business settings

### 5. Clarify Demo Data

Default sample data should not feel like the user's real business.

Recommended options:

- Label sample data clearly as demo data.
- Add a "Start with blank app" action.
- Add a "Reset demo data" action in the account hub or onboarding panel.
- Use neutral sample names if real company names make the dashboard feel too specific.

The simplest v1 improvement is to show a dashboard note when default sample data is present:

> This is sample data. Create your first invoice or start fresh.

### 6. Reduce Early Monetization Noise

Pro, ads, credits, and cloud sync should not distract before the user understands the core workflow.

Recommended adjustments:

- Keep Pro visible but secondary on first run.
- Surface ads only when a free limit is reached.
- Explain cloud sync as backup first, account feature second.
- Avoid making new users feel blocked before they create their first useful record.

### 7. Add Better Save Confirmations

Current save messages are brief, but they can guide the next action.

Examples:

- "Invoice saved. Preview PDF?"
- "Quote saved. Convert it to an invoice when accepted."
- "Future income saved. Dashboard runway updated."
- "Business settings saved. These details will appear on PDFs."

This helps users learn the app through feedback rather than documentation.

## Priority Order

1. First-run dashboard guide.
2. Better empty states with direct actions.
3. Simpler labels and copy.
4. Form helper text and clearer placeholders.
5. Sample-data labeling or "start fresh" flow.
6. Optional guided checklist progress.
7. Better post-save confirmations.
8. Manual smoke test checklist until a real automated test suite exists.

## Next Build Task

Implement the onboarding and clarity pass in `index.html` and `styles.css`.

The next build should:

- Preserve the staged security and PWA fixes.
- Add the dashboard start guide.
- Improve empty states and labels.
- Add form helper text.
- Add sample-data handling.
- Keep the first screen as the actual dashboard, not a landing page.
- Avoid long tutorial pages or modal-heavy onboarding.

After implementation:

- Run syntax checks.
- Run browser smoke tests.
- Check mobile and desktop layouts.
- Stage the UX changes with the already staged files.

## Acceptance Criteria

- A new user can identify the first action without guessing.
- Dashboard explains what the app is tracking.
- Each main screen has a clear empty/default state.
- Buttons describe outcomes, not internal concepts.
- Sample/demo data is clearly identified or easy to reset.
- Pro, ads, and cloud sync do not compete with the first core workflow.
- No new modal clutter or long tutorial pages are introduced.
- App still works on mobile and desktop.
- Existing staged security/PWA fixes remain intact.

## Suggested Manual Smoke Test Checklist

Until the app has a real test suite, use this checklist after UX changes:

- Load the app as a new guest user.
- Confirm the "Start here" guide appears.
- Click "Set up business" and confirm the business settings screen opens.
- Click "Create invoice" and confirm the invoice modal opens.
- Save a basic invoice and confirm it appears on dashboard and invoice list.
- Preview or print the invoice PDF.
- Create a quote and confirm it appears on the quotes screen.
- Convert a quote to an invoice.
- Add future income and confirm runway/forecast updates.
- Hide the guide, reload, and confirm it stays hidden.
- Show the guide again from the account hub.
- Check desktop and mobile layouts for text overlap.
- Confirm the browser console has no errors.

## Implementation Notes

Potential helper functions:

- `isGuideHidden()`
- `hideOnboardingGuide()`
- `showOnboardingGuide()`
- `openSetupStep(step)`
- `isUsingSampleData()`
- `startFreshFromDemoData()`

Reuse existing app functions where possible:

- `switchScreen`
- `openClientModal`
- `openQuoteModal`
- `openPipelineModal`
- `openAuthPrompt`
- `showToast`
- `renderAppContent`

Keep edits scoped. This should be a clarity pass, not a structural rewrite of the app.

## Assumptions

- Target user is a freelancer or small business owner who wants to create invoices, track unpaid money, and estimate runway.
- The goal is clarity and confidence, not a full tutorial system.
- The next implementation pass will use this file as the source of truth.
- A new top-level Markdown file is acceptable because this is a product/UX plan, similar to the existing planning documents.
