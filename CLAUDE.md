# Vold — Web (Dashboard + Marketing App)

You are in the **web** half of Vold. The mobile app is a **sibling repository** at `~/Documents/GitHub/vold-mobile/` — do **not** edit it from here.

## What this repo is

Vite + React 19 + Tailwind v4 web app with two build targets:

- **`app`** — public-facing marketing/auth surface (`npm run dev:app`, port 5173)
- **`dashboard`** — authenticated event organiser dashboard (`npm run dev:dashboard`, port 5174)

Both targets share `src/shared/` (libs, components, supabase client). Build target is selected via `VITE_BUILD_TARGET` env var — see `package.json` scripts.

## Stack

- React 19, React Router DOM 7
- Vite 7, TypeScript 5.9
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- `@supabase/supabase-js` (its own Supabase project — **not** the mobile project)
- `lucide-react` icons, `clsx` + `tailwind-merge` for class composition

## Conventions worth knowing

- Events list in the dashboard reads **live from Supabase** — never seed it from local state.
- Publish-event flow must `await` the real UUID returned by Supabase before navigating; non-UUID nav targets are a no-op.
- Never silently swallow fetch errors — surface them.
- When pasting SQL changes, paste the full SQL inline in chat (don't say "see file X").

## How this differs from the mobile repo

| | This repo (web) | Sibling (mobile) |
|---|---|---|
| Path | `~/Documents/GitHub/vold` | `~/Documents/GitHub/vold-mobile` |
| Renderer | React DOM | React Native |
| Tooling | Vite + Tailwind v4 | Expo (Metro) + NativeWind |
| Supabase project | `<web project>` | `qcixbcjdwanshfgcaaso` (separate) |
| Routing | React Router DOM | expo-router (file-based) |

If a request mentions wallet flows, mobile screens, NativeWind, Expo, or anything in `app/`/`components/` with React Native primitives — you are in the **wrong repo**. Stop and switch to `~/Documents/GitHub/vold-mobile`.
