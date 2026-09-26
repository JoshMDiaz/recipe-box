# Recipe Box

Paste a recipe from anywhere, let the app pull out the ingredients and steps, and swipe through your collection.

## Stack

| Layer          | Choice                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| UI             | React 19, TypeScript, Vite 8                                                         |
| Styling        | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) |
| Routing / data | TanStack Router (file-based, type-safe search params), TanStack Query                |
| Backend        | Firebase: Auth (Google sign-in), Firestore (recipes) and Cloud Storage (photos)      |
| Tests          | Vitest                                                                               |

## Getting started

Requires **Node 24** (`nvm use`) and **Java 21+** (needed by the Firebase emulators).

```sh
pnpm install
pnpm dev
```

This starts two processes:

- **App** at http://localhost:5180
- **Firebase emulators** (Auth, Firestore and Storage), with the admin UI at http://127.0.0.1:4000

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
    api.ts                 # Firestore + Storage reads/writes
    queries.ts             # TanStack Query options and mutations
    parser.ts              # Pasted text → structured recipe (heuristic)
    image.ts               # Client-side photo downscaling before upload
    components/            # Recipe card, carousel, form, dialogs
  components/ui/           # shadcn/ui components (generated with `pnpm shadcn add`)
  lib/firebase.ts          # Firebase init; connects to emulators in dev
firestore.rules            # Security rules for recipes
storage.rules              # Security rules for recipe photos
tests/rules/               # Security rules tests (pnpm test:rules)
```

## Connecting a real Firebase project

1. Create a project at https://console.firebase.google.com. Enable **Firestore** and **Storage**, and under **Authentication**, turn on the **Google** sign-in provider. If you serve the app from a domain other than the default `*.web.app` / `*.firebaseapp.com`, add it under Authentication → Settings → Authorized domains.
2. Add a Web app, then copy its config into `.env.production.local` (use `.env.example` as the template).
3. Point the CLI at the project: `pnpm firebase use --add`.
4. Deploy: `pnpm build && pnpm firebase deploy`. This deploys Hosting, the Firestore rules and indexes, and the Storage rules.

Each user's recipes are stored at `users/{uid}/recipes/{recipeId}` and their photos under `users/{uid}/recipes/{recipeId}/` in Storage. The rules only let the signed-in owner read or write them.

## Ideas / next steps

- **Smarter parsing:** swap `parseRecipeText` for a Cloud Function that calls an LLM, or that imports a recipe from a URL
- **Offline support:** Firestore persistent cache, plus a PWA manifest for install-to-home-screen
