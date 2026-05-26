import os
import re
import subprocess
import yaml
from datetime import datetime
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

__version__ = "0.1.0"

REPO_DIR   = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR   = os.path.join(REPO_DIR, "data")
ETC_CONFIG = os.path.join(REPO_DIR, "etc", "config.yaml")


def _project_dir(name: str) -> str:
    return os.path.join(DATA_DIR, name)


def _load_yaml(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _save_yaml(path: str, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)


def _err(code: str, detail: str = "") -> dict:
    return {"code": code, "detail": detail}


# ── Pages ──────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


# ── Projects ───────────────────────────────────────────────────────────────────

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
        return jsonify(_err("EMPTY_NAME")), 400

    project_dir = _project_dir(name)
    if os.path.exists(project_dir):
        return jsonify(_err("PROJECT_EXISTS")), 409

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
        return jsonify(_err("PROJECT_NOT_FOUND")), 404
    return jsonify(_load_yaml(config_path))


@app.route("/api/project/<name>/config/folder", methods=["POST"])
def add_work_folder(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify(_err("PROJECT_NOT_FOUND")), 404

    data = request.get_json(force=True)
    folder = (data.get("path") or "").strip()
    if not folder:
        return jsonify(_err("EMPTY_PATH")), 400
    if not os.path.isdir(folder):
        return jsonify(_err("DIR_NOT_FOUND")), 400

    config_path = os.path.join(project_dir, "config.yaml")
    config = _load_yaml(config_path)
    folders = config.get("work_folders") or []
    if folder in folders:
        return jsonify(_err("DIR_ALREADY_ADDED")), 409
    folders.append(folder)
    config["work_folders"] = folders
    _save_yaml(config_path, config)

    return jsonify({"path": folder}), 201


@app.route("/api/project/<name>/config/folder", methods=["DELETE"])
def remove_work_folder(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify(_err("PROJECT_NOT_FOUND")), 404

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
    return {"name": name, "path": abs_path, "relative": relative, "is_dir": is_dir}


@app.route("/api/folder/tree", methods=["GET"])
def folder_tree():
    path = request.args.get("path", "").strip()
    root = request.args.get("root", path).strip()
    if not path or not os.path.isdir(path):
        return jsonify(_err("DIR_NOT_FOUND")), 400

    try:
        entries = sorted(
            os.listdir(path),
            key=lambda x: (not os.path.isdir(os.path.join(path, x)), x.lower())
        )
    except PermissionError:
        return jsonify(_err("DIR_NO_PERMISSION")), 403

    return jsonify([_dir_entry(os.path.join(path, e), root) for e in entries])


# ── Prompts ────────────────────────────────────────────────────────────────────

@app.route("/api/project/<name>/prompt", methods=["POST"])
def save_prompt(name):
    project_dir = _project_dir(name)
    if not os.path.exists(project_dir):
        return jsonify(_err("PROJECT_NOT_FOUND")), 404

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


# ── Settings ───────────────────────────────────────────────────────────────────

@app.route("/api/settings", methods=["GET"])
def get_settings():
    cfg = _load_yaml(ETC_CONFIG) if os.path.exists(ETC_CONFIG) else {}
    return jsonify({"git_repo": cfg.get("git_repo", "")})


@app.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.get_json(force=True)
    cfg = _load_yaml(ETC_CONFIG) if os.path.exists(ETC_CONFIG) else {}
    cfg["git_repo"] = (data.get("git_repo") or "").strip()
    _save_yaml(ETC_CONFIG, cfg)
    return jsonify({"ok": True})


# ── Git operations ─────────────────────────────────────────────────────────────

def _git(args: list, cwd: str) -> tuple[bool, str]:
    result = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True)
    return result.returncode == 0, (result.stdout + result.stderr).strip()


@app.route("/api/git/status", methods=["GET"])
def git_status():
    cfg = _load_yaml(ETC_CONFIG) if os.path.exists(ETC_CONFIG) else {}
    repo = cfg.get("git_repo", "").strip()
    if not repo:
        return jsonify({"configured": False})
    data_dir = os.path.abspath(DATA_DIR)
    is_repo = os.path.isdir(os.path.join(data_dir, ".git"))
    return jsonify({"configured": True, "repo": repo, "initialized": is_repo})


@app.route("/api/git/init", methods=["POST"])
def git_init():
    cfg = _load_yaml(ETC_CONFIG) if os.path.exists(ETC_CONFIG) else {}
    repo = cfg.get("git_repo", "").strip()
    if not repo:
        return jsonify(_err("GIT_NOT_CONFIGURED")), 400

    data_dir = os.path.abspath(DATA_DIR)
    os.makedirs(data_dir, exist_ok=True)

    if not os.path.isdir(os.path.join(data_dir, ".git")):
        ok, out = _git(["init", "-b", "main"], data_dir)
        if not ok:
            ok, out = _git(["init"], data_dir)
            if not ok:
                return jsonify(_err("GIT_INIT_FAILED", out)), 500
            _git(["checkout", "-b", "main"], data_dir)
    else:
        _git(["checkout", "-B", "main"], data_dir)

    _git(["remote", "remove", "origin"], data_dir)
    ok, out = _git(["remote", "add", "origin", repo], data_dir)
    if not ok:
        return jsonify(_err("GIT_REMOTE_FAILED", out)), 500

    _git(["fetch", "origin"], data_dir)

    return jsonify({"ok": True})


@app.route("/api/git/sync", methods=["POST"])
def git_sync():
    cfg = _load_yaml(ETC_CONFIG) if os.path.exists(ETC_CONFIG) else {}
    repo = cfg.get("git_repo", "").strip()
    if not repo:
        return jsonify(_err("GIT_NOT_CONFIGURED")), 400

    data_dir = os.path.abspath(DATA_DIR)
    if not os.path.isdir(os.path.join(data_dir, ".git")):
        return jsonify(_err("GIT_NOT_INITIALIZED")), 400

    _git(["add", "-A"], data_dir)

    has_staged, _ = _git(["diff", "--cached", "--quiet"], data_dir)
    has_commits, _ = _git(["rev-parse", "HEAD"], data_dir)
    if not has_staged or not has_commits:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        _git(["commit", "--allow-empty", "-m", f"sync {ts}"], data_dir)

    _, remote_refs = _git(["ls-remote", "--heads", "origin", "main"], data_dir)
    if "refs/heads/main" in remote_refs:
        ok, out = _git(["pull", "--rebase", "origin", "main"], data_dir)
        if not ok:
            _git(["rebase", "--abort"], data_dir)
            return jsonify(_err("GIT_PULL_CONFLICT", out)), 409

    ok, out = _git(["push", "-u", "origin", "main"], data_dir)
    if not ok:
        return jsonify(_err("GIT_PUSH_FAILED", out)), 500

    return jsonify({"ok": True})


# ── App update ────────────────────────────────────────────────────────────────

@app.route("/api/version", methods=["GET"])
def get_version():
    return jsonify({"version": __version__})


@app.route("/api/update", methods=["POST"])
def do_update():
    local_ver = __version__

    try:
        result = subprocess.run(
            ["git", "pull", "origin", "main"],
            cwd=REPO_DIR,
            capture_output=True,
            text=True,
            timeout=30,
        )
        output = (result.stdout + result.stderr).strip()
        already_latest = "Already up to date." in output
        updated = not already_latest and result.returncode == 0

        remote_ver = local_ver
        try:
            app_path = os.path.join(REPO_DIR, "src", "app.py")
            with open(app_path, encoding="utf-8") as f:
                content = f.read()
            m = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
            if m:
                remote_ver = m.group(1)
        except Exception:
            pass

        return jsonify({
            "success": result.returncode == 0,
            "updated": updated,
            "local_version": local_ver,
            "remote_version": remote_ver,
            "output": output,
        })
    except subprocess.TimeoutExpired:
        return jsonify(_err("UPDATE_TIMEOUT")), 500
    except Exception as e:
        return jsonify({"code": "UPDATE_ERROR", "detail": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=2333)
