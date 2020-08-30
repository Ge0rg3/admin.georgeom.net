import os
from binascii import hexlify
from string import ascii_uppercase, digits
from flask import Flask, request, send_from_directory
from flask_cors import CORS

# Route imports
from routes.ls import ls_module
from routes.status import status_module
from routes.login import login_module
from routes.top import top_module
from routes.sar import sar_module

# Setup flask app
APP_ROOT = "/api"
app = Flask(__name__, template_folder="views", static_folder="views/static")
app.config["APPLICATION_ROOT"] = APP_ROOT
CORS(app)
SCRIPT_FILEPATH = os.path.dirname(os.path.realpath(__file__))

# Check password exists, and create if not
try:
    f = open(SCRIPT_FILEPATH + "/auth/password.txt", "r")
    f.close()
except FileNotFoundError:
    password = input("Enter password: ")
    with open(SCRIPT_FILEPATH + "/auth/password.txt", "w") as f:
        f.write(password)
# Generate auth token
size = 50
auth_token = hexlify(os.urandom(100)).decode()
with open(SCRIPT_FILEPATH + "/auth/token.txt", "w") as f:
    f.write(auth_token)

# Add routes
app.register_blueprint(ls_module, url_prefix=APP_ROOT)
app.register_blueprint(status_module, url_prefix=APP_ROOT)
app.register_blueprint(login_module, url_prefix=APP_ROOT)
app.register_blueprint(top_module, url_prefix=APP_ROOT)
app.register_blueprint(sar_module, url_prefix=APP_ROOT)


# Serve frontend & check auth on backend
@app.before_request
def before_request():
    print(request.path)
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
    if token_header != auth_token:
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
