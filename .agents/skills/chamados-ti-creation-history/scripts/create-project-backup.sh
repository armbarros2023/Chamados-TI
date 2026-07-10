#!/bin/sh
set -eu

PROJECT_DIR="${1:-/Users/arbtechinfo/Projetos CC/Chamados-TI}"
OUTPUT_DIR="${2:-$PROJECT_DIR/backups/project}"
STAMP="$(date +%Y%m%d-%H%M%S)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
PROJECT_PARENT="$(dirname "$PROJECT_DIR")"
ARCHIVE="$OUTPUT_DIR/$PROJECT_NAME-backup-$STAMP.tar.gz"

mkdir -p "$OUTPUT_DIR"

tar -czf "$ARCHIVE" \
  --exclude="$PROJECT_NAME/backups" \
  --exclude="$PROJECT_NAME/node_modules" \
  --exclude="$PROJECT_NAME/backend/node_modules" \
  --exclude="$PROJECT_NAME/src-tauri/target" \
  --exclude="$PROJECT_NAME/android/.gradle" \
  --exclude="$PROJECT_NAME/android/app/build" \
  --exclude="$PROJECT_NAME/dist" \
  --exclude="$PROJECT_NAME/backend/dist" \
  --exclude="$PROJECT_NAME/.env" \
  --exclude="$PROJECT_NAME/backend/.env" \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  -C "$PROJECT_PARENT" "$PROJECT_NAME"

chmod 600 "$ARCHIVE"
(
  cd "$OUTPUT_DIR"
  shasum -a 256 "$(basename "$ARCHIVE")" > "$(basename "$ARCHIVE").sha256"
)
chmod 600 "$ARCHIVE.sha256"
tar -tzf "$ARCHIVE" > "$ARCHIVE.contents.txt"
chmod 600 "$ARCHIVE.contents.txt"

printf '%s\n' "$ARCHIVE"
