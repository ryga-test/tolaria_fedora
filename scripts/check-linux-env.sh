#!/usr/bin/env bash

set -u

issues=0

check_pkg() {
  local pkg="$1"
  if rpm -q "$pkg" >/dev/null 2>&1; then
    printf '[OK] %s\n' "$pkg"
  else
    printf '[FAIL] %s — install with: sudo dnf install %s\n' "$pkg" "$pkg"
    issues=$((issues + 1))
  fi
}

version_ge() {
  local current="$1"
  local required="$2"
  local -a current_parts required_parts
  local i current_part required_part

  IFS=. read -r -a current_parts <<<"$current"
  IFS=. read -r -a required_parts <<<"$required"

  for i in 0 1 2; do
    current_part="${current_parts[i]:-0}"
    required_part="${required_parts[i]:-0}"

    if ((10#$current_part > 10#$required_part)); then
      return 0
    fi
    if ((10#$current_part < 10#$required_part)); then
      return 1
    fi
  done

  return 0
}

parse_rust_version() {
  local output="$1"
  printf '%s\n' "$output" | awk '{print $2}'
}

packages=(
  webkit2gtk4.1-devel
  gtk3-devel
  openssl-devel
  libsoup3-devel
  glib2-devel
  at-spi2-atk-devel
  gdk-pixbuf2-devel
  pango-devel
  harfbuzz-devel
  cairo-devel
  curl
  wget
  file
  librsvg2-devel
  libxkbcommon-devel
  rpm-build
  patchelf
  squashfs-tools
  wmctrl
  gcc
  make
)

for pkg in "${packages[@]}"; do
  check_pkg "$pkg"
done

if command -v rustc >/dev/null 2>&1; then
  rustc_version_output="$(rustc --version)"
  rustc_version="$(parse_rust_version "$rustc_version_output")"

  if version_ge "$rustc_version" "1.77.2"; then
    printf '[OK] rust %s\n' "$rustc_version"
  else
    printf '[FAIL] rust version %s is below minimum 1.77.2 — upgrade with: rustup update stable\n' "$rustc_version"
    issues=$((issues + 1))
  fi
else
  printf '[FAIL] rust — install via: curl https://sh.rustup.rs -sSf | sh\n'
  issues=$((issues + 1))
fi

if command -v node >/dev/null 2>&1; then
  printf '[OK] node %s\n' "$(node --version)"
else
  printf '[FAIL] node — install with fnm or nvm, then ensure node is on PATH\n'
  issues=$((issues + 1))
fi

if command -v pnpm >/dev/null 2>&1; then
  printf '[OK] pnpm %s\n' "$(pnpm --version)"
else
  printf '[FAIL] pnpm — enable corepack and activate pnpm\n'
  issues=$((issues + 1))
fi

printf '[INFO] session: %s\n' "${XDG_SESSION_TYPE:-}"

if ((issues == 0)); then
  printf '✅ Environment ready for Tolaria development\n'
else
  printf '❌ %d issue(s) found — resolve the [FAIL] lines above before building\n' "$issues"
fi

exit "$issues"
