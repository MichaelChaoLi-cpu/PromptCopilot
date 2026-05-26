import os
import yaml
from datetime import datetime
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

__version__ = "0.1.0"

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _project_dir(name: str) -> str:
    return os.path.join(DATA_DIR, name)


def _load_yaml(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _save_yaml(path: str, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)


# ── Pages ─────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


# ── Projects ──────────────────────────────────────────────────────────────────

@app.route("/api/projects", methods=["GET"])
def list_projects():
    os.makedirs(DATA_DIR, exist_ok=True)
    names = sorted(
        d for d in os.listdir(DATA_DIR)
        if os.path.isdir(os.path.join(DATA_DIR, d))
    )
    return jsonify(names)


@app.route("/api/project", methods=["POST"])
def create_project():
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "项目名称不能为空"}), 400

    project_dir = _project_dir(name)
    if os.path.exists(project_dir):
        return jsonify({"error": "项目已存在"}), 409

    os.makedirs(project_dir)
    _save_yaml(os.path.join(project_dir, "config.yaml"),
               {"sticky_notes": "", "work_folders": []})
    _save_yaml(os.path.join(project_dir, "prompts.yaml"), {"prompts": []})

    return jsonify({"name": name}), 201


# ── Project config ─────────────────────────────────────────────────────────────

@app.route("/api/project/<name>/config", methods=["GET"])
def get_config(name):
    config_path = os.path.join(_project_dir(name), "config.yaml")
    if not os.path.exists(config_path):
        return jsonify({"error": "项目不存在"}), 404
    return jsonify(_load_yaml(config_path))


@app.route("/api/project/<name>/config/folder", methods=["POST"])
def add_work_folder(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify({"error": "项目不存在"}), 404

    data = request.get_json(force=True)
    folder = (data.get("path") or "").strip()
    if not folder:
        return jsonify({"error": "路径不能为空"}), 400
    if not os.path.isdir(folder):
        return jsonify({"error": "目录不存在或无法访问"}), 400

    config_path = os.path.join(project_dir, "config.yaml")
    config = _load_yaml(config_path)
    folders = config.get("work_folders") or []
    if folder in folders:
        return jsonify({"error": "该目录已添加"}), 409
    folders.append(folder)
    config["work_folders"] = folders
    _save_yaml(config_path, config)

    return jsonify({"path": folder}), 201


@app.route("/api/project/<name>/config/folder", methods=["DELETE"])
def remove_work_folder(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify({"error": "项目不存在"}), 404

    data = request.get_json(force=True)
    folder = (data.get("path") or "").strip()

    config_path = os.path.join(project_dir, "config.yaml")
    config = _load_yaml(config_path)
    folders = config.get("work_folders") or []
    if folder in folders:
        folders.remove(folder)
    config["work_folders"] = folders
    _save_yaml(config_path, config)

    return jsonify({"ok": True})


# ── Directory tree ─────────────────────────────────────────────────────────────

def _dir_entry(abs_path: str, root: str) -> dict:
    name = os.path.basename(abs_path)
    relative = os.path.relpath(abs_path, root)
    is_dir = os.path.isdir(abs_path)
    entry = {"name": name, "path": abs_path, "relative": relative, "is_dir": is_dir}
    return entry


@app.route("/api/folder/tree", methods=["GET"])
def folder_tree():
    path = request.args.get("path", "").strip()
    root = request.args.get("root", path).strip()
    if not path or not os.path.isdir(path):
        return jsonify({"error": "目录不存在"}), 400

    try:
        entries = sorted(os.listdir(path), key=lambda x: (not os.path.isdir(os.path.join(path, x)), x.lower()))
    except PermissionError:
        return jsonify({"error": "无权访问该目录"}), 403

    children = [_dir_entry(os.path.join(path, e), root) for e in entries]
    return jsonify(children)


# ── Prompts ────────────────────────────────────────────────────────────────────

@app.route("/api/project/<name>/prompt", methods=["POST"])
def save_prompt(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify({"error": "项目不存在"}), 404

    data = request.get_json(force=True)
    entry = {
        "goal":         data.get("goal", ""),
        "inputs":       data.get("inputs", []),
        "outputs":      data.get("outputs", []),
        "steps":        data.get("steps", []),
        "notes":        data.get("notes", ""),
        "sticky_notes": data.get("sticky_notes", ""),
        "created_at":   datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }

    prompts_path = os.path.join(project_dir, "prompts.yaml")
    doc = _load_yaml(prompts_path)
    if "prompts" not in doc:
        doc["prompts"] = []
    doc["prompts"].append(entry)
    _save_yaml(prompts_path, doc)

    return jsonify({"index": len(doc["prompts"])}), 201


if __name__ == "__main__":
    app.run(debug=True, port=2333)
