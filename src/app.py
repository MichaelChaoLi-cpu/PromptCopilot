import os
import yaml
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

__version__ = "0.1.0"

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _project_dir(name: str) -> str:
    return os.path.join(DATA_DIR, name)


@app.route("/")
def index():
    return render_template("index.html")


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

    with open(os.path.join(project_dir, "config.yaml"), "w", encoding="utf-8") as f:
        yaml.dump({"sticky_notes": ""}, f, allow_unicode=True)

    with open(os.path.join(project_dir, "prompts.yaml"), "w", encoding="utf-8") as f:
        yaml.dump({"prompts": []}, f, allow_unicode=True)

    return jsonify({"name": name}), 201


if __name__ == "__main__":
    app.run(debug=True, port=2333)
