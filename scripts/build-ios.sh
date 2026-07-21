#!/bin/sh
set -eu

DERIVED_DATA_PATH="${DERIVED_DATA_PATH:-/tmp/chamados-ti-ios-derived-data}"
ARTIFACT_DIR="$PWD/artifacts/ios"

npm run cap:sync:ios
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  CODE_SIGNING_ALLOWED=NO \
  build

mkdir -p "$ARTIFACT_DIR"
cp -R "$DERIVED_DATA_PATH/Build/Products/Debug-iphonesimulator/App.app" "$ARTIFACT_DIR/Chamados-TI-0.1.2-simulator.app"
printf '%s\n' "$ARTIFACT_DIR/Chamados-TI-0.1.2-simulator.app"
