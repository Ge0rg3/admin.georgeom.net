"""
    API wrapper for "sar" command

    Note: This is *actually* a warpper for sadf (which is a sar parser), but
    since it uses sar under-the-hood we just wrap around it instead.
"""
import subprocess as sp
from flask import Blueprint
from json import loads as unjsonify

sar_module = Blueprint("sar_module", __name__)


def parse_sar():
    command = ["sadf", "-j"]
    output = sp.check_output(command, stderr=sp.STDOUT).decode()
    # Temp output
    with open("/mnt/c/Users/george/Desktop/sarfile.txt", "r") as f:
        output = f.read()
    # End of temp output
    logs = unjsonify(output)["sysstat"]["hosts"][0]["statistics"]
    results = []
    for log in logs:
        result = {}
        result["timestamp"] = log["timestamp"]["time"]
        result["cpu-usage"] = {
            "user": log["cpu-load"][0]["user"],
            "system": log["cpu-load"][0]["system"]
        }
        results.append(result)
    return results


@sar_module.route("/sar", methods=["GET"])
def get_sar_results():
    results = parse_sar()
    return {
        "status": 200,
        "results": results
    }, 200
