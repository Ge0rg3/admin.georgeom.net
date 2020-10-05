from flask import Blueprint, request
from variables import HOME_FILEPATH
import subprocess as sp


def generate_auth_module(permissions, auth_tokens):

    # Setup module
    auth_module = Blueprint('auth_module', __name__)

    @auth_module.route("/login", methods=["POST"])
    def login():
        # Get provided token
        req = request.json
        try:
            accesskey_input = req["accesskey"]
        except KeyError:
            return {
                "status": 400,
                "error": "Missing required parameter 'accesskey'."
            }

        # Check that access key is valid
        valid_keys = [p["accesskey"] for p in permissions]
        if accesskey_input not in valid_keys:
            return {
                "status": 400,
                "error": "Invalid access key."
            }

        # Assign token
        permission = [
            p for p in permissions if p["accesskey"] == accesskey_input
        ][0]
        auth_token = [
            tok for tok in auth_tokens if tok["name"] == permission["name"]
        ][0]["token"]

        # Send login notification on telegram
        try:
            # In prod, we have Cf-Connecting-Ip connections from 127.0.0.1
            user_ip = request.headers.get("Cf-Connecting-Ip", "")
            if user_ip == "" or request.remote_addr != "127.0.0.1":
                # Otherwise use direct IP
                user_ip = request.remote_addr
            # Send message
            message = "admin.georgeom.net login to account "
            message += f"'*{permission['name']}*' from '*{user_ip}*'."
            sp.check_output(["telegram-send", "--format", "markdown", message])
        except sp.SubprocessError:
            print("Could not send telegram message. " +
                  "Please ensure telegram-send is correctly configured."
                  )

        # Return details to user
        return {
            "status": 200,
            "token": auth_token,
            "permission": permission["name"],
            "paths": permission["paths"]
        }

    return auth_module
