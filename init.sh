#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$REPO_DIR/.venv"

echo ""
echo "╔══════════════════════════════════╗"
echo "║     PromptCopilot  初始化         ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── 1. 确保 uv 可用 ───────────────────────────────────────────────────────────
if ! command -v uv &>/dev/null; then
    echo "→ 未找到 uv，正在安装..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi
echo "→ uv $(uv --version)"

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
else
    RC_FILE="$HOME/.bashrc"
fi

OS_TYPE="$(uname -s)"
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

echo ""
echo "✓ 初始化完成！"
echo ""
echo "  执行以下命令使 alias 立即生效："
echo ""
echo "    source $RC_FILE"
echo ""
echo "  之后在任意终端输入："
echo ""
echo "    PromptCopilot"
echo ""
echo "  即可启动应用，浏览器会自动打开 http://localhost:5000"
echo ""
