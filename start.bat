@echo off
setlocal
chcp 65001 >nul 2>&1

set REPO_DIR=%~dp0
set PYTHON_EXE=%REPO_DIR%.venv\Scripts\python.exe
set URL=http://localhost:2333

REM 首次运行或 venv 丢失时自动初始化
if not exist "%PYTHON_EXE%" (
    echo 未检测到虚拟环境，正在初始化...
    call "%REPO_DIR%init.bat"
    if errorlevel 1 exit /b 1
)

echo 启动 PromptCopilot → %URL%

REM 延迟1秒后自动打开浏览器
start "" /b cmd /c "timeout /t 1 >nul && start %URL%"

"%PYTHON_EXE%" "%REPO_DIR%src\app.py"
