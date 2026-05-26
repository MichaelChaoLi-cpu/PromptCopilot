#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON="$REPO_DIR/.venv/bin/python"
URL="http://localhost:2333"

if [ ! -f "$PYTHON" ]; then
    echo "未检测到虚拟环境，正在初始化..."
    bash "$REPO_DIR/init.sh"
    if [[ "$SHELL" == */zsh ]]; then
        source "$HOME/.zshrc" 2>/dev/null || true
    else
        source "$HOME/.bashrc" 2>/dev/null || true
    fi
fi

echo "启动 PromptCopilot → $URL"

# 自动打开浏览器
OS_TYPE="$(uname -s)"
if [ "$OS_TYPE" = "Darwin" ]; then
    sleep 1 && open "$URL" &
elif [ "$OS_TYPE" = "Linux" ]; then
    sleep 1 && (xdg-open "$URL" 2>/dev/null || true) &
fi

exec "$PYTHON" "$REPO_DIR/src/app.py"
