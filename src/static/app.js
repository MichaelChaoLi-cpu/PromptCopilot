// ── Item list helpers ──────────────────────────────────────────────────────

function addItem(listId, placeholder) {
  const list = document.getElementById(listId);
  const index = list.children.length + 1;

  const row = document.createElement("div");
  row.className = "item-row";

  const idx = document.createElement("span");
  idx.className = "item-index";
  idx.textContent = index + ".";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "item-input";
  input.placeholder = placeholder;

  const rm = document.createElement("button");
  rm.className = "btn-remove";
  rm.textContent = "×";
  rm.onclick = () => { row.remove(); reindex(list); };

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
  const errorEl = document.getElementById("modal-error");
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

// Enter key to confirm in modal
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("new-project-name").addEventListener("keydown", e => {
    if (e.key === "Enter") confirmCreateProject();
    if (e.key === "Escape") closeCreateModal();
  });

  // Restore sticky notes
  const ta = document.getElementById("sticky-notes");
  ta.value = localStorage.getItem(STICKY_KEY) || "";
  ta.addEventListener("input", () => localStorage.setItem(STICKY_KEY, ta.value));

  // Restore current project label
  if (currentProject) {
    document.getElementById("current-project-name").textContent = currentProject;
  }
});

// ── Generate prompt ────────────────────────────────────────────────────────

function generatePrompt() {
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

  const prompt = parts.join("\n\n");
  navigator.clipboard.writeText(prompt).then(() => {
    const btn = document.querySelector(".btn-generate");
    const orig = btn.textContent;
    btn.textContent = "已复制到剪贴板 ✓";
    setTimeout(() => btn.textContent = orig, 2000);
  });
}
