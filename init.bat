@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

set REPO_DIR=%~dp0
set VENV_DIR=%REPO_DIR%.venv
set PYTHON_EXE=%VENV_DIR%\Scripts\python.exe
set UV_EXE=

echo.
echo ╔══════════════════════════════════╗
echo ║     PromptCopilot  初始化         ║
echo ╚══════════════════════════════════╝
echo.

REM ── 1. 确保 uv 可用 ─────────────────────────────────────────────────────────
where uv >nul 2>&1
if not errorlevel 1 (
    set UV_EXE=uv
    goto :uv_found
)

REM 检查常见安装路径
if exist "%USERPROFILE%\.local\bin\uv.exe" (
    set UV_EXE=%USERPROFILE%\.local\bin\uv.exe
    goto :uv_found
)
if exist "%USERPROFILE%\.cargo\bin\uv.exe" (
    set UV_EXE=%USERPROFILE%\.cargo\bin\uv.exe
    goto :uv_found
)

echo ^→ 未找到 uv，正在安装...
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"
if errorlevel 1 (
    echo ✗ uv 安装失败，请手动安装：https://docs.astral.sh/uv/getting-started/installation/
    pause
    exit /b 1
)

REM 安装后再次查找
where uv >nul 2>&1
if not errorlevel 1 (
    set UV_EXE=uv
    goto :uv_found
)
if exist "%USERPROFILE%\.local\bin\uv.exe" set UV_EXE=%USERPROFILE%\.local\bin\uv.exe
if exist "%USERPROFILE%\.cargo\bin\uv.exe" set UV_EXE=%USERPROFILE%\.cargo\bin\uv.exe

if "!UV_EXE!"=="" (
    echo ✗ uv 安装后仍无法找到，请重启终端后重试
    pause
    exit /b 1
)

:uv_found
for /f "tokens=*" %%v in ('"!UV_EXE!" --version 2^>nul') do echo ^→ %%v

REM ── 2. 创建虚拟环境 ──────────────────────────────────────────────────────────
if exist "%PYTHON_EXE%" (
    echo ^→ 虚拟环境 .venv 已存在，跳过
) else (
    echo ^→ 创建虚拟环境 .venv ...
    "!UV_EXE!" venv "%VENV_DIR%" --python 3.12
    if errorlevel 1 (
        echo ✗ 创建虚拟环境失败，请确认已安装 Python 3.12
        pause
        exit /b 1
    )
)

REM ── 3. 安装依赖 ──────────────────────────────────────────────────────────────
echo ^→ 安装 Python 依赖（首次较慢，请稍候）...
"!UV_EXE!" pip install --python "%PYTHON_EXE%" -e "%REPO_DIR%."
if errorlevel 1 (
    echo ✗ 依赖安装失败，请检查网络连接后重试
    pause
    exit /b 1
)
echo ^→ 依赖安装完成

REM ── 完成 ─────────────────────────────────────────────────────────────────────
echo.
echo ✓ 初始化完成！
echo.
echo   双击 start.bat 即可启动应用
echo   浏览器会自动打开 http://localhost:2333
echo.
pause
