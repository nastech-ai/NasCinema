---
name: NyumatFlix migration patterns
description: Key patterns and decisions made migrating NyumatFlix from Next.js to Vite+React+wouter in Replit pnpm workspace
---

## Rules applied

1. **No Next.js imports** — `next/image`, `next/script`, `next/navigation`, `next/link`, `next/router` all removed. Replace: `<Image>` → `<img>`, `<Script>` → remove or inline `<script>`, `<Link>` → `<a>` or `navigate(path)`.

2. **Routing** — `useRouter()` replaced with `const [, navigate] = useLocation()` from wouter. `useSearchParams()` → `useSearch()` + `new URLSearchParams(searchStr)`. Both `useLocation` AND `useSearch` must be in the same import line if both are used.

3. **navigate() must always receive a path** — bare `navigate()` calls cause silent navigation failures. Always pass `navigate(link)`.

4. **lazy() named exports** — Vite doesn't handle `{ default: module.NamedExport }` — must be wrapped explicitly: `lazy(() => import('./Foo').then(m => ({ default: m.Foo })))`.

5. **API routing** — shared proxy routes `/api/*` to the api-server at port 8080. `getApiBase()` returns `""` (empty string). No Vite proxy needed.

6. **Person page required a backend endpoint** — `/api/person/:id` was missing; added to tmdb router using TMDB `/person/:id?append_to_response=combined_credits,images`.

**Why:** Next.js App Router uses server components, file-based routing, and its own optimized primitives. Vite+wouter has none of these built-in — every Next.js API import must be manually replaced.
