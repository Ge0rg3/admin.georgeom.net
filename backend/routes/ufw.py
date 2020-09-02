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
    ^                             # Start of line
    \[\s*(\d+)\]\s+               # Rule number
    ([^\s]+(?:\s\(v6\))?)\s+      # To column
    (\w+\s\w+)\s+                 # Action column
    ([^\s]+(?:\s\(v6\))?)         # From column
    (?:\s+\#\s(.+))?              # Comment column
    $                             # End of line
""", re.MULTILINE | re.VERBOSE)


@ufw_module.route("/ufw/rules")
def getRules():
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
            "action": output[2],
            "comment": output[4]
        })
    return {
        "status": 200,
        "enabled": active,
        "results": rules
    }
