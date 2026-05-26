# PromptCopilot

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![uv](https://img.shields.io/badge/uv-package%20manager-DE5FE9?logo=astral&logoColor=white)](https://github.com/astral-sh/uv)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)](https://github.com/MichaelChaoLi-cpu/PromptCopilot)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/MichaelChaoLi-cpu/PromptCopilot)

一个基于 Flask 的 Prompt 标准化工具，帮助用户快速、准确地生成结构化 prompt，并按项目归档记录。

---

## 功能介绍

- **结构化编写**：将 prompt 拆解为目标、输入、输出、步骤、备注五个维度，逐项填写
- **工作文件夹集成**：添加本地文件夹后可在浏览器中选择文件/目录，自动填入输入或输出条目
- **备注常驻内容**：设置每次生成都会自动附加的固定说明
- **项目管理**：按项目归档，每个项目独立存储配置和 prompt 记录
- **Prompt 持久化**：确认的 prompt 以结构化格式保存至 YAML 文件
- **Git 同步**：支持将 data 目录同步到远端 Git 仓库，实现多设备共享
- **中英双语界面**：支持中文 / English 切换
- **一键更新**：通过顶栏按钮拉取最新版本

---

## 快速开始

### macOS

```bash
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
bash init.sh
source ~/.zshrc
PromptCopilot
```

> `init.sh` 会自动安装 uv、创建虚拟环境、安装依赖，并注册 `PromptCopilot` 快捷命令。

### Linux

```bash
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
bash init.sh
source ~/.bashrc   # 使用 zsh 请改为 source ~/.zshrc
PromptCopilot
```

### Windows

```cmd
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
init.bat
```

之后双击 `start.bat` 启动，或在 cmd 中运行 `start.bat`。

启动后访问：[http://localhost:2333](http://localhost:2333)

---

## 使用说明

### 创建项目

点击顶栏左侧"**＋ 创建项目**"，输入项目名称。项目数据保存在 `data/<项目名>/` 目录下，包含：

- `config.yaml`：项目配置（备注常驻内容、工作文件夹列表）
- `prompts.yaml`：已保存的 prompt 记录

顶栏右侧可切换当前项目。

### 编写 Prompt

左侧面板包含五个字段：

| 字段 | 说明 |
|------|------|
| 目标 | 描述这条 prompt 要完成的任务 |
| 输入 | 分条填写，支持手动添加或从文件夹选择 |
| 输出 | 分条填写，支持手动添加或从文件夹选择 |
| 步骤 | 分条填写执行步骤 |
| 备注 | 本次 prompt 的补充说明 |

### 备注常驻内容

右侧面板顶部的"**备注常驻内容**"会在每次生成时自动附加到备注末尾，适合填写通用约束（如语言要求、格式规范等）。内容自动保存到浏览器本地。

### 工作文件夹

右侧面板底部可添加本地文件夹（绝对路径），路径保存在项目 `config.yaml` 中。

展开文件夹后，文件树右侧每行有两个 checkbox：

- **入**（蓝色）：勾选后将该路径添加到输入列表
- **出**（绿色）：勾选后将该路径添加到输出列表

同一文件/文件夹可同时勾选为输入和输出。来自文件夹的条目为只读，手动添加的条目可编辑。

### 生成与保存 Prompt

1. 填写完成后点击"**生成 Prompt**"，左侧备注下方出现预览框
2. 修改任意字段后按钮自动重置为"生成 Prompt"
3. 确认内容无误后点击"**复制 Prompt**"：
   - 内容复制到剪贴板
   - 本条 prompt 保存至项目的 `prompts.yaml`

### Git 同步

点击顶栏"**⚙**"打开设置，填入远端 Git 仓库地址后点击"**初始化**"。

顶栏同步按钮状态说明：

| 颜色 | 含义 |
|------|------|
| 灰色（不可点） | 未配置 Git 仓库 |
| 绿色 | 已配置，本地与远端一致 |
| 红色 | 本地有未同步的改动，点击立即同步 |

---

## 目录结构

```
PromptCopilot/
├── src/
│   ├── app.py          # Flask 应用入口
│   ├── static/         # CSS / JS
│   └── templates/      # HTML 模板
├── data/               # 项目数据（不纳入版本控制）
│   └── <项目名>/
│       ├── config.yaml
│       └── prompts.yaml
├── etc/                # 全局配置
├── pyproject.toml
├── init.sh / init.bat  # 初始化脚本
└── start.sh / start.bat # 启动脚本
```

---

---

# PromptCopilot (English)

A Flask-based prompt standardization tool that helps you quickly generate structured prompts and archive them by project.

---

## Features

- **Structured editing**: Break down prompts into five dimensions — Goal, Input, Output, Steps, and Notes
- **Work folder integration**: Browse local directories and select files/folders to auto-populate Input or Output fields
- **Persistent notes**: Set notes that are automatically appended to every generated prompt
- **Project management**: Each project stores its config and prompt history independently
- **Prompt persistence**: Confirmed prompts are saved in structured YAML files
- **Git sync**: Sync the `data/` directory to a remote Git repository for multi-device access
- **Bilingual UI**: Switch between 中文 and English
- **One-click update**: Pull the latest version from the topbar

---

## Quick Start

### macOS

```bash
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
bash init.sh
source ~/.zshrc
PromptCopilot
```

> `init.sh` automatically installs uv, creates a virtual environment, installs dependencies, and registers the `PromptCopilot` command.

### Linux

```bash
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
bash init.sh
source ~/.bashrc   # or source ~/.zshrc if using zsh
PromptCopilot
```

### Windows

```cmd
git clone https://github.com/MichaelChaoLi-cpu/PromptCopilot.git
cd PromptCopilot
init.bat
```

Then double-click `start.bat` to launch, or run `start.bat` from cmd.

Then open: [http://localhost:2333](http://localhost:2333)

---

## Usage

### Create a Project

Click "**＋ New Project**" in the topbar. Each project is stored under `data/<project-name>/` and contains:

- `config.yaml`: project settings (persistent notes, work folder list)
- `prompts.yaml`: saved prompt records

Switch between projects using the dropdown in the topbar.

### Writing a Prompt

The left panel has five fields:

| Field | Description |
|-------|-------------|
| Goal | Describe the task this prompt should accomplish |
| Input | Add items manually or select from a work folder |
| Output | Add items manually or select from a work folder |
| Steps | List the execution steps |
| Notes | Additional notes for this prompt |

### Persistent Notes

The "**Persistent Notes**" area at the top of the right panel is appended to the Notes field on every generation. Useful for universal constraints like language requirements or formatting rules. Saved locally in the browser.

### Work Folders

Add a local folder by absolute path via the right panel. The path is saved in the project's `config.yaml`.

Each entry in the file tree has two checkboxes:

- **In** (blue): adds the path to the Input list
- **Out** (green): adds the path to the Output list

A file or folder can be checked as both Input and Output. File-browser items are read-only; manually added items are editable.

### Generate and Save a Prompt

1. Fill in the fields and click "**Generate Prompt**" — a preview appears below the Notes field
2. Editing any field resets the button back to "Generate Prompt"
3. Click "**Copy Prompt**" to confirm:
   - Copies content to clipboard
   - Saves the prompt to `prompts.yaml`

### Git Sync

Open Settings (**⚙**), enter a remote Git repository URL, and click **Initialize**.

Topbar sync button states:

| Color | Meaning |
|-------|---------|
| Gray (disabled) | No Git repository configured |
| Green | Configured and in sync with remote |
| Red | Local changes not yet synced — click to sync |

---

## Directory Structure

```
PromptCopilot/
├── src/
│   ├── app.py          # Flask application entry point
│   ├── static/         # CSS / JS
│   └── templates/      # HTML templates
├── data/               # Project data (not version-controlled)
│   └── <project-name>/
│       ├── config.yaml
│       └── prompts.yaml
├── etc/                # Global config
├── pyproject.toml
├── init.sh / init.bat  # Initialization scripts
└── start.sh / start.bat # Startup scripts
```
