"""
    View and change the status of server services.
"""
from flask import Blueprint
import subprocess as sp
import requests as rq
import socket
import re

# Setup module
services_module = Blueprint('services_module', __name__)
# Port regex
PORT_REGEX = re.compile(r"(?:\d+\.\d+\.\d+\.\d+:)(\d+)")
# Server public IP address
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
PUBLIC_SERVER_IP = s.getsockname()[0]
s.close()


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


# Check that the firewall is enabled
def check_firewall():
    output = sp.check_output(["sudo", "ufw", "status"]).decode()
    status_line = output.split("\n")[0]
    return "inactive" not in status_line


RM = "/usr/bin/rm"
LN = "/usr/bin/ln"
SU = "/usr/bin/su"
RESTART_NGINX = "sudo /usr/sbin/nginx -s reload"
SITES_AVAILABLE = "/etc/nginx/sites-available/"
SITES_ENABLED = "/etc/nginx/sites-enabled/"

COMMON_SERVICES = [
    {
        "id": "website",
        "name": "Website",
        "description": "The https://georgeom.net homepage.",
        "status_mapping": [check_website, ["https://georgeom.net"]],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}georgeom.net.conf",
                     RESTART_NGINX],
            "start": [f"sudo {LN} -s {SITES_AVAILABLE}" +
                      f"georgeom.net.conf {SITES_ENABLED}georgeom.net.conf",
                      RESTART_NGINX],
            "restart": []
        }
    },
    {
        "id": "firewall",
        "name": "Firewall",
        "description": "Server UFW (Ubuntu Firewall), configurable " +
                       "in the Firewall page.",
        "status_mapping": [check_firewall, []],
        "commands": {
            "stop": ["sudo ufw disable"],
            "start": ["sudo ufw enable"],
            "restart": ["sudo ufw reload"]
        }
    },
    {
        "id": "kf2-admin",
        "name": "KF2 Admin",
        "description": "The https://kf2.georgeom.net admin portal.",
        "status_mapping": [check_website, ["https://kf2.georgeom.net"]],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}kf2.conf", RESTART_NGINX],
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
        "status_mapping": [check_local_port, [7777]],
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
        "status_mapping": [check_remote_port, [PUBLIC_SERVER_IP, 25565]],
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
        "status_mapping": [check_website, ["https://cloud.georgeom.net"]],
        "commands": {
            "stop": [f"sudo {RM} {SITES_ENABLED}nextcloud.conf",
                     RESTART_NGINX],
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
                "https://stegonline.georgeom.net.",
        "status_mapping": [check_website, ["https://stegonline.georgeom.net"]],
        "commands": {
            "stop": [f"sudo {RM} " +
                     f"{SITES_ENABLED}stegonline.conf", RESTART_NGINX],
            "start": [f"sudo /usr/bin/ln -s {SITES_AVAILABLE}" +
                      f"stegonline.conf {SITES_ENABLED}stegonline.conf",
                      RESTART_NGINX],
            "restart": []
        }
    },
    {
        "id": "ssh",
        "name": "SSH",
        "description": "Allows remote SSH connections to the server.",
        "status_mapping": [check_remote_port, [PUBLIC_SERVER_IP, 22]],
        "commands": {
            "stop": ["sudo /usr/sbin/service ssh stop"],
            "start": ["sudo /usr/sbin/service ssh start"],
            "restart": ["sudo /usr/sbin/service ssh restart"]
        }
    },
    {
        "id": "mobsf",
        "name": "MobSF",
        "description": "Mobile Security Framework (MobSF).",
        "status_mapping": [check_website, ["https://mobsf.georgeom.net"]],
        "commands": {
            "stop": ['pkill -SIGINT -f "/var/www/mobsf/venv/bin/python3 /var/www/mobsf/venv/bin/gunicorn -b 127.0.0.1:4444 MobSF.wsgi:application --workers=1 --threads=10 --timeout=1"'],
            "start": ["sudo bash /home/george/start_mobsf.sh"],
            "restart": []
        }
    }
]


# Return all system services as a dict
def get_system_services():
    # Get command output
    command = ["/usr/sbin/service", "--status-all"]
    output = sp.check_output(command, stderr=sp.STDOUT).decode().strip()
    # Parse output to dict
    services = []
    for line in output.split("\n"):
        line = line.strip()
        status_symbol, service = line.split(" ]  ")
        status_symbol = status_symbol[-1]
        if status_symbol == "+":
            status = "on"
        elif status_symbol == "-":
            status = "off"
        else:
            status = "unknown"
        services.append({
            "type": "system",
            "name": service,
            "id": service,
            "status": status,
            "description": "",
            "startable": status != "unknown",
            "stoppable": status != "unknown",
            "restartable": status != "unknown"
        })
    return services


# Return all common services as dicts
def get_common_services():
    service_dicts = []
    for service in COMMON_SERVICES:
        status_map = service["status_mapping"]
        status_bool = status_map[0](*(status_map[1]))
        if status_bool:
            status = "on"
        else:
            status = "off"
        service_dicts.append({
            "type": "common",
            "id": service["id"],
            "name": service["name"],
            "description": service["description"],
            "status": status,
            "startable": service["commands"]["start"] != [],
            "stoppable": service["commands"]["stop"] != [],
            "restartable": service["commands"]["restart"] != []
        })
    return service_dicts


# Get all statuses
@services_module.route("/services/all", methods=["GET"])
def getAllServices():
    common = get_common_services()
    system = get_system_services()
    return {
        "status": 200,
        "results": common + system
    }


# Get common statuses
@services_module.route("/services/common", methods=["GET"])
def getCommonServices():
    return {
        "status": 200,
        "results": get_common_services()
    }, 200


# Stop/start/restart a common service
@services_module.route("/services/common/<action>/<service_id>")
def changeCommonService(action, service_id):
    if action not in ["start", "stop", "restart"]:
        return {
            "status": 400,
            "error": "Action must be start/stop/restart."
        }, 400
    # Get service commands
    for service in COMMON_SERVICES:
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


# Get all system services
@services_module.route("/services/system")
def getSystemServices():
    return {
        "status": 200,
        "results": get_system_services()
    }


# Start/stop/restart a system service
@services_module.route("/services/system/<action>/<service_id>")
def changeSystemService(action, service_id):
    # Validate action
    if action not in ["start", "stop", "restart"]:
        return {
            "status": 400,
            "error": "Action must be start/stop/restart."
        }, 400
    # Validate service_id
    service_ids = [service["id"] for service in get_system_services()]
    if service_id not in service_ids:
        return {
            "status": 400,
            "error": "Invalid service id."
        }, 400
    # Execute command
    command = ["sudo", "service", service_id, action]
    try:
        sp.check_output(command)
    except sp.CalledProcessError as e:
        return {
            "status": 500,
            "error": f"Could not {action} service.",
            "output": e.output
        }
    return {
        "status": 200
    }, 200
