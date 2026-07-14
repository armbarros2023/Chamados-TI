#!/bin/sh
set -eu

RUST_TOOLCHAIN="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin"
export PATH="$RUST_TOOLCHAIN:$HOME/.cargo/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

exec npx tauri build --bundles app,dmg
