"""
    API wrapper for "top" command
"""
import subprocess as sp
from flask import Blueprint
import re

# Setup module
top_module = Blueprint("top_module", __name__)

# Parser regex
TOP_PARSER_REGEX = re.compile(r"""
    ^\s*            # Whitespace at start
    (\d+)\s+        # PID
    ([^\s]+)\s+     # User
    (\d+)\s+        # PR (Process Priority)
    (\d+)\s+        # NI (Nice value)
    (\d+)\s+        # VIRT (Virtual memory)
    (\d+)\s+        # RES (Resident memory)
    (\d+)\s+        # SHR (Shared memory)
    ([DRSTZI])\s+    # S (Process status)
    ([0-9\.]+)\s+   # CPU %
    ([0-9\.]+)\s+   # Memory %
    ([^\s]+)\s+     # Time (Total CPU time used in hundreths of a second)
    (.+)$           # Command
""", re.MULTILINE | re.VERBOSE)

# Top process status mapping
TOP_STATUS_MAPPING = {
    "D": "Uninteruptible sleep",
    "R": "Running",
    "S": "Sleeping",
    "T": "Stopped",
    "t": "Stopped by debugger",
    "Z": "Zombie",
    "I": "Idle"
}


def parse_top():
    command = ["top", "-b", "-n", "1", "-o", "-PID"]
    output = sp.check_output(command, stderr=sp.STDOUT).decode()
    parsed_output = re.findall(TOP_PARSER_REGEX, output)
    results = []
    for process in parsed_output:
        parsed_process = {}
        parsed_process["pid"] = int(process[0])
        parsed_process["user"] = process[1]
        parsed_process["priority"] = int(process[2])
        parsed_process["nice_value"] = int(process[3])
        parsed_process["memory"] = {
            "virtual": int(process[4]),
            "resident": int(process[5]),
            "shared": int(process[6])
        }
        parsed_process["status"] = TOP_STATUS_MAPPING[process[7]]
        parsed_process["cpu"] = float(process[8])
        parsed_process["memory"] = float(process[9])
        parsed_process["time"] = process[10]
        parsed_process["command"] = process[11]
        results.append(parsed_process)
    return results


@top_module.route("/top", methods=["GET"])
def getTop():
    return {
        "status": 200,
        "results": parse_top()
    }, 200
