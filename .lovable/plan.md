# Polish Pass: Boundaries, Skeletons, Apple-style Motion

## 1. Route-level error boundaries
- Reuse existing `src/components/ErrorBoundary.tsx`.
- Create a lightweight `RouteBoundary` wrapper (friendly card + "Try again" / "Go home") and wrap `<Dashboard />` and `<NewBusinessWizard />` routes in `src/App.tsx`. Future routes can opt in the same way.

## 2. Animated route transitions (no flash)
- Add `framer-motion` `AnimatePresence` + `motion.div` wrapper around the `<Routes>` block keyed by `location.pathname`.
- Fade + 8px Y slide, 220ms ease-out enter / 160ms ease-in exit.
- Keep React Suspense fallback as a translucent overlay (not a hard unmount) so previous view stays visible while data loads.

## 3. WorkspaceContext guards + types
- Extract the fallback business object into an exported `EMPTY_WORKSPACE` constant typed as `Workspace`.
- Add a runtime `assertWorkspace(ws)` helper that logs (via existing `logClientWarn`) when required fields (`color`, `palette`, `logo`, `name`) are missing or wrong types, returning a normalized `Workspace`.
- Wire `useWorkspace()` through the helper so consumers always receive a complete shape.
- Add `src/context/__tests__/WorkspaceContext.test.tsx` (Vitest) covering: zero workspaces returns `EMPTY_WORKSPACE`; partial row gets defaults filled; valid row passes through unchanged.

## 4. /clients skeletons
- Add `ClientsListSkeleton`, `ClientDetailSkeleton`, and `ChartSkeleton` (shimmer cards + bar/line placeholders) in `src/components/skeletons/`.
- Render them in `Clients.tsx` and the client detail/workspace pages while `loading` is true, replacing any abrupt empty states.

## 5. Apple-style login + splash
- New `src/components/SplashScreen.tsx`: full-screen gradient, logo mark scaling from 0.8 -> 1 with blur-in (filter blur 12px -> 0), brand wordmark letters staggered (0.04s) sliding up, subtle shimmer sweep. Auto-dismisses after auth state resolves (min 900ms so it doesn't flash).
- Mount in `src/main.tsx` before `<App />` until `AuthContext` reports ready.
- Refresh `src/pages/Auth.tsx`: card glass-morphism (backdrop-blur, border-white/10), spring-in (motion `type: "spring", stiffness: 220, damping: 22`), input focus glow, primary button with magnetic hover (scale 1.02 + shadow-glow), success checkmark draw-on submit.

## 6. Verification
- Manual click-through: empty dashboard CTA -> `/clients/new` on desktop (1635px) and mobile (390px) via preview viewport, confirm wizard step 1 renders.
- Trigger an intentional throw in dev to confirm `RouteBoundary` catches and offers reload.
- `bunx vitest run src/context/__tests__/WorkspaceContext.test.tsx`.

## Technical details
- Files created: `src/components/RouteBoundary.tsx`, `src/components/SplashScreen.tsx`, `src/components/skeletons/{ClientsListSkeleton,ClientDetailSkeleton,ChartSkeleton}.tsx`, `src/context/__tests__/WorkspaceContext.test.tsx`.
- Files edited: `src/App.tsx` (AnimatePresence + boundaries), `src/main.tsx` (splash mount), `src/context/WorkspaceContext.tsx` (assert + EMPTY_WORKSPACE), `src/pages/Auth.tsx` (motion polish), `src/pages/Clients.tsx` and client detail page (skeletons).
- Deps: `framer-motion` (add if missing), `vitest` + `@testing-library/react` (add if missing, dev only).
- Motion budget: keep enter animations <=300ms, respect `prefers-reduced-motion` via a small `useReducedMotion` guard so animations collapse to instant fades.

Approve and I'll implement straight through.
