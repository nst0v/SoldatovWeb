# SAYTMSK — rules for future changes

Read README.md and docs/ before editing. This repository replaces the legacy Soldatov.dev website.

## Commands
- Node 22+, zero npm dependencies. `npm run build`, `npm run dev`, `npm run check`.
- `python tests/backend.py`, `python tests/browser.py` (offline), `BROWSER_HTTP=1 python tests/browser.py` (HTTP).
- `python scripts/package.py` produces the deployable archive.

## Source of truth
Edit src/content.mjs for text and services, src/render.mjs for components, public/styles.css and public/app.js for UI. Never hand-edit generated dist/.

## Brand
SAYT■MSK, orange separator. Background #F8F5EF, dark ink #0F172A, orange #FF8A00, blue accents. Approved cube atlas: no faces, hands, feet or mascots. Do not replace with random clipart. No font files in deliverables.

## Copy and trust
Russian, concrete actions. No AI-marketing filler, made-up team, years, prices, testimonials, ROI, 24/7, paid-client claims or unconditional guarantees. Keep demo/concept labels. Contacts come from existing owner-provided repository data; do not invent new addresses.

## Behaviour
One contact flow. Email mode must explicitly prepare a draft, never claim delivery. Server mode requires configured endpoint plus a real privacy page and server environment. Never commit credentials or send live test messages. Keep no-JS content/navigation, keyboard/Escape/focus, reduced motion and real links.

## Validation
Run checks after changes. Test 320/360/390/430/768/820/821/1024/1280/1440/1920 px and service pages, static asset paths, anchors, keyboard and form states. Report actual tests and limitations. Do not claim universal absence of defects.
