# Recipe Box

Paste a recipe from anywhere, let the app pull out the ingredients and steps, and swipe through your collection.

## Stack

| Layer          | Choice                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| UI             | React 19, TypeScript, Vite 8                                                                    |
| Styling        | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)            |
| Routing / data | TanStack Router (file-based, type-safe search params), TanStack Query                           |
| Backend        | Firebase: Auth (Google sign-in) and Firestore (recipes and photos); runs on the free Spark plan |
| Tests          | Vitest                                                                                          |

## Getting started

Requires **Node 24** (`nvm use`) and **Java 21+** (needed by the Firebase emulators).

```sh
pnpm install
pnpm dev
```

This starts two processes:

- **App** at http://localhost:5180
- **Firebase emulators** (Auth and Firestore), with the admin UI at http://127.0.0.1:4000

Local dev never touches a real Firebase project. It runs against a `demo-recipe-box` project that exists only in the emulators. Data is saved to `.emulator-data/` when you stop the dev server (Ctrl-C) and reloaded the next time you run `pnpm dev`.

Sign-in uses the Auth emulator, so **Continue with Google** opens a fake account picker. Use **Add new account** there to create a test user; no real Google account is involved.

When the box is empty, click **Load sample recipes** to add four starter recipes.

## Scripts

| Script                                         | What it does                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Emulators + Vite dev server                                                                   |
| `pnpm dev:web`                                 | Vite only (bring your own emulators or real Firebase)                                         |
| `pnpm build`                                   | Type-check and production build to `dist/`                                                    |
| `pnpm test`                                    | Vitest (watch mode)                                                                           |
| `pnpm test:rules`                              | Security rules tests against fresh emulators (stop `pnpm dev` first; they use the same ports) |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | ESLint / tsc / Prettier                                                                       |

## Project layout

```
src/
  routes/                  # File-based routes (TanStack Router)
    __root.tsx             #   App shell: header, account menu, 404, error boundary
    sign-in.tsx            #   Google sign-in
    _authed.tsx            #   Layout that sends signed-out visitors to /sign-in
    _authed/index.tsx      #   Recipe list: search, tag filter, mobile carousel / desktop grid
    _authed/recipes.$recipeId.tsx  # Recipe detail: cook mode checkboxes, edit, delete
  features/auth/auth.ts    # Sign-in/out, current user hook
  features/recipes/
    api.ts                 # Firestore reads/writes
    queries.ts             # TanStack Query options and mutations
    parser.ts              # Pasted text → structured recipe (heuristic)
    image.ts               # Shrinks photos to small data URLs stored on the recipe
    components/            # Recipe card, carousel, form, dialogs
  components/ui/           # shadcn/ui components (generated with `pnpm shadcn add`)
  lib/firebase.ts          # Firebase init; connects to emulators in dev
firestore.rules            # Security rules for recipes
tests/rules/               # Security rules tests (pnpm test:rules)
```

## Deploying

The site is hosted on **Vercel**. Firebase provides sign-in and the database. The Firebase project is `recipe-box-70481`, which is the `prod` alias in `.firebaserc`.

**Site (Vercel).** Import the GitHub repo into Vercel. `vercel.json` sets the build and sends every page to `index.html`, so the app handles its own routes. Under Project Settings → Environment Variables, add the four `VITE_FIREBASE_*` values from `.env.example`, filled in from Firebase console → Project settings → Your apps. Each push to `main` then deploys.

**Sign-in domains.** Firebase only allows sign-in from domains on its list. Under Authentication → Settings → Authorized domains, add the production `*.vercel.app` address and any custom domain. Preview deployments get random URLs, so sign-in won't work on them.

**Database rules (Firebase CLI).** Vercel doesn't deploy these, so run the following whenever `firestore.rules` or `firestore.indexes.json` changes:

```sh
pnpm firebase login   # once
pnpm deploy:rules
```

To test a production build locally against the real project, put the same values in `.env.production.local` (it's git-ignored), then run `pnpm build && pnpm preview`.

Each user's recipes are stored at `users/{uid}/recipes/{recipeId}`, and the rules only let the signed-in owner read or write them. Photos are shrunk to about 800px in the browser and saved on the recipe itself, so the app needs no Cloud Storage and runs on the free Spark plan.

## Ideas / next steps

- **Smarter parsing:** swap `parseRecipeText` for a Cloud Function that calls an LLM, or that imports a recipe from a URL
- **Offline support:** Firestore persistent cache, plus a PWA manifest for install-to-home-screen
