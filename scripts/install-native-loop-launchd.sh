#!/usr/bin/env bash
# يثبّت com.ssunnah.native-loop (كل ساعتين). السكربتات تُنسخ إلى ~/.ssunnah-tools حتى لا يتوقف إن حُذف worktree.
set -euo pipefail
R="$(git rev-parse --show-toplevel)"; T="$HOME/.ssunnah-tools"; P="$HOME/Library/LaunchAgents/com.ssunnah.native-loop.plist"
MAIN="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"
mkdir -p "$T/scripts" "$HOME/ssunnah-board" "$HOME/Library/LaunchAgents"
cp "$R/scripts/native-loop.sh" "$R/scripts/ci-local-lock.sh" "$T/scripts/"
echo "REPO=$MAIN" > "$T/native-loop.env"
sed "s|__HOME__|$HOME|g" "$R/scripts/launchd/com.ssunnah.native-loop.plist" > "$P"
launchctl bootout "gui/$(id -u)" "$P" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$P"
echo "مثبّت: $P (REPO=$MAIN)"
