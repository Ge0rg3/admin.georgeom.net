"""
    API wrapper for "ls" command
"""
from flask import Blueprint, request
import subprocess as sp
import re

# Setup module
ls_module = Blueprint('ls_module', __name__)


# Parser for "ls -lA --full-time" commands
LS_HEADERS = ["permissions", "links", "owner", "group",
              "filesize", "date", "time", "entry", "symlink"]
LS_PARSER_REGEX = re.compile(r"""
    ^                       # Start of expression
    ([drwxtlsST!_\-]+)\s+   # File Permissions
    (\d+)\s+                # Number of links
    (\w+)\s+                # Owner
    (\w+)\s+                # Group
    (\d+)\s+                # Filesize
    ([\d-]+)\s+             # Date
    ([\d:]+)\s+             # Time
    ([^\s]+)                # Entry Name
    (?:\s+->\s+([^\s]+))?   # Symlink path
    $                       # End of expression
""", re.MULTILINE | re.VERBOSE)


# Returns a dictionary containing array of file metadata
def parse_ls(foldername):
    # Parse foldername
    if not foldername.endswith("/"):
        foldername += "/"
    # Get ls output
    command = ["ls", "-lA", "--time-style=long-iso", foldername]
    try:
        output = sp.check_output(command, stderr=sp.STDOUT).decode()
    except sp.CalledProcessError as e:
        output = e.output.decode().rstrip()
        error = ""
        if output.endswith("Permission denied"):
            error = "Folder permission denied."
        elif output.endswith("No such file or directory"):
            error = "Folder does not exist."
        elif "ls: cannot access" in output and len(output.split("\n")) == 1:
            error = "Path given is not a directory"
        else:
            error = "An unknown error occurred."
        if error != "":
            raise RuntimeError(error)
    ls_results = re.findall(LS_PARSER_REGEX, output)
    # Get real file/folder sizes with du
    command = ["du", "-ax", foldername, "-d", "1"]
    try:
        output = sp.check_output(command, stderr=sp.DEVNULL).decode()
    except sp.CalledProcessError as e:
        # du will return error code 1 if any permission denied exists.
        output = e.output.decode()[:-1]
    du_results = {}
    for result in output.strip().split("\n"):
        result = result.replace("\t", " ")
        filename = result.split("/")[-1]
        size = int(result.split(" ")[0])
        du_results[filename] = size
    # Turn to dicts
    ls_objects = []
    for result in ls_results:
        # Deal with entry type
        if result[0].startswith("d"):
            entry_type = "directory"
        elif result[0].startswith("l"):
            entry_type = "link"
        elif result[0].startswith("-"):
            entry_type = "file"
        elif result[0].startswith("s"):
            entry_type = "socket"
        else:
            entry_type = "unknown"
        ls_objects.append({
            "entry_type": entry_type,
            "permissions": result[0],
            "links": result[1],
            "owner": result[2],
            "group": result[3],
            "filesize": du_results.get(result[7], -1),
            "date": result[5],
            "time": result[6],
            "entry": result[7],
            "link": result[8]
        })
    return ls_objects


# Flask Route
@ls_module.route("/ls", methods=["GET"])
def checkFolder():
    # Get 'path' parameter
    route_name = request.args.get('path')
    if route_name is None:
        return {
            "status": 400,
            "message": "'path' parameter not specified."
        }, 400
    # Get results and handle errors
    try:
        results = parse_ls(route_name)
    except RuntimeError as err:
        return {
            "status": 400,
            "message": str(err)
        }
    # Return results
    return {
        "status": 200,
        "results": results
    }
