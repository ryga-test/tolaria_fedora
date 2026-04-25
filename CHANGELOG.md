# Changelog

## Unreleased

### Added

- Custom window controls (minimize, maximize/restore, close) in the sidebar title bar on Linux. Buttons use shadcn/ui ghost style with Phosphor icons; close button turns red on hover.
- KDE keyboard shortcuts: Alt+F9 (minimize), Alt+F10 (maximize/restore), Alt+F4 (close).
- Double-clicking the sidebar title bar toggles maximize/restore on Linux (KDE/KWin convention).
- `useWindowControls` hook wrapping the Tauri window API with reactive `isMaximized` state and platform-safe no-ops in browser mode.
- ADR 0078 documenting the custom window controls architecture.

### Fixed

- Prevented ordinary single-vault sessions from being routed back to the welcome screen. The fresh-start onboarding resume path now only applies when the welcome dismissal flag already existed at app startup.

### Changed

- Added a lightweight Playwright push-smoke lane using the `@push-smoke` tag and `playwright.push.config.ts`.
- Added `pnpm playwright:push-smoke`.
- Updated the pre-push hook to run fast unit tests with `pnpm test` instead of coverage.
- Updated the pre-push hook to run the smaller `@push-smoke` browser lane instead of the broader Playwright smoke suite.
- Kept full frontend coverage and broader Playwright smoke/regression suites available as explicit commands for CI or manual verification.
