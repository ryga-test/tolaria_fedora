# ADR 0078: Custom Window Controls for Linux

**Date**: 2026-04-25  
**Status**: Accepted  
**Supersedes**: —

## Context

The application sets `decorations: false` via `window.set_decorations(false)` in `src-tauri/src/lib.rs`. On macOS, `titleBarStyle: "Overlay"` in `tauri.conf.json` provides native traffic lights for minimize/maximize/close. On Fedora/KDE Linux, neither native decorations nor macOS-style traffic lights are available — the window has no controls at all.

Users cannot minimize, maximize/restore, or close the window via UI or the standard KDE keyboard shortcuts (Alt+F9/F10/F4), because those shortcuts are normally intercepted by the WM only when native decorations are present, and the WebKitGTK viewport does not forward them automatically.

## Decision

Implement three custom window control buttons (minimize, maximize/restore toggle, close) rendered inside the existing `SidebarTitleBar` component, Linux-only, using:

- **`useWindowControls` hook** (`src/hooks/useWindowControls.ts`): wraps `@tauri-apps/api/window` (`getCurrentWindow().minimize/maximize/unmaximize/close/isMaximized`), exposes a reactive `isMaximized` boolean updated on Tauri `onResized` events, and is safe to call in browser (non-Tauri) mode where all actions become no-ops.
- **`WindowControlButtons` component** (`src/components/WindowControlButtons.tsx`): renders the three shadcn/ui `Button` controls using Phosphor icons, guarded by `window.__TAURI_INTERNALS__?.platform === 'linux'` so it renders `null` on macOS and in browser dev mode.
- **Keyboard shortcuts**: Alt+F9 (minimize), Alt+F10 (maximize/restore), Alt+F4 (close) handled directly in `handleAppKeyboardEvent` as a special Alt+F* branch, since the existing `AppCommandShortcutCombo` system only covers `command-or-ctrl` / `command-or-ctrl-shift` / `command-shift` combos and does not process `altKey` events.
- **Command IDs**: `windowMinimize`, `windowMaximizeRestore`, `windowClose` added to `APP_COMMAND_IDS` and `APP_COMMAND_DEFINITIONS` (with no shortcut definition) for consistent command tracking.

## Platform Scope

Controls render on Linux only. macOS native traffic lights are not affected. Any future Windows support will need its own evaluation.

## Consequences

- Users on Fedora/KDE can minimize, maximize/restore, and close the window from both the UI and standard KDE keyboard shortcuts.
- macOS behavior is unchanged.
- A new `useWindowControls` hook is added to the hooks layer; it is independently testable via mocked Tauri API.
- The `SidebarTitleBar` `paddingLeft: 80` macOS reservation is made conditional (Linux uses `paddingLeft: 8`).
- `AppCommandHandlers` gains three optional handler keys; `handleAppKeyboardEvent` gains a direct Alt+F* branch.
