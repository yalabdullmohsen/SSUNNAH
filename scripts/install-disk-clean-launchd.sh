#!/usr/bin/env bash
# يثبّت تنظيف 3 صباحًا الليلي (launchd). السكربت يُنسخ إلى ~/.ssunnah-tools حتى لا يتوقف إن حُذف worktree.
set -euo pipefail
R="$(git rev-parse --show-toplevel)"; T="$HOME/.ssunnah-tools"; P="$HOME/Library/LaunchAgents/com.ssunnah.disk-clean.plist"
mkdir -p "$T/scripts" "$HOME/ssunnah-board" "$HOME/Library/LaunchAgents"
cp "$R/scripts/ci-local-lock.sh" "$R/scripts/disk-clean.sh" "$R/scripts/post-merge-cleanup.sh" "$T/scripts/"
sed "s|__REPO__|$T|g; s|__HOME__|$HOME|g" "$R/scripts/launchd/com.ssunnah.disk-clean.plist" > "$P"
launchctl bootout "gui/$(id -u)" "$P" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$P"
echo "مثبّت: $P"
