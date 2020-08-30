from flask import Blueprint, request

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
    with open("auth/password.txt", "r") as f:
        password = f.read().strip()
    # Check password (hashing is for losers)
    if password_request != password:
        return {
            "status": 400,
            "error": "Invalid password"
        }, 400
    # Get auth token from file
    with open("auth/token.txt", "r") as f:
        token = f.read()
    return {
        "status": 200,
        "token": token
    }, 200
