#!/bin/sh
set -eu

RUST_TOOLCHAIN="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin"
export PATH="$RUST_TOOLCHAIN:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

exec "$RUST_TOOLCHAIN/cargo" install --locked cargo-xwin --root "$HOME/.cargo"
