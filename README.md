v4.2: Upload all extracted files and folders to the existing repository. Existing local data keys are unchanged. Close and reopen the app after deployment to activate the new service worker.

# KILLA FITNESS v4.0 Performance Edition — integration preview
Extract the ZIP and upload its contents (including folders) to the existing GitHub Pages main branch. Do not delete browser storage. Export your v3.2 backup before upgrading. New interface imports v3.2 program, history, measurements and unfinished sets on first use on the same origin. Original localStorage data is retained; the old interface is available in More and uses its separate original records. Progress photos use the original IndexedDB database. Do not use both versions for logging interchangeably.

Cloud: optional manual authenticated snapshots, not automatic bidirectional sync. In Firebase create a project, enable Email/Password authentication, create your own user in Authentication, and create Firestore. Set the following rules (never use public test rules):
```
rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
  match /users/{uid}/snapshots/{doc} {
   allow read, write: if request.auth != null && request.auth.uid == uid;
  }
 }
}
```
Enter the project ID and Web API key in Settings. Upload/restore snapshots manually; photos are not sent to cloud. Local export includes photos. No credentials are shipped. Firestore has document size limits. Cloud operations require actual project testing.

Alarm works while browser permits audio execution; not guaranteed when locked/suspended. Open app and tap a control to unlock audio. No native notification guarantee. Exercise illustrations limited to existing 12 assets. Muscle map is schematic; no physiological recovery prediction. Calendar selects appropriate program manually and shows current month. The old app retains advanced legacy generator features not yet ported. Device testing and cloud validation required before production use. To roll back, redeploy original v3.2 ZIP; v4 records are separate, export them before rollback.


## v4.5 — Installation
See INSTALL-ON-PHONE.txt. Install help appears in the header in normal browser mode. No data migration or reset.


## V6.8 anatomy rebuild
- Anatomically traced green tissue shapes, shaded from the original 3D artwork, replacing block-like colour masks.
- Seven independently coloured muscle regions; workout history storage unchanged.
- This is static rendered artwork with independently coloured layers, not a rotatable 3D model.
