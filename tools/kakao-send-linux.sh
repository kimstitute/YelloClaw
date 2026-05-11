#!/usr/bin/env bash
# Send a pull-trigger message to the KakaoTalk chatbot room.
# Requires: xdotool wmctrl xclip
# Usage: kakao-send-linux.sh ["custom message"]
set -euo pipefail

TRIGGERS=(
  "."
  "확인"
  "알림 확인"
  "새 메시지 확인"
  "대기 메시지 확인"
  "업데이트 확인"
  "뭐 온 거 있어?"
  "/pull"
)

TEXT="${1:-${TRIGGERS[$RANDOM % ${#TRIGGERS[@]}]}}"
WINDOW_TITLE="${KAKAO_WINDOW_TITLE:-KakaoTalk}"

if ! wmctrl -a "$WINDOW_TITLE" 2>/dev/null; then
  echo "[kakao-send] window '$WINDOW_TITLE' not found" >&2
  exit 1
fi

sleep 0.3
printf "%s" "$TEXT" | xclip -selection clipboard
sleep 0.1
xdotool key ctrl+v
sleep 0.1
xdotool key Return
