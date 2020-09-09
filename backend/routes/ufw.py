"""
    API wrapper for ufw (ubuntu firewall) services
"""
from flask import Blueprint, request
from variables import IS_DEV, HOME_FILEPATH
import subprocess as sp
import re

# Setup module
ufw_module = Blueprint("ufw_module", __name__)


# UFW regex
UFW_PARSER_REGEX = re.compile(r"""
    ^                                           # Start of line
    \[\s*(\d+)\]\s+                             # Rule number
    ([^\s]+(?:\s\(v6\))?(?:\son\s[^\s]+)?)\s+   # To column
    (\w+\s\w+)\s+                               # Policy column
    ([^\s]+(?:\s\(v6\))?(?:\son\s[^\s]+)?)      # From column
    (?:\s+\#\s(.+))?                            # Comment column
    $                                           # End of line
""", re.MULTILINE | re.VERBOSE)


@ufw_module.route("/ufw/rules")
def getRules():
    """
        Command for viewing all rules (including complex ones)
    """
    # Run command
    if IS_DEV:
        with open(HOME_FILEPATH + "dev_data/ufw.txt") as f:
            output = f.read()
    else:
        command = ["sudo", "ufw", "status", "numbered"]
        output = sp.check_output(command, stderr=sp.STDOUT).decode()
    # Check if active
    active_string = output.split("Status: ")[1].split("\n")[0]
    active = active_string == "active"
    # Get rules
    rules = []
    regex_output = re.findall(UFW_PARSER_REGEX, output)
    for output in regex_output:
        rules.append({
            "id": output[0],
            "to": output[1],
            "from": output[3],
            "policy": output[2],
            "comment": output[4]
        })
    return {
        "status": 200,
        "enabled": active,
        "results": rules
    }


@ufw_module.route("/ufw/add", methods=["POST"])
def addRule():
    """
        Endpoint for adding super simple firewall rules.
        Should only be used to lift an incoming port restriction.
    """
    # Get request JSON
    req = request.json
    for param in ["type", "port"]:
        if param not in req:
            return {
                "status": 400,
                "error": f"Missing parameter {param}."
            }, 400
    # Validate port
    port = req.get("port")
    if not isinstance(port, int):
        return {
            "status": 400,
            "error": "Invalid port."
        }, 400
    # Form command
    if req["type"] == "allow":
        rule_type = "allow"
    else:
        rule_type = "deny"
    command = ["sudo", "ufw", rule_type, str(port)]
    if req.get("comment"):
        command += ["comment", req["comment"]]
    # Execute command
    try:
        sp.check_output(command)
        return {
            "status": 200,
        }, 200
    except sp.SubprocessError:
        return {
            "status": 500,
            "error": "Rule could not be created"
        }, 500


@ufw_module.route("/ufw/delete/<rule_id>", methods=["GET"])
def deleteRule(rule_id):
    """
        Delete a rule from a given id
    """
    # Validate ruleid
    if not not isinstance(rule_id, int):
        return {
            "status": 400,
            "error": "Invalid rule id."
        }, 400
    # Execute command
    try:
        sp.check_output(["sudo", "ufw", "--force", "delete", str(rule_id)])
        return {
            "status": 200
        }, 200
    except sp.SubprocessError:
        return {
            "status": 500,
            "error": "Rule could not be deleted"
        }, 500


@ufw_module.route("/ufw/enable", methods=["GET"])
def enableFirewall():
    """
        Enable ufw
    """
    try:
        sp.check_output(["sudo", "ufw", "enable"]).decode()
        return {
            "status": 200
        }, 200
    except sp.SubprocessError:
        return {
            "status": 500,
            "error": "Could not enable firewall."
        }


@ufw_module.route("/ufw/disable", methods=["GET"])
def disableFirewall():
    """
        Disable ufw
    """
    try:
        sp.check_output(["sudo", "ufw", "disable"]).decode()
        return {
            "status": 200
        }, 200
    except sp.SubprocessError:
        return {
            "status": 500,
            "error": "Could not disable firewall."
        }
