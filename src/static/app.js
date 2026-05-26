// ── Item list helpers ──────────────────────────────────────────────────────

function addItem(listId, placeholder) {
  const list = document.getElementById(listId);
  const row = document.createElement("div");
  row.className = "item-row";

  const idx = document.createElement("span");
  idx.className = "item-index";
  idx.textContent = (list.children.length + 1) + ".";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "item-input";
  input.placeholder = placeholder;
  input.addEventListener("input", onFormChange);

  const rm = document.createElement("button");
  rm.className = "btn-remove";
  rm.textContent = "×";
  rm.onclick = () => { row.remove(); reindex(list); onFormChange(); };

  row.appendChild(idx);
  row.appendChild(input);
  row.appendChild(rm);
  list.appendChild(row);
  input.focus();
}

function reindex(list) {
  Array.from(list.children).forEach((row, i) => {
    row.querySelector(".item-index").textContent = (i + 1) + ".";
  });
}

function getItems(listId) {
  return Array.from(document.getElementById(listId).querySelectorAll(".item-input"))
    .map(el => el.value.trim())
    .filter(Boolean);
}

// ── Prompt state ───────────────────────────────────────────────────────────
// States: "idle" | "ready"
// idle  → button says "生成 Prompt" (blue), preview hidden
// ready → button says "复制 Prompt" (green), preview visible

let promptState = "idle";
let lastPrompt = "";

function setIdle() {
  promptState = "idle";
  lastPrompt = "";
  document.getElementById("btn-generate").textContent = "生成 Prompt";
  document.getElementById("btn-generate").classList.remove("ready");
  document.getElementById("prompt-preview-field").style.display = "none";
  document.getElementById("prompt-preview").value = "";
}

function setReady(text) {
  promptState = "ready";
  lastPrompt = text;
  document.getElementById("prompt-preview").value = text;
  document.getElementById("prompt-preview-field").style.display = "";
  document.getElementById("btn-generate").textContent = "复制 Prompt";
  document.getElementById("btn-generate").classList.add("ready");
}

function onFormChange() {
  if (promptState === "ready") setIdle();
}

async function onGenerateClick() {
  if (promptState === "idle") {
    const text = buildPrompt();
    if (text) setReady(text);
  } else {
    // "复制 Prompt" clicked → copy + save
    navigator.clipboard.writeText(lastPrompt);
    const ok = await savePrompt();
    const btn = document.getElementById("btn-generate");
    btn.textContent = ok ? "已保存 ✓" : "保存失败，请选择项目";
    setTimeout(() => { btn.textContent = "复制 Prompt"; }, 2000);
  }
}

// ── Build prompt text ──────────────────────────────────────────────────────

function buildPrompt() {
  const goal    = document.getElementById("goal").value.trim();
  const inputs  = getItems("inputs-list");
  const outputs = getItems("outputs-list");
  const steps   = getItems("steps-list");
  const notes   = document.getElementById("notes").value.trim();
  const sticky  = document.getElementById("sticky-notes").value.trim();

  const parts = [];
  if (goal)           parts.push(`## 目标\n${goal}`);
  if (inputs.length)  parts.push(`## 输入\n${inputs.map((v, i) => `${i+1}. ${v}`).join("\n")}`);
  if (outputs.length) parts.push(`## 输出\n${outputs.map((v, i) => `${i+1}. ${v}`).join("\n")}`);
  if (steps.length)   parts.push(`## 步骤\n${steps.map((v, i) => `${i+1}. ${v}`).join("\n")}`);

  const notesSection = [notes, sticky].filter(Boolean).join("\n");
  if (notesSection)   parts.push(`## 备注\n${notesSection}`);

  return parts.join("\n\n");
}

// ── Save prompt ────────────────────────────────────────────────────────────

async function savePrompt() {
  if (!currentProject) {
    alert("请先选择或创建一个项目");
    return false;
  }

  const payload = {
    goal:         document.getElementById("goal").value.trim(),
    inputs:       getItems("inputs-list"),
    outputs:      getItems("outputs-list"),
    steps:        getItems("steps-list"),
    notes:        document.getElementById("notes").value.trim(),
    sticky_notes: document.getElementById("sticky-notes").value.trim(),
  };

  const res = await fetch(`/api/project/${encodeURIComponent(currentProject)}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

// ── Sticky notes persistence ───────────────────────────────────────────────

const STICKY_KEY = "promptcopilot_sticky_notes";

// ── Project state ──────────────────────────────────────────────────────────

const PROJECT_KEY = "promptcopilot_current_project";
let currentProject = localStorage.getItem(PROJECT_KEY) || null;

function setCurrentProject(name) {
  currentProject = name;
  localStorage.setItem(PROJECT_KEY, name);
  document.getElementById("current-project-name").textContent = name;
  closeProjectDropdown();
  loadProjectFolders(name);
}

// ── Project dropdown ───────────────────────────────────────────────────────

async function loadProjects() {
  const res = await fetch("/api/projects");
  return await res.json();
}

async function toggleProjectDropdown() {
  const dropdown = document.getElementById("project-dropdown");
  if (dropdown.classList.contains("open")) {
    closeProjectDropdown();
    return;
  }

  const projects = await loadProjects();
  dropdown.innerHTML = "";

  if (projects.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-empty">暂无项目</div>';
  } else {
    projects.forEach(name => {
      const item = document.createElement("div");
      item.className = "dropdown-item" + (name === currentProject ? " active" : "");
      item.textContent = name;
      item.onclick = () => setCurrentProject(name);
      dropdown.appendChild(item);
    });
  }

  dropdown.classList.add("open");
  document.addEventListener("click", outsideClickHandler, { once: true, capture: true });
}

function closeProjectDropdown() {
  document.getElementById("project-dropdown").classList.remove("open");
}

function outsideClickHandler(e) {
  const switcher = document.getElementById("project-switcher");
  if (!switcher.contains(e.target)) closeProjectDropdown();
}

// ── Create project modal ───────────────────────────────────────────────────

function openCreateModal() {
  document.getElementById("new-project-name").value = "";
  document.getElementById("modal-error").textContent = "";
  document.getElementById("new-project-name").classList.remove("error");
  document.getElementById("modal-backdrop").classList.add("open");
  document.getElementById("create-modal").classList.add("open");
  setTimeout(() => document.getElementById("new-project-name").focus(), 50);
}

function closeCreateModal() {
  document.getElementById("modal-backdrop").classList.remove("open");
  document.getElementById("create-modal").classList.remove("open");
}

async function confirmCreateProject() {
  const nameInput = document.getElementById("new-project-name");
  const errorEl   = document.getElementById("modal-error");
  const name = nameInput.value.trim();

  if (!name) {
    errorEl.textContent = "项目名称不能为空";
    nameInput.classList.add("error");
    return;
  }

  const res = await fetch("/api/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    closeCreateModal();
    setCurrentProject(name);
  } else {
    const data = await res.json();
    errorEl.textContent = data.error || "创建失败";
    nameInput.classList.add("error");
  }
}

// ── Work folders ───────────────────────────────────────────────────────────

// checkedFiles: Map<absPath, {mode, relative, root, rowEl, listId}>
const checkedFiles = new Map();

function openAddFolderModal() {
  if (!currentProject) { alert("请先选择或创建一个项目"); return; }
  document.getElementById("new-folder-path").value = "";
  document.getElementById("folder-modal-error").textContent = "";
  document.getElementById("new-folder-path").classList.remove("error");
  document.getElementById("folder-modal-backdrop").classList.add("open");
  document.getElementById("add-folder-modal").classList.add("open");
  setTimeout(() => document.getElementById("new-folder-path").focus(), 50);
}

function closeAddFolderModal() {
  document.getElementById("folder-modal-backdrop").classList.remove("open");
  document.getElementById("add-folder-modal").classList.remove("open");
}

async function confirmAddFolder() {
  const input = document.getElementById("new-folder-path");
  const errorEl = document.getElementById("folder-modal-error");
  const path = input.value.trim();

  if (!path) { errorEl.textContent = "路径不能为空"; input.classList.add("error"); return; }

  const res = await fetch(`/api/project/${encodeURIComponent(currentProject)}/config/folder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });

  if (res.ok) {
    closeAddFolderModal();
    renderFolderItem(path);
  } else {
    const data = await res.json();
    errorEl.textContent = data.error || "添加失败";
    input.classList.add("error");
  }
}

async function removeWorkFolder(path, itemEl) {
  await fetch(`/api/project/${encodeURIComponent(currentProject)}/config/folder`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  // Remove checked items that belong to this folder
  for (const [key, info] of checkedFiles.entries()) {
    if (info.root === path) {
      info.rowEl.remove();
      checkedFiles.delete(key);
    }
  }
  reindex(document.getElementById("inputs-list"));
  reindex(document.getElementById("outputs-list"));
  itemEl.remove();
}

function renderFolderItem(folderPath) {
  const list = document.getElementById("folder-list");
  const item = document.createElement("div");
  item.className = "folder-item";

  // Header
  const header = document.createElement("div");
  header.className = "folder-item-header";

  const chevron = document.createElement("span");
  chevron.className = "folder-chevron";
  chevron.textContent = "▶";

  const icon = document.createElement("span");
  icon.className = "folder-icon";
  icon.textContent = "📁";

  const pathSpan = document.createElement("span");
  pathSpan.className = "folder-path";
  pathSpan.textContent = folderPath;
  pathSpan.title = folderPath;

  const rmBtn = document.createElement("button");
  rmBtn.className = "btn-folder-remove";
  rmBtn.textContent = "×";
  rmBtn.title = "移除";
  rmBtn.onclick = (e) => { e.stopPropagation(); removeWorkFolder(folderPath, item); };

  header.appendChild(chevron);
  header.appendChild(icon);
  header.appendChild(pathSpan);
  header.appendChild(rmBtn);

  // Browser
  const browser = document.createElement("div");
  browser.className = "folder-browser";

  const treeEl = document.createElement("div");
  treeEl.className = "file-tree";

  // Column header
  const treeHeader = document.createElement("div");
  treeHeader.className = "file-tree-header";
  treeHeader.innerHTML = "<span>入</span><span>出</span>";
  treeEl.appendChild(treeHeader);

  browser.appendChild(treeEl);

  item.appendChild(header);
  item.appendChild(browser);
  list.appendChild(item);

  let loaded = false;

  header.onclick = async () => {
    const isOpen = browser.classList.contains("open");
    if (isOpen) {
      browser.classList.remove("open");
      chevron.classList.remove("open");
    } else {
      browser.classList.add("open");
      chevron.classList.add("open");
      if (!loaded) {
        loaded = true;
        await renderTreeLevel(treeEl, folderPath, folderPath, 0);
      }
    }
  };
}

async function renderTreeLevel(container, dirPath, root, depth) {
  const res = await fetch(`/api/folder/tree?path=${encodeURIComponent(dirPath)}&root=${encodeURIComponent(root)}`);
  if (!res.ok) return;
  const entries = await res.json();

  for (const entry of entries) {
    const node = document.createElement("div");
    node.className = "tree-node" + (entry.is_dir ? " is-dir" : "");

    const indent = document.createElement("span");
    indent.className = "node-indent";
    indent.style.width = (depth * 16) + "px";

    const chevron = document.createElement("span");
    chevron.className = "node-chevron";
    chevron.textContent = entry.is_dir ? "▶" : "";

    const nodeIcon = document.createElement("span");
    nodeIcon.className = "node-icon";
    nodeIcon.textContent = entry.is_dir ? "📁" : "📄";

    const name = document.createElement("span");
    name.className = "node-name";
    name.textContent = entry.name;
    name.title = entry.relative;

    // Dual checkboxes
    const checks = document.createElement("div");
    checks.className = "node-checks";

    const cbIn  = makeTreeCheckbox(entry, root, "input",  "cb-input");
    const cbOut = makeTreeCheckbox(entry, root, "output", "cb-output");
    checks.appendChild(cbIn);
    checks.appendChild(cbOut);

    node.appendChild(indent);
    node.appendChild(chevron);
    node.appendChild(nodeIcon);
    node.appendChild(name);
    node.appendChild(checks);

    if (entry.is_dir) {
      let expanded = false;
      let childContainer = null;

      node.onclick = async (e) => {
        if (checks.contains(e.target)) return;
        if (!expanded) {
          expanded = true;
          chevron.classList.add("open");
          childContainer = document.createElement("div");
          container.insertBefore(childContainer, node.nextSibling);
          await renderTreeLevel(childContainer, entry.path, root, depth + 1);
        } else {
          expanded = false;
          chevron.classList.remove("open");
          childContainer.remove();
          childContainer = null;
        }
      };
    }

    container.appendChild(node);
  }
}

function makeTreeCheckbox(entry, root, mode, cls) {
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = cls;
  cb.onclick = (e) => e.stopPropagation();

  const key = entry.path + ":" + mode;
  const listId = mode === "input" ? "inputs-list" : "outputs-list";

  cb.onchange = () => {
    if (cb.checked) {
      const rowEl = addLockedItem(listId, entry.relative, mode);
      checkedFiles.set(key, { relative: entry.relative, root, rowEl, listId, cb });
    } else {
      const info = checkedFiles.get(key);
      if (info) {
        info.rowEl.remove();
        reindex(document.getElementById(listId));
        checkedFiles.delete(key);
      }
    }
    onFormChange();
  };

  return cb;
}

function addLockedItem(listId, text, mode) {
  const list = document.getElementById(listId);

  const row = document.createElement("div");
  row.className = "item-row";

  const idx = document.createElement("span");
  idx.className = "item-index";
  idx.textContent = (list.children.length + 1) + ".";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "item-input" + (mode === "output" ? " output-locked" : "");
  input.value = text;
  input.readOnly = true;
  input.dataset.locked = "1";

  row.appendChild(idx);
  row.appendChild(input);
  list.appendChild(row);
  return row;
}

async function loadProjectFolders(projectName) {
  const res = await fetch(`/api/project/${encodeURIComponent(projectName)}/config`);
  if (!res.ok) return;
  const config = await res.json();
  const folders = config.work_folders || [];
  document.getElementById("folder-list").innerHTML = "";
  for (const f of folders) renderFolderItem(f);
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Sticky notes
  const ta = document.getElementById("sticky-notes");
  ta.value = localStorage.getItem(STICKY_KEY) || "";
  ta.addEventListener("input", () => {
    localStorage.setItem(STICKY_KEY, ta.value);
    onFormChange();
  });

  // Watch form fields for changes
  ["goal", "notes"].forEach(id => {
    document.getElementById(id).addEventListener("input", onFormChange);
  });

  // Modal keyboard
  document.getElementById("new-project-name").addEventListener("keydown", e => {
    if (e.key === "Enter") confirmCreateProject();
    if (e.key === "Escape") closeCreateModal();
  });
  document.getElementById("new-folder-path").addEventListener("keydown", e => {
    if (e.key === "Enter") confirmAddFolder();
    if (e.key === "Escape") closeAddFolderModal();
  });

  // Restore current project label and folders
  if (currentProject) {
    document.getElementById("current-project-name").textContent = currentProject;
    loadProjectFolders(currentProject);
  }
});
