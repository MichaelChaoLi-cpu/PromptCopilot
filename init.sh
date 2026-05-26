#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$REPO_DIR/.venv"
OS_TYPE="$(uname -s)"

echo ""
echo "╔══════════════════════════════════╗"
echo "║     PromptCopilot  初始化         ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── 1. 确保 uv 可用 ───────────────────────────────────────────────────────────
_ensure_uv() {
    if command -v uv &>/dev/null; then return; fi

    echo "→ 未找到 uv，正在安装..."
    if ! curl -LsSf https://astral.sh/uv/install.sh | sh; then
        echo "✗ uv 安装失败，请手动安装：https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi

    # 尝试常见安装路径
    for candidate in "$HOME/.local/bin" "$HOME/.cargo/bin"; do
        if [ -x "$candidate/uv" ]; then
            export PATH="$candidate:$PATH"
            break
        fi
    done

    if ! command -v uv &>/dev/null; then
        echo "✗ uv 安装后仍无法找到，请重启终端后重试"
        exit 1
    fi
}

_ensure_uv
echo "→ $(uv --version)"

# ── 2. 创建虚拟环境 ────────────────────────────────────────────────────────────
if [ -f "$VENV_DIR/bin/python" ]; then
    echo "→ 虚拟环境 .venv 已存在，跳过"
else
    echo "→ 创建虚拟环境 .venv ..."
    uv venv "$VENV_DIR" --python 3.12
fi

# ── 3. 安装依赖 ───────────────────────────────────────────────────────────────
echo "→ 安装 Python 依赖..."
uv pip install --python "$VENV_DIR/bin/python" -e .
echo "→ 依赖安装完成"

# ── 4. 确保 start.sh 可执行 ───────────────────────────────────────────────────
chmod +x "$REPO_DIR/start.sh"

# ── 5. 写入 alias ─────────────────────────────────────────────────────────────
ALIAS_CMD="alias PromptCopilot='$REPO_DIR/start.sh'"

if [[ "$SHELL" == */zsh ]]; then
    RC_FILE="$HOME/.zshrc"
elif [[ "$SHELL" == */fish ]]; then
    FISH_CONFIG="$HOME/.config/fish/config.fish"
    mkdir -p "$(dirname "$FISH_CONFIG")"
    if grep -q "alias PromptCopilot" "$FISH_CONFIG" 2>/dev/null; then
        sed -i "s|alias PromptCopilot.*|alias PromptCopilot='$REPO_DIR/start.sh'|" "$FISH_CONFIG"
    else
        echo "" >> "$FISH_CONFIG"
        echo "# PromptCopilot" >> "$FISH_CONFIG"
        echo "alias PromptCopilot='$REPO_DIR/start.sh'" >> "$FISH_CONFIG"
    fi
    echo "→ 已更新 fish alias"
    RC_FILE=""
else
    RC_FILE="$HOME/.bashrc"
fi

if [ -n "$RC_FILE" ]; then
    if grep -q "alias PromptCopilot=" "$RC_FILE" 2>/dev/null; then
        if [ "$OS_TYPE" = "Darwin" ]; then
            sed -i '' "s|alias PromptCopilot=.*|$ALIAS_CMD|" "$RC_FILE"
        else
            sed -i "s|alias PromptCopilot=.*|$ALIAS_CMD|" "$RC_FILE"
        fi
        echo "→ 已更新 $RC_FILE 中的 PromptCopilot alias"
    else
        {
            echo ""
            echo "# PromptCopilot"
            echo "$ALIAS_CMD"
        } >> "$RC_FILE"
        echo "→ 已添加 PromptCopilot alias 到 $RC_FILE"
    fi
fi

# ── 完成 ──────────────────────────────────────────────────────────────────────
echo ""
echo "✓ 初始化完成！"
echo ""
if [ -n "$RC_FILE" ]; then
    echo "  执行以下命令使 alias 立即生效："
    echo ""
    echo "    source $RC_FILE"
    echo ""
    echo "  之后在任意终端输入："
    echo ""
fi
echo "    PromptCopilot"
echo ""
echo "  即可启动应用，浏览器会自动打开 http://localhost:2333"
echo ""
