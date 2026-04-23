# ADR 0077: Fedora Linux Primary Platform Support

Status: Accepted
Date: 2026-04-23

## Context

Tolaria is shipping Fedora Linux support as a co-primary desktop platform alongside macOS. This changes the build, runtime, and packaging assumptions for the application:

- Fedora 43 is the target developer and build environment.
- Tauri must produce Linux RPM and AppImage bundles.
- WebKitGTK 4.1 is the Linux webview engine.
- KDE Plasma Wayland is the validated session path.
- Linux requires a workaround for the WebKitGTK DMABUF renderer issue.
- Linux should not inherit macOS-only window decoration assumptions.

## Decision

We will support Fedora Linux as a first-class platform with the following rules:

1. Use WebKitGTK 4.1 on Linux.
2. Treat Wayland as the primary validated Linux session type, while allowing GTK auto-detection to handle X11 fallback.
3. Build both RPM and AppImage artifacts for Linux releases.
4. Disable the WebKit DMABUF renderer on Linux launch paths using `WEBKIT_DISABLE_DMABUF_RENDERER=1`.
5. Remove GTK native decorations on Linux so the shared frontend title bar can occupy the full window width.
6. Guard Linux-only runtime changes with `#[cfg(all(desktop, target_os = "linux"))]`.

## Consequences

- Fedora Linux users get a supported build and package path without affecting macOS behaviour.
- The build configuration must include Linux bundle metadata for RPM dependencies and `.md` file associations.
- Linux runtime code must stay behind platform gates so macOS remains unchanged.
- The Fedora-specific workaround is centralized in code rather than requiring manual runtime setup.

## Notes

This ADR supersedes any implicit macOS-only assumptions from ADR 0001 for this feature area.
