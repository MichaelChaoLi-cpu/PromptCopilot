const TRANSLATIONS = {
  zh: {
    // Topbar
    "btn.create_project":    "＋ 创建项目",
    "btn.no_project":        "未选择项目",
    "btn.settings":          "⚙",
    "btn.lang":              "EN",

    // Left panel
    "panel.edit_title":      "Prompt 编辑",
    "label.goal":            "目标",
    "label.input":           "输入",
    "label.output":          "输出",
    "label.steps":           "步骤",
    "label.notes":           "备注",
    "btn.add_input":         "＋ 添加输入",
    "btn.add_output":        "＋ 添加输出",
    "btn.add_step":          "＋ 添加步骤",
    "label.prompt_preview":  "生成的 Prompt",
    "btn.clear":             "清空表单",
    "btn.generate":          "生成 Prompt",
    "btn.copy":              "复制 Prompt",
    "btn.saved":             "已保存 ✓",
    "btn.save_failed":       "保存失败，请选择项目",

    // Placeholders
    "ph.goal":               "描述这个 prompt 的目标…",
    "ph.notes":              "本次 prompt 的补充说明…",
    "ph.input_item":         "输入项…",
    "ph.output_item":        "输出项…",
    "ph.step_item":          "步骤描述…",
    "ph.sticky":             "填写后将始终包含在生成的 prompt 中…",
    "ph.folder_path":        "/Users/xxx/my-project",
    "ph.git_repo":           "https://github.com/user/repo.git",
    "ph.project_name":       "例如：写作助手",

    // Right panel
    "label.sticky_title":    "备注常驻内容",
    "label.sticky_hint":     "每次生成 prompt 时自动附加",
    "label.folders_title":   "工作文件夹",
    "btn.add_folder":        "＋ 添加",
    "tree.col_in":           "入",
    "tree.col_out":          "出",
    "folder.no_projects":    "暂无项目",

    // Modals
    "modal.create_title":    "创建项目",
    "modal.folder_title":    "添加工作文件夹",
    "label.project_name":    "项目名称",
    "label.folder_path":     "绝对路径",
    "btn.cancel":            "取消",
    "btn.confirm_create":    "创建",
    "btn.confirm_add":       "添加",

    // Settings
    "modal.settings_title":  "设置",
    "settings.git_section":  "Git 数据同步",
    "label.git_repo":        "远端仓库地址",
    "btn.save_repo":         "保存地址",
    "btn.git_init":          "初始化",
    "btn.git_sync":          "同步",
    "btn.topbar_sync":       "同步",
    "btn.close":             "关闭",
    "status.repo_saved":     "地址已保存",
    "status.init_ok":        "初始化完成",
    "status.sync_ok":        "同步完成",
    "status.working":        "处理中…",
    "status.init_working":   "初始化中…",
    "status.sync_working":   "同步中…",

    // Force sync modal
    "modal.sync_title":      "需要同步",
    "modal.sync_desc":       "已配置 Git 同步，请先完成同步再继续操作。",
    "btn.do_sync":           "立即同步",

    // Error codes
    "err.EMPTY_NAME":        "项目名称不能为空",
    "err.PROJECT_EXISTS":    "项目已存在",
    "err.PROJECT_NOT_FOUND": "项目不存在",
    "err.EMPTY_PATH":        "路径不能为空",
    "err.DIR_NOT_FOUND":     "目录不存在或无法访问",
    "err.DIR_ALREADY_ADDED": "该目录已添加",
    "err.DIR_NO_PERMISSION": "无权访问该目录",
    "err.GIT_NOT_CONFIGURED":"尚未设置 Git 仓库地址",
    "err.GIT_NOT_INITIALIZED":"尚未初始化，请先点击初始化",
    "err.GIT_INIT_FAILED":   "git init 失败",
    "err.GIT_REMOTE_FAILED": "添加 remote 失败",
    "err.GIT_PULL_CONFLICT": "Pull 冲突，已中止",
    "err.GIT_PUSH_FAILED":   "Push 失败",
    "err.SAVE_FAILED":       "保存失败",
    "err.CREATE_FAILED":     "创建失败",
    "err.ADD_FAILED":        "添加失败",
    "err.UPDATE_TIMEOUT":    "更新超时，请检查网络",
    "err.UPDATE_ERROR":      "更新出错",

    // Update
    "btn.update":            "检查更新",
    "update.checking":       "检查中…",
    "update.up_to_date":     "已是最新 v{v}",
    "update.updated":        "已更新 v{old} → v{new}，即将刷新…",
    "update.failed":         "更新失败：{msg}",
  },

  en: {
    "btn.create_project":    "＋ New Project",
    "btn.no_project":        "No project selected",
    "btn.settings":          "⚙",
    "btn.lang":              "中",

    "panel.edit_title":      "Prompt Editor",
    "label.goal":            "Goal",
    "label.input":           "Input",
    "label.output":          "Output",
    "label.steps":           "Steps",
    "label.notes":           "Notes",
    "btn.add_input":         "＋ Add Input",
    "btn.add_output":        "＋ Add Output",
    "btn.add_step":          "＋ Add Step",
    "label.prompt_preview":  "Generated Prompt",
    "btn.clear":             "Clear Form",
    "btn.generate":          "Generate Prompt",
    "btn.copy":              "Copy Prompt",
    "btn.saved":             "Saved ✓",
    "btn.save_failed":       "Save failed — please select a project",

    "ph.goal":               "Describe the goal of this prompt…",
    "ph.notes":              "Additional notes for this prompt…",
    "ph.input_item":         "Input item…",
    "ph.output_item":        "Output item…",
    "ph.step_item":          "Step description…",
    "ph.sticky":             "This will always be appended to every generated prompt…",
    "ph.folder_path":        "/Users/xxx/my-project",
    "ph.git_repo":           "https://github.com/user/repo.git",
    "ph.project_name":       "e.g. Writing Assistant",

    "label.sticky_title":    "Persistent Notes",
    "label.sticky_hint":     "Appended automatically on every generation",
    "label.folders_title":   "Work Folders",
    "btn.add_folder":        "＋ Add",
    "tree.col_in":           "In",
    "tree.col_out":          "Out",
    "folder.no_projects":    "No projects",

    "modal.create_title":    "New Project",
    "modal.folder_title":    "Add Work Folder",
    "label.project_name":    "Project Name",
    "label.folder_path":     "Absolute Path",
    "btn.cancel":            "Cancel",
    "btn.confirm_create":    "Create",
    "btn.confirm_add":       "Add",

    "modal.settings_title":  "Settings",
    "settings.git_section":  "Git Data Sync",
    "label.git_repo":        "Remote Repository URL",
    "btn.save_repo":         "Save URL",
    "btn.git_init":          "Initialize",
    "btn.git_sync":          "Sync",
    "btn.topbar_sync":       "Sync",
    "btn.close":             "Close",
    "status.repo_saved":     "URL saved",
    "status.init_ok":        "Initialized",
    "status.sync_ok":        "Sync complete",
    "status.working":        "Working…",
    "status.init_working":   "Initializing…",
    "status.sync_working":   "Syncing…",

    "modal.sync_title":      "Sync Required",
    "modal.sync_desc":       "Git sync is configured. Please sync before continuing.",
    "btn.do_sync":           "Sync Now",

    "err.EMPTY_NAME":        "Project name cannot be empty",
    "err.PROJECT_EXISTS":    "Project already exists",
    "err.PROJECT_NOT_FOUND": "Project not found",
    "err.EMPTY_PATH":        "Path cannot be empty",
    "err.DIR_NOT_FOUND":     "Directory not found or inaccessible",
    "err.DIR_ALREADY_ADDED": "Directory already added",
    "err.DIR_NO_PERMISSION": "No permission to access this directory",
    "err.GIT_NOT_CONFIGURED":"Git repository URL not set",
    "err.GIT_NOT_INITIALIZED":"Not initialized — please click Initialize first",
    "err.GIT_INIT_FAILED":   "git init failed",
    "err.GIT_REMOTE_FAILED": "Failed to add remote",
    "err.GIT_PULL_CONFLICT": "Pull conflict — aborted",
    "err.GIT_PUSH_FAILED":   "Push failed",
    "err.SAVE_FAILED":       "Save failed",
    "err.CREATE_FAILED":     "Create failed",
    "err.ADD_FAILED":        "Add failed",
    "err.UPDATE_TIMEOUT":    "Update timed out — check your network",
    "err.UPDATE_ERROR":      "Update error",

    // Update
    "btn.update":            "Check for Updates",
    "update.checking":       "Checking…",
    "update.up_to_date":     "Already latest v{v}",
    "update.updated":        "Updated v{old} → v{new}, refreshing…",
    "update.failed":         "Update failed: {msg}",
  },
};

const LANG_KEY = "promptcopilot_lang";
let currentLang = localStorage.getItem(LANG_KEY) || "zh";

function t(key, vars) {
  let s = (TRANSLATIONS[currentLang] || TRANSLATIONS.zh)[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll(`{${k}}`, v); });
  return s;
}

function errMsg(data) {
  if (!data) return t("err.SAVE_FAILED");
  const code = data.code;
  if (code) {
    const base = t("err." + code);
    return data.detail ? base + "：" + data.detail : base;
  }
  return data.error || t("err.SAVE_FAILED");
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (el.placeholder !== undefined && el.dataset.i18nAttr === "placeholder") {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  applyI18n();
}
