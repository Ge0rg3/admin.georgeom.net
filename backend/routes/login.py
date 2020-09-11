from flask import Blueprint, request
from variables import HOME_FILEPATH
import subprocess as sp

# Setup module
login_module = Blueprint('login_module', __name__)


@login_module.route("/login", methods=["POST"])
def login():
    # Get provided token
    req = request.json
    try:
        password_request = req["password"]
    except KeyError:
        return {
            "status": 400,
            "error": "Missing required parameter 'password'."
        }
    # Get password from file (yes, I know, don't say it.)
    with open(HOME_FILEPATH + "auth/password.txt", "r") as f:
        password = f.read().strip()
    # Check password (hashing is for losers)
    if password_request != password:
        return {
            "status": 400,
            "error": "Invalid password"
        }, 400
    # Get auth token from file
    with open(HOME_FILEPATH + "auth/token.txt", "r") as f:
        token = f.read()
    # Send login notification on telegram
    try:
        # In prod, we have Cf-Connecting-Ip connections from 127.0.0.1
        user_ip = request.headers.get("Cf-Connecting-Ip", "")
        if user_ip == "" or request.remote_addr != "127.0.0.1":
            # Otherwise use direct IP
            user_ip = request.remote_addr
        # Send message
        message = f"admin.georgeom.net login from '*{user_ip}*'."
        sp.check_output(["telegram-send", "--format", "markdown", message])
    except sp.SubprocessError:
        print("Could not send telegram message. " +
              "Please ensure telegram-send is correctly configured."
              )
    return {
        "status": 200,
        "token": token
    }, 200
