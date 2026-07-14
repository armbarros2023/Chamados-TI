#!/bin/sh
set -eu

RUST_TOOLCHAIN="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin"
export PATH="$HOME/.cargo/bin:$RUST_TOOLCHAIN:/opt/homebrew/opt/llvm/bin:/opt/homebrew/bin:$PATH"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-/tmp/chamados-ti-windows-target}"
export XWIN_CACHE_DIR="${XWIN_CACHE_DIR:-/tmp/chamados-ti-xwin-cache}"

"$PWD/node_modules/.bin/vite" build --configLoader runner --mode desktop

exec npx tauri build \
  --runner cargo-xwin \
  --target x86_64-pc-windows-msvc \
  --bundles nsis \
  --config src-tauri/tauri.windows.conf.json
