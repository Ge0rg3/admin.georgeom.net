from os import urandom
from binascii import hexlify
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from variables import HOME_FILEPATH, PERMISSIONS

# Route imports
from routes.login import generate_login_module
from routes.ls import ls_module
from routes.services import services_module
from routes.top import top_module
from routes.sar import sar_module
from routes.ufw import ufw_module

# Setup flask app
APP_ROOT = "/api"
app = Flask(__name__, template_folder="views", static_folder="views/static")
app.config["APPLICATION_ROOT"] = APP_ROOT
CORS(app)

# Check password exists, and create if not
try:
    f = open(HOME_FILEPATH + "auth/password.txt", "r")
    f.close()
except FileNotFoundError:
    password = input("Enter password: ")
    with open(HOME_FILEPATH + "auth/password.txt", "w") as f:
        f.write(password)


# Generate tokens
def generate_token(size):
    return hexlify(urandom(size)).decode()


tokens = {permission: generate_token(100) for permission in PERMISSIONS}

# Add routes
app.register_blueprint(ls_module, url_prefix=APP_ROOT)
app.register_blueprint(services_module, url_prefix=APP_ROOT)
app.register_blueprint(generate_login_module(PERMISSIONS), url_prefix=APP_ROOT)
app.register_blueprint(top_module, url_prefix=APP_ROOT)
app.register_blueprint(sar_module, url_prefix=APP_ROOT)
app.register_blueprint(ufw_module, url_prefix=APP_ROOT)


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
    if request.path == "/api/login" or request.method == "OPTIONS":
        return
    # Otherwise, auth token required
    token_header = request.headers.get("Token") or ""
    if token_header != generate_token(100):
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
