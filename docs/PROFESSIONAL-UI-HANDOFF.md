# PriyoniX ERP — professional UI handoff

Updated 27 October 2026. This supersedes the visual direction and human-quality limitations in the earlier CINEMATIC-HANDOFF.md.

## Running application
[Open PriyoniX ERP on Richard](http://100.108.39.118:5197)

Server source: `/home/rich/sftp/Priyonix/priyonix-one`. This is the complete application supplied in PriyoniX-One-Completed.zip, with its existing React frontend, Spring Boot backend, MongoDB integration, routes, and business handlers. The separate older `assigement-2` checkout remains separate.

This address is a private Tailscale preview. Public HTTPS and restart-on-reboot service setup are not configured. The frontend serves the production bundle and proxies existing API requests to the backend on 127.0.0.1:18087.

## What changed in this revision
- Generated three original professional assets through the OpenAI API using gpt-image-2: a businesswoman holding a violet ERP orb, a suited businessman, and a glass ERP processor core.
- Optimized them to WebP, with smaller responsive human variants. Full-size woman: 71,578 bytes; man: 85,382 bytes; core: 102,170 bytes. Mobile woman: 19,132 bytes; mobile man: 38,164 bytes.
- Composed the dashboard around the woman, six real permission-aware module buttons, personalized copy, existing quick actions, and the existing six live KPIs. Moved revenue/project analytics above the secondary quick-action panel.
- Refined the shared white sidebar, header, navigation tabs, typography, cards, forms, tables, module headings, and spacing. All existing module groups remain accessible.
- Rebuilt the login composition with a white form panel and matching professional portrait. Existing authentication/recovery behavior is retained.
- Added the generated core to the integrated ecosystem page, with real links for every permitted module and the existing business workflow.
- Added a pause control for gentle card motion and honored reduced-motion preferences. Fixed mobile wrapping, desktop sidebar collapse, and a tablet card/control overlap.

## Honest artwork and motion scope
The new people and core are generated raster images with a realistic 3D-rendered appearance. The images themselves are not rigged, animated 3D humans. Floating cards and interface transitions animate independently in CSS/Motion. Native React controls, labels, live charts, KPIs, and links are not part of a flattened generated interface.

The earlier lazy-loaded AnimatedBusinessHuman/GLB component remains an image-error fallback, including its existing WebGL and reduced-motion handling. It provides the asset's genuine idle animation only. No pointing, walking, talking, or facial animation is claimed. Normal dashboard loading was checked and requested no GLB asset.

The existing local OpenAI key was reused only after the user's explicit approval. No key was added to source, the browser bundle, the server, or this package. Prompt details are in ARTWORK-PROMPTS.md. Original PNGs are delivered separately in generated-images/.

## Verification
- ESLint passed. All 30 frontend tests passed. Production build passed on Richard; the final tablet CSS adjustment was followed by another successful production build.
- All 40 workspace sections were opened with expected page headings, no broken rendered images, and no document horizontal overflow at desktop size. See professional-route-verification.json.
- All 44 read-only API/export checks returned HTTP 200. These include health, live dashboard, people, CRM, projects, finance, workspace modules, administration, invoice CSV and finance CSV. See api-verification.json.
- Existing administrator sign-in and session restoration worked against the server. Existing permissions and API sources were retained.
- Inspected desktop 1440 × 900, tablet 820 × 1180, compact desktop 1100 × 900, and phone 390 × 844. Tablet and compact-desktop hero cards were checked for rectangle overlap with the welcome/actions area after the spacing fix; none remained.
- Verified mobile navigation, ecosystem links, project form opening/cancel, and five required project fields. No project was submitted.
- Reduced-motion emulation stopped all six floating-card animations; the normal pause control also stopped them. Browser emulation was restored afterward.
- No application console errors were recorded in the final tab check. One session reconnect screen occurred during repeated full reloads over the private connection; its Try again action recovered successfully. This was not represented as an exhaustive network-reliability test.
- The earlier unchanged-backend verification reported 491 tests passed and 2 skipped. This visual revision did not rerun those backend tests.
- No business records were created, edited, or deleted for this visual revision. Empty-state metrics shown in screenshots are actual API data, not sample numbers.

## Coverage limits
This is not exhaustive live CRUD acceptance. Populated record details, all edit/delete workflows, separate employee-account browser sessions, email delivery, refresh-session expiry, and every business transition were not exercised during this revision. Existing frontend/backend tests retain their original scope.

The fallback Three.js chunk still produces a build-size warning (about 988 KB uncompressed); it is lazy and absent from normal image-based dashboard loading. The bundled original model is approximately 8.16 MB. Existing export formats remain unchanged; the checked endpoints return CSV.

## Reference comparison
- Violet/white palette: white navigation and working surfaces, pale lavender backgrounds, selective deep-violet hero.
- Human focal point: realistic corporate portrait, visible face/hands, suitable headroom, and matching violet lighting.
- Glass module cards: native clickable controls positioned around the figure; mobile and tablet spacing checked.
- Practical ERP layout: live metrics, analytics, forms, filters, tables, module groups, and business actions retained.
- Intentional differences: real empty data instead of reference sample metrics; all actual modules retained; no invented social sign-in options. Generated images provide visual realism, not a claim of live human animation.

## Package and operations
PriyoniX-ERP-Professional-Source.zip contains the application source, optimized artwork, original model/license files, server runner, and documentation. It excludes private .env files, credentials, node_modules, build outputs, logs, runtime files, and Git metadata.

From the server source directory, build with `cd frontend && VITE_API_BASE=/ npm run build`. The private frontend runner is `HOST=100.108.39.118 PORT=5197 node scripts/serve-server.mjs`. The backend launch wrapper remains private at `.runtime/start-backend.py`. Preserve the existing private environment and avoid starting duplicate listeners.

The earlier production frontend is retained at `.runtime/frontend-dist-before-artwork` for visual rollback. Source history retains the baseline and first redesign commits.

Screenshots: professional-dashboard-desktop.png, professional-login-desktop.png, professional-ecosystem-desktop.png, professional-dashboard-tablet.png, professional-dashboard-mobile.png, and professional-project-form-mobile.png.
