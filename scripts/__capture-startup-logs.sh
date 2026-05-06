#!/usr/bin/env bash
# Temporary helper for debug session 09dba4 (startup white-screen).
# Captures startup logs from a connected Android device into .cursor/logcat.txt.
# Usage:
#   bash scripts/__capture-startup-logs.sh
# Prereqs:
#   - Device connected (`adb devices` shows it).
#   - The DressFair DEBUG build is installed on the device
#     (run `npx expo run:android` once first; do NOT use --variant release).
set -uo pipefail

cd "$(dirname "$0")/.."
mkdir -p .cursor

PKG=com.dressfair.dressfairrnhybrid
OUT=.cursor/logcat.txt

# Pick adb: prefer the SDK adb the user already has running.
ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
if [ ! -x "$ADB" ]; then ADB="adb"; fi

echo "[1/6] adb devices:"
"$ADB" devices -l || { echo "FATAL: adb not working"; exit 1; }

echo "[2/6] adb reverse tcp:7673 tcp:7673"
"$ADB" reverse tcp:7673 tcp:7673 || true

echo "[3/6] Force-stop $PKG"
"$ADB" shell am force-stop "$PKG" || true
sleep 1

echo "[4/6] Clear logcat and start streaming to $OUT"
"$ADB" logcat -c
: > "$OUT"
# Capture broadly: new-arch (BridgelessReact) and old-arch (ReactNativeJS),
# plus anything containing our DRESSFAIR_DEBUG marker.
"$ADB" logcat -v threadtime '*:W' > "$OUT" &
LOGCAT_PID=$!
sleep 1

echo "[5/6] Cold-launch $PKG (will stream logs for 15s)"
"$ADB" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 15

echo "[6/6] Stop logcat"
kill "$LOGCAT_PID" 2>/dev/null || true
wait "$LOGCAT_PID" 2>/dev/null || true

LINES=$(wc -l < "$OUT" | tr -d ' ')
echo "Done. Captured $LINES lines to $OUT"
echo "First few lines:"
head -5 "$OUT"
