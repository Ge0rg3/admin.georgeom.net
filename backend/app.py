from os import urandom
from binascii import hexlify
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from variables import HOME_FILEPATH, PERMISSIONS

# CONFIG
KF2_ENABLED = True

# Route imports
from routes.auth import generate_auth_module
from routes.ls import ls_module
from routes.services import services_module
from routes.top import top_module
from routes.sar import sar_module
from routes.ufw import ufw_module
if KF2_ENABLED:
    from routes.kf2 import kf2_module

# Setup flask app
APP_ROOT = "/api"
app = Flask(__name__, template_folder="views", static_folder="views/static")
app.config["APPLICATION_ROOT"] = APP_ROOT
CORS(app)


# Generate tokens
def generate_token(size):
    return hexlify(urandom(size)).decode()


ACCESS_TOKENS = [
    {
        "name": permission["name"],
        "token": generate_token(100)
     } for permission in PERMISSIONS
]

# Api endpoints that work without any auth
permitted_paths = ["/api/login", "/api"]

# Add routes
app.register_blueprint(ls_module, url_prefix=APP_ROOT)
app.register_blueprint(services_module, url_prefix=APP_ROOT)
app.register_blueprint(generate_auth_module(PERMISSIONS, ACCESS_TOKENS),
                       url_prefix=APP_ROOT)
app.register_blueprint(top_module, url_prefix=APP_ROOT)
app.register_blueprint(sar_module, url_prefix=APP_ROOT)
app.register_blueprint(ufw_module, url_prefix=APP_ROOT)
if KF2_ENABLED:
    app.register_blueprint(kf2_module, url_prefix=APP_ROOT)


# Serve frontend & check auth on backend
@app.before_request
def before_request():
    """
    Serve frontend
    """

    if not request.path.startswith("/api"):
        # If in assets folder, return ilfe
        if request.path.startswith("/assets/"):
            return send_from_directory("./views/assets", request.path[8:])
        # Otherwise, let angular handle routing
        else:
            return send_from_directory("./views/", "index.html")
    """
    Authenticate API requests
    """
    # If attempting to login, continue
    if request.path in permitted_paths or request.method == "OPTIONS":
        return
    # Otherwise, auth token required
    token_header = request.headers.get("Token") or ""
    authorized = False
    valid_permissions = [
        p for p in ACCESS_TOKENS if p["token"] == token_header
    ]
    if len(valid_permissions) == 1:
        permission_name = valid_permissions[0]["name"]
        permission_object = [
            p for p in PERMISSIONS if p["name"] == permission_name
        ][0]
        for path in permission_object["paths"]:
            if request.path.startswith(path):
                authorized = True

    if not authorized:
        return {
            "status": 401,
            "error": "Invalid auth token"
        }, 401


# Catch errors
@app.errorhandler(400)
def invalid_request(e):
    return {
        "status": 400,
        "error": "Invalid request."
    }, 400


@app.errorhandler(404)
def route_not_found(e):
    return {
        "status": 404,
        "error": "Route not found."
    }, 404


# Endpoint to check if API running
@app.route('/api')
def api():
    return {"status": 200}, 200


# Run app
if __name__ == "__main__":
    app.run(host="0.0.0.0")
