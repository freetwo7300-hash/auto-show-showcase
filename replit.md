# معرض السيارات — Arabic RTL Car Marketplace

A full-stack Arabic-first RTL car showroom management system with multilingual support, advanced filtering, car comparison, and inquiry management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/car-market run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter (routing) + TailwindCSS
- Auth: Clerk (via `@clerk/react`)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Table: `@tanstack/react-table` (TanStack Table v8)
- Gallery: `embla-carousel-react` (v8)
- i18n: Custom React context (AR/EN), persisted to localStorage
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/car-market/src/` — React frontend
  - `pages/` — route pages (Index, CarsPage, CarDetailPage, ComparePage, ...)
  - `components/cars/` — CarCard, CarGallery, CarFilters, StatCard
  - `components/` — FavoritesDrawer, CompareBar, InquiryDialog, layout/AppLayout
  - `hooks/` — useAuth, useCars, useCompare, useTheme
  - `i18n/` — I18nProvider, translations (AR + EN)
  - `data/cars.ts` — static fallback car data + type definitions
- `artifacts/api-server/src/routes/` — Express routes (cars, favorites, profiles, inquiries)
- `lib/db/src/schema/` — Drizzle schema (cars, favorites, inquiries, profiles, users)
- `lib/db/drizzle.config.ts` — DB config pointing to schema/index.ts

## Architecture decisions

- **RTL-first**: App defaults to Arabic/RTL; `document.dir` toggled by I18nProvider
- **Favorites as drawer**: Heart icon in header opens a Sheet drawer — no `/favorites` route
- **Compare as floating bar**: CompareBar appears when ≥1 car selected, links to `/compare`
- **Admin roles**: checked via `user.publicMetadata.role === 'admin'` from Clerk
- **Static fallback data**: `carsData` in `data/cars.ts` used when DB returns no rows (dev convenience)
- **No react-i18next**: Using a lightweight custom context to avoid complex i18next config overhead

## Product

- Browse cars with grid/list/table views, filters, search
- Car detail page with Embla gallery (thumbnails + zoom), spec grid, inquiry dialog
- Compare up to 3 cars side-by-side (floating bar + full compare page)
- Favorites drawer (header heart icon + count badge)
- Contact/inquiry per car → stored in `inquiries` DB table
- Admin role: can edit/delete any car; ordinary users manage only their own listings
- Language toggle (AR ↔ EN) in header, persisted to localStorage

## User preferences

- Wouter is the router — use `href=` not `to=`, `useLocation()` returns `[location, navigate]`
- `DbCar` type is from `useCars.ts`; condition/status are strings needing cast to union types
- Sidebar is on the right (RTL); class `right-0` in fixed positioning
- All API calls use plain `/api/…` path — no BASE_URL prefix needed in fetch calls

## Gotchas

- `pnpm --filter @workspace/db run push` must be run after any schema changes
- `embla-carousel-react` mainApi must have listeners cleaned up via `.off()` to avoid leaks
- The `condition` and `status` fields from DB are plain `string` — always cast to union type
- Admin check: `(user?.publicMetadata as Record<string, unknown>)?.role === "admin"`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
