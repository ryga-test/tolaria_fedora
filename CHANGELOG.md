# Changelog

## Unreleased

### Fixed

- Prevented ordinary single-vault sessions from being routed back to the welcome screen. The fresh-start onboarding resume path now only applies when the welcome dismissal flag already existed at app startup.

### Changed

- Added a lightweight Playwright push-smoke lane using the `@push-smoke` tag and `playwright.push.config.ts`.
- Added `pnpm playwright:push-smoke`.
- Updated the pre-push hook to run fast unit tests with `pnpm test` instead of coverage.
- Updated the pre-push hook to run the smaller `@push-smoke` browser lane instead of the broader Playwright smoke suite.
- Kept full frontend coverage and broader Playwright smoke/regression suites available as explicit commands for CI or manual verification.
