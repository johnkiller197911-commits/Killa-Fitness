KILLA FITNESS V6.1 — LIVE TIMER & DISPLAY REPAIR
Full ROOT replacement: upload the CONTENTS of this package into GitHub repo main ROOT, retaining folders.
IMPORTANT: Export complete backup in current app first. Do NOT clear app storage or uninstall.
This uses the existing killa-fitness-v4 localStorage key for workout records and does not wipe them.
Do not upload the package into a subfolder: V6.1 is intended for the live root.
Includes:
- Rest ring countdown 0:30 / 1:00 / 1:30 / 2:00 instead of oversized REST COMPLETE.
- Separate rest state label; no overlapping text.
- Audible three-note repeated rest alert until Skip / Dismiss.
- Automatic rest after set, pause/resume, +15 sec, adjustable 30/60/90/120.
- Prevents duplicate floating rest toast while viewing Battle Mode.
- Fixes redundant confirmation when navigating to next exercise.
- One consistent V6.1 index, JS, CSS, service worker and manifest.
- Existing exercise illustrations, generator, and training interface retained.
Caveats:
- Background/locked screen alarms are NOT guaranteed by browsers or iOS.
- Audio must be unlocked by a user interaction; phone may mute sounds in silent mode.
- Existing live app may still show cached content until service worker updates.
- Verify full workout, timer, persistence and images on real phone before production use.
