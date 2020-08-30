"""
    View and change the status of server services.
"""
from flask import Blueprint
import subprocess as sp
import requests as rq
import socket
import re

# Setup module
status_module = Blueprint('status_module', __name__)
# Port regex
PORT_REGEX = re.compile(r"(?:\d+\.\d+\.\d+\.\d+:)(\d+)")


# Check that a port is up on any given IP
def check_remote_port(ip, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((ip, port))
    sock.close()
    return result == 0


# Check that port is up in netstat (useful for easy UDP checking)
def check_local_port(port):
    port = str(port)
    output = sp.check_output(["netstat", "-plunt"], stderr=sp.STDOUT).decode()
    port_results = re.findall(PORT_REGEX, output)
    return port in port_results


# Check that a remote website gives a response code of 200
def check_website(url):
    try:
        response = rq.get(url, timeout=2)
    except rq.exceptions.Timeout:
        return False
    except rq.exceptions.ConnectionError:
        return False
    return response.status_code == 200


RM = "/usr/bin/rm"
LN = "/usr/bin/ln"
SU = "/usr/bin/su"
RESTART_NGINX = "sudo /usr/sbin/service nginx restart"
SITES_AVAILABLE = "/etc/nginx/sites-available/"
SITES_ENABLED = "/etc/nginx/sites-enabled/"

SERVICES = [
    {
        "id": "website",
        "name": "Website",
        "description": "The https://georgeom.net homepage.",
        "status_mapping": [check_website, "https://georgeom.net"],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}nextcloud.conf"],
            "start": [f"sudo {LN} -s {SITES_AVAILABLE}" +
                      f"nextcloud.conf {SITES_ENABLED}nextcloud.conf",
                      RESTART_NGINX],
            "restart": []
        }
    },
    {
        "id": "kf2-admin",
        "name": "KF2 Admin",
        "description": "The https://kf2.georgeom.net admin portal.",
        "status_mapping": [check_website, "https://kf2.georgeom.net"],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}kf2.conf"],
            "start": [f"sudo {LN} -s {SITES_AVAILABLE}" +
                      f"kf2.conf {SITES_ENABLED}kf2.conf",
                      RESTART_NGINX],
            "restart": []
        }
    },
    {
        "id": "kf2-game",
        "name": "KF2 Game",
        "description": "KF2 gameserver at port 7777.",
        "status_mapping": [check_local_port, 7777],
        "commands": {
            "stop": [f"sudo {SU} - kf2server - " +
                     "/home/kf2server/kf2server stop"],
            "start": [f"sudo {SU} - kf2server - " +
                      "/home/kf2server/kf2server start"],
            "restart": [f"sudo {SU} - kf2server - " +
                        "/home/kf2server/kf2server restart"],
        }
    },
    {
        "id": "minecraft",
        "name": "Minecraft",
        "description": "Minecraft server at port 25565.",
        "status_mapping": [check_local_port, 25565],
        "commands": {
            "stop": [f"sudo {SU} - mcserver - " +
                     "/home/mcserver/mcserver stop"],
            "start": [f"sudo {SU} - mcserver - " +
                      "/home/mcserver/mcserver start"],
            "restart": [f"sudo {SU} - mcserver - " +
                        "/home/mcserver/mcserver restart"],
        }
    },
    {
        "id": "nextcloud",
        "name": "Nextcloud",
        "description": "Nextcloud instance hosted at " +
                "https://cloud.georgeom.net.",
        "status_mapping": [check_website, "https://cloud.georgeom.net"],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}nextcloud.conf"],
            "start": [f"sudo {LN} -s {SITES_AVAILABLE}" +
                      f"nextcloud.conf {SITES_ENABLED}nextcloud.conf",
                      RESTART_NGINX],
            "restart": []
        }
    },
    {
        "id": "stegonline",
        "name": "StegOnline",
        "description": "StegOnline static site hosted at " +
                "https://stegonline.georgeom.net. " +
                "Restart triggers nginx service restart.",
        "status_mapping": [check_website, "https://stegonline.georgeom.net"],
        "commands": {
            "stop": [f"sudo {RM} " +
                     f"{SITES_ENABLED}stegonline.conf"],
            "start": [f"sudo /usr/bin/ln -s {SITES_AVAILABLE}" +
                      f"stegonline.conf {SITES_ENABLED}stegonline.conf",
                      RESTART_NGINX],
            "restart": []
        }
    }
]


# Get statuses
@status_module.route("/status", methods=["GET"])
def checkStatus():
    service_dicts = []
    for service in SERVICES:
        status_map = service["status_mapping"]
        service_dicts.append({
            "id": service["id"],
            "name": service["name"],
            "description": service["description"],
            "status": status_map[0](status_map[1]),
            "can_restart": service["commands"]["restart"] != []
        })
    return {
        "status": 200,
        "results": service_dicts
    }, 200


# Stop/start/restart
@status_module.route("/status/<action>/<service_id>")
def stopService(action, service_id):
    if action not in ["start", "stop", "restart"]:
        return {
            "status": 400,
            "error": "Action must be start/stop/restart."
        }, 400
    # Get service commands
    for service in SERVICES:
        if service["id"] == service_id:
            commands = []
            for command in service["commands"][action]:
                commands.append(command.split(" "))
            break
    else:
        return {
            "status": 400,
            "error": "Unknown service id."
        }, 400
    # Run command (if exists)
    if len(commands) > 0:
        for command in commands:
            try:
                sp.check_output(command, stderr=sp.STDOUT)
            except sp.CalledProcessError as e:
                return {
                    "status": 500,
                    "error": f"Error when {action}ing service.",
                    "output": e.output
                }, 500
    return {
        "status": 200
    }, 200
