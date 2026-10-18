# DAWB Creative Studio

An internal design and video studio for DAWB Learn: Canva-style editing for carousels and static posts, CapCut-style scene editing for reels and motion graphics, and a template library built from the **From Curiosity to Civilization** campaign calendar (May–August 2025).

- **150+ templates**:
  - **Research & questionnaires (11 flyers, 3 videos):** study announcements (editorial serif, cyan lens), questionnaire calls with a real, scannable **QR code** and form link (white, dark, story, ticket, square data drive, LinkedIn card), and research-team flyers (grid of six, single-member spotlight, swipe carousel) with name, profession and location.
  - **Data & charts (11 flyers, 3 videos):** column, bar, line, pie, donut, waterfall, histogram, scatter (with trend line) and **maps** (Nigeria's 36 states + FCT, and Africa by country) for applicant numbers by location, gender and track, and research results (a five-slide findings carousel with methodology). All figures are labelled sample data.
  - **Training (10 flyers, 9 videos):** Power BI, Excel, SQL, SPSS, Python, R, Tableau, Article Writing and Research Methods, each with an original animated illustration (no product logos), plus an all-tracks catalogue.
  - **Logo motion (3, with sound design):** *Assemble* (dark: scan line, emblem draws, facets click in, impact + light sweep), *Signal* (cyan: halftone pulse, glitch-slice lock-in, chime) and *Prism* (white: hexagon wall flips away, 3D rise, typeset letters, shimmer). All are animated from the exact geometry of the three official logo files.
  - **Beyond The Dashboard (BTD):** 10 flyers (bento, cyan monogram, night terminal, editorial issue, speaker story, tomorrow reminder, panel, live-now story, LinkedIn banner, thank-you recap) and 3 videos (promo reel, speaker announcement, 16:9 starting-soon screen).
  - **Occasions:** Christmas, New Year, New Month, Happy Birthday and Happy Weekend flyers (16 concepts across white, cyan, dark, emerald, black & gold, warm paper and pastel), each with a matching motion video.
  - **Campaign calendar:** the 32-post “From Curiosity to Civilization” set (carousels, statics, reels, motion graphics).
- **Sound:** a built-in, royalty-free library generated in code (`scripts/synth-audio.mjs`): 4 music beds (Pulse, Celebrate, Festive, Ambient) and 8 effects (whoosh, impact, click, pop, chime, shimmer, riser, glitch). Any scene can trigger an effect, and any video can use a bed or an uploaded track.
- **Texture system:** film grain, dot grids, halftone, topographic contours, dotted orbits/lines, glow, gradients and outlined type, in both the design editor and video scenes.
- **Brand type:** Nunito Sans and Nunito (self-hosted), plus a curated set of professional, open-licence fonts: Inter, Manrope, DM Sans, Plus Jakarta Sans, IBM Plex Sans, Space Grotesk, Fraunces, Source Serif 4, Playfair Display, Instrument Serif, Cormorant Garamond, JetBrains Mono and IBM Plex Mono. Font menus are grouped (sans / serif / mono) and the Brand page says what each is for.
- **QR codes and charts in the editor:** *Add → QR code* encodes any link as sharp vector squares; *Add → Chart / Pie / Map* and the chart panel cover all nine chart types, value suffixes (%, k), gridlines and waterfall totals.
- **Design editor**: drag, resize, rotate, snap guides, edit text inline or in panels, fonts and colours, photo upload/replace/crop/zoom, shapes, textures, charts, layer order, duplicate, lock, undo/redo, multiple slides, PNG/JPEG export (1× or 2×), and all slides as a ZIP.
- **Video studio**: a live Remotion preview, a scene timeline (reorder, duplicate, delete, add), per-scene content, duration, transitions, camera motion and textures, aspect presets (9:16, 4:5, 1:1, 16:9), theme colours and fonts, background music, and MP4/WebM export.
- **Projects**: save, autosave, reopen, duplicate, favourite, delete, conflict protection between teammates, and export history.
- **Brand assets**: the official logo files (unchanged), campaign colours and type, and team uploads (photos, logos, backgrounds, music).

---

## 1. Run it on a Windows PC (local workspace)

1. Install **Node.js 20 LTS or newer** from https://nodejs.org (default options).
2. Get the project folder (download the ZIP, or `git clone` it) and unzip it somewhere like `Documents\dawb-creative-studio`.
3. Double-click **`start-windows.bat`**.
   - The first run installs dependencies and builds the app (a few minutes, needs internet).
   - Your browser opens at **http://localhost:3000**. Keep the black window open while you work.
4. Use **Chrome or Edge** for the best video export (MP4 in the browser).

On macOS, double-click `start-mac.command` instead.

Manual equivalent:

```bash
npm install
npm run build
npm run start        # http://localhost:3000
# or, while developing:  npm run dev
```

**Where is my work saved?** In local mode everything (projects, uploads) is stored in the `data/` folder inside the project, on that computer only. The sidebar shows **“Local workspace.”** Back up `data/` to keep your work. Local projects are never mixed with the shared workspace.

**First server video render:** Remotion downloads a headless Chrome (~100 MB) the first time you use “On the render server.” This needs internet once.

---

## 2. Shared online workspace (Vercel)

The shared workspace stores projects and uploads in a **private Vercel Blob store**, and only signed-in Google accounts on your allowlist can open it.

### 2.1 Create the services (one-off)

1. **Vercel project**: import the repository at vercel.com → *Add New → Project*. The framework is detected as Next.js.
2. **Blob store**: in the Vercel project, open *Storage → Create → Blob*, choose **Private** access, and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Google OAuth client**: in Google Cloud Console, open *APIs & Services → Credentials → Create credentials → OAuth client ID → Web application*.
   - Authorised JavaScript origin: `https://<your-domain>`
   - Authorised redirect URI: `https://<your-domain>/api/auth/callback/google`
   - (For local testing, also add `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google`.)

### 2.2 Environment variables (Vercel → Settings → Environment Variables)

| Variable | Example | Notes |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | *(added by Vercel)* | Turns on the shared workspace |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google Cloud | Required in shared mode |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Session encryption and asset signing |
| `NEXTAUTH_URL` | `https://studio.dawblearn.org` | Your public URL |
| `ALLOWED_EMAIL_DOMAINS` | `dawblearn.org` | Comma-separated |
| `ALLOWED_EMAILS` | `volunteer@gmail.com` | Individual accounts outside the domain |
| `ADMIN_EMAILS` | `lead@dawblearn.org` | Can delete anyone's projects and assets |

If the Blob token is set but Google sign-in isn't fully configured, the app **refuses all access** rather than opening shared data. With no allowlist, nobody can sign in.

Redeploy after setting the variables. See `.env.example` for every option.

### 2.3 Video export on Vercel

Vercel functions are short-lived, so **server rendering is switched off on Vercel** and the export dialog says so. Teammates export videos **in the browser** (Chrome/Edge render and encode with WebCodecs, producing MP4). Long or heavy videos can be exported from a local install with “On the render server.”

To offer server rendering online, run the same app on any always-on Node host (a VM or a Docker host such as Render or Railway) with the same environment variables plus `SERVER_RENDER=true`. That host joins the same shared workspace.

### 2.4 Connecting a PC to the shared workspace

Put the shared variables (Blob token, Google credentials, allowlist) in `.env.local` on that PC. The sidebar then shows **“DAWB shared workspace”** and sign-in is required. Without them, the PC stays in its own local workspace.

---

## 3. How it works

```
src/
  app/                    Next.js App Router pages + API routes
    (studio)/             Home, Templates, My projects, Brand assets (with sidebar)
    design/[id]           Design editor  (/design/new?template=…)
    video/[id]            Video studio   (/video/new?template=…)
    api/                  projects, assets, favorites, render jobs, auth, workspace
  components/design/      Konva canvas, element nodes, panels, export
  components/video/       Video editor (Remotion Player, timeline, scene panels, export)
  lib/design/             Design document model, zod schema, renderer, undo history
  lib/video/              Video document model, scene definitions, schema, render client
  lib/templates/          Template registry: design/phase1-4.ts, frames.ts, video/reels.ts, motion.ts
  lib/server/             Config, storage drivers (fs | Vercel Blob), auth, repository, render jobs
  lib/charts.ts, lib/qr.ts, lib/geo/   Chart maths + validated palettes, QR encoding, map outlines
  remotion/               The one composition (DawbVideo) + 23 scene components + Remotion entry
```

- **One renderer per medium.** Designs are drawn by the same Konva components in the editor, the template thumbnails and the PNG/JPEG export, so exports match the screen. Videos are a single Remotion composition that the editor preview, browser export and server export all share.
- **Editable documents, not flat images.** A design is JSON: pages → elements (text, image, shape, texture, chart) with palette tokens (`$primary`, `$ink`…), so recolouring a template changes every slide. A video is JSON: scenes with typed props, backgrounds and transitions.
- **Generated controls.** The *Quick edit* panel lists every element a template labels. Video scene panels are generated from `lib/video/scenes.ts` field definitions.
- **Adding a font.** `npm i @fontsource/<font>`, add one entry to `FONTS` in `src/lib/fonts.ts`, then run `npm run fonts:sync`. That regenerates `src/app/fonts.css` (editor and PNG export) and `src/remotion/fonts.ts` (server video renders) so every surface loads the same files. Use open-licence (OFL) fonts only.
- **Maps.** `src/lib/geo/maps.ts` holds pre-projected outlines generated from Natural Earth (public domain) by `npm run maps:build`; the app ships no GIS libraries. Chart labels match states/countries by name, code or common alias (e.g. "Abuja" → FCT, "Ivory Coast").
- **Adding a template.** Write a `defineDesign({...})` or video template in `lib/templates/…`, add it to the phase array, and it appears in the library. The unit tests validate every template.
- **Security.** All API routes check access on the server: the allowlist is re-checked on every request, documents are validated with zod, uploads are identified by magic bytes (PNG, JPEG, WebP, MP3, WAV, M4A, OGG; no SVG or HTML), assets are served with `nosniff` and a sandbox CSP, writes reject cross-origin requests, and there is optimistic locking (HTTP 409) on concurrent saves. Only the creator or an admin can delete a project or asset.

---

## 4. Checks

```bash
npm run typecheck      # TypeScript
npm test               # 150 unit tests: every template validates; storage, permissions, conflicts, sniffing, allowlist, timeline
npm run build          # production build
npm run render:test    # server-render the sample composition → out/render-test.mp4
npx tsx scripts/render-template.ts logo-assemble v-btd-promo   # render any video template → out/<id>.mp4
npm run test:e2e       # against a running app: edit → save → reopen → PNG, ZIP, browser + server video export
```

---

## 5. Notes and limitations

- **Sample content.** Chart figures, names ("Member Name"), dates ("00 Month"), fees ("₦00,000") and "[your form link]" are placeholders. Each chart template carries a *Data note / source* field to replace with the real source. QR codes default to www.dawblearn.org until you paste the form link into the *Questionnaire link* field; test-scan every exported flyer.
- **Photos.** The calendar asks for photography and historical illustrations that weren't supplied, so photo slots are marked placeholders showing the calendar's suggested image (for example “Ishango Bone photo”). Upload real images in *Brand assets* or straight into a slot. Bracketed fields such as `[Graduate Name]` and `X%` come from the calendar and must be replaced with real details.
- **Logo files.** The three official SVGs (dark, light, cyan) are used exactly as supplied; each carries its own background square, so templates pick the file that matches the surface (or place it on a badge on other colours). Uploading a transparent logo version is recommended for photos and other colours.
- **Browser video export** needs Chrome or Edge (WebCodecs). Where H.264 encoding isn't available, it falls back to WebM (VP9). The server export always produces H.264 MP4.
- **Remotion licence.** Remotion is free for individuals and companies with up to 3 employees; larger organisations need a company licence from remotion.pro. Check this applies to DAWB before wide use.
- **Not yet built:** real-time co-editing (saves are protected by conflict detection instead), AI-assisted copy and imagery (the app works fully without AI), desktop installer packaging, Google Drive/Sheets integration.
