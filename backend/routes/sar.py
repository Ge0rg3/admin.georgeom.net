"""
    API wrapper for "sar" command

    Note: This is *actually* a warpper for sadf (which is a sar parser), but
    since it uses sar under-the-hood we just wrap around it instead.
"""
import subprocess as sp
from variables import IS_DEV, HOME_FILEPATH
from flask import Blueprint
from json import loads as unjsonify
from os import path

sar_module = Blueprint("sar_module", __name__)


def parse_sar():
    # Get command output
    command = ["sadf", "-j"]
    try:
        output = sp.check_output(command, stderr=sp.STDOUT).decode()
    except sp.CalledProcessError:
        # If errored, check if in dev environment and load test data if so.
        # We only do this check if sadf fails, as some dev envs may include
        # sadf & we do not want the slow dev check every time.
        if IS_DEV:
            with open(HOME_FILEPATH + "dev_data/sadf.txt") as f:
                output = f.read()
    logs = unjsonify(output)["sysstat"]["hosts"][0]["statistics"]
    # Parse results
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
