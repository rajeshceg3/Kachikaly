# Verify Kachikaly
Kachikaly - crocodile pool reflection experience (vite app in app/ subdir).
## Launch
`cd app && npm install`, then `npm run dev`.
## Doctor
`python3 .cursor/skills/verify-kachikaly/verify.py`
## Drive
Runs the vitest suites (22 tests) then the playwright journey specs on the chromium project (exploration reveals text on interaction, idle state hides cursor) against the dev server the config manages.
## Evidence
`.cursor/skills/verify-kachikaly/evidence.json`
## Cleanup
Playwright manages its dev server.
## Known boundaries
firefox/webkit projects are configured but their browsers are not installed here; chromium only.
