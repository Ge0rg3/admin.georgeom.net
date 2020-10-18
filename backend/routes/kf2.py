"""
    Allows a user to get current KF2 server settings, and change the gamemode
"""
import requests as rq 
import subprocess as sp
from flask import Blueprint, request
from variables import KF2_DIRECTORY, KF2_NGINX_PATH
from routes.services import check_local_port, changeCommonService

# Setup module
kf2_module = Blueprint("kf2_module", __name__)

# Helper func for opening files
def read_file(path):
    with open(path, "r") as f:
        return f.read()

# Helper func for getting request IP
def get_request_ip(req):
    ip = req.headers.get("Cf-Connecting-Ip", "")
    if ip == "" or req.remote_addr != "127.0.0.1":
        ip = req.remote_addr
    return ip

# Vars
if KF2_DIRECTORY[-1] != "/":
    KF2_DIRECTORY += "/"

kfgame_path = KF2_DIRECTORY + "serverfiles/KFGame/Config/kf2server/LinuxServer-KFGame.ini"

lgsm_config_path = KF2_DIRECTORY + "lgsm/config-lgsm/kf2server/common.cfg"

kf2_log_path = KF2_DIRECTORY + "serverfiles/KFGame/Logs/Launch.log"

maps = read_file(kfgame_path).split('GameMapCycles=(Maps=("')[1].upper().split('"))')[0].split('","')
maps.sort()

restart_server_command = 'sudo /usr/bin/su kf2server -c "/home/kf2server/kf2server restart"'

difficulties = {
    "Normal": 0,
    "Hard": 1,
    "Suicidal": 2,
    "Hell on Earth": 3
}

modes = {
    "Survival": "KFGameContent.KFGameInfo_Survival",
    "VS Survival": "KFGameContent.KFGameInfo_VersusSurvival",
    "Weekly": "KFGameContent.KFGameInfo_WeeklySurvival",
    "Endless": "KFGameContent.KFGameInfo_Endless",
    "Objective": "KFGameContent.KFGameInfo_Objective"
}

lengths = {
    "Short": 0,
    "Normal": 1,
    "Long": 2
}

wave_lengths = {
    4: "Short",
    7: "Normal",
    10: "Long"
}

# Check if server is up
def checkServerStatus():
    return check_local_port(7777)

# Change game in config file. Validate data here, otherwise it's free rce
def changeGameStartConfig(mode, difficulty, map_choice, game_length):
    map_choice = map_choice.upper()
    # Validate!
    if mode not in modes.keys():
        return "Invalid mode."
    elif difficulty not in difficulties.keys():
        return "Invalid difficulty."
    elif map_choice not in maps:
        return "Invalid map."
    elif game_length not in lengths.keys():
        return "Invalid game length."
    # Generate string
    launch_string = f"{map_choice}?Game={modes[mode]}?Difficulty={difficulties[difficulty]}?GameLength={game_length}"
    launch_string += "?Mutator=DamageDisplay.DmgMut?ConfigSubDir=kf2server -QueryPort=27015"
    new_line = f'\tparms="{launch_string}"'
    # Insert into file
    new_config = []
    config = read_file(lgsm_config_path).split("\n")
    for line in config:
        if line.startswith("\tparms="):
            new_config.append(new_line)
        else:
            new_config.append(line)
    new_config_text = "\n".join(new_config)
    with open(lgsm_config_path, "w") as f:
        f.write(new_config_text)
    # Return success flag
    return "ok"

# Get details of ongoing game from launch log (idk where else to check it)
def getCurrentGame(previous=1):
    # Get advert broadcast from log
    log = read_file(kf2_log_path)
    adverts = log.split("Refreshing published game settings")
    recent_advert = adverts[-previous].split("\n")
    # Parse and find details
    current_game = {}
    for line in recent_advert:
        if "Map: " in line:
            current_game["map"] = line.split("Map: ")[1].split(", ")[0]
        if "Game: " in line:
            current_game["mode"] = line.split("Game: ")[1]
        elif "OwningPlayerName=" in line:
            current_game["server"] = line.split("OwningPlayerName=")[1]
        elif "Difficulty=" in line:
            current_game["difficulty"] = line.split("Difficulty=")[1]
        elif "NumWaves=" in line:
            current_game["length"] = line.split("NumWaves=")[1]
        elif "CurrentWave=" in line:
            current_game["current_wave"] = int(line.split("CurrentWave=")[1])
    # Turn mode complex string to simple string (i.e KFGameContent.KFGameInfo_Survival -> Survival)
    mode_index = list(modes.values()).index("KFGameContent." + current_game["mode"])
    current_game["mode"] = list(modes.keys())[mode_index]
    # Turn difficulty integer into difficulty string (i.e. Normal -> 0)
    current_game["difficulty"] = list(difficulties.keys())[int(current_game["difficulty"])]
    # Turn number of waves into wave length string (i.e. 4 -> Short
    game_length = int(current_game["length"])
    if game_length == 254:
        current_game["length"] = "Endless (254 waves)"
    elif game_length == 0:
        current_game["length"] = "N/A"
    else:
        current_game["length"] = wave_lengths[int(current_game["length"])]
    # Return details
    return current_game


# Parse whitelist file to get current whitelist
def getCurrentWhitelist():
    kf2_nginx = read_file(KF2_NGINX_PATH).strip().split("\n")[2:-1]
    ips = []
    for line in kf2_nginx:
        ips.append(line.split("\t")[1])
    return ips

# Write an array of IPs to whitelist file
def writeIpsToWhitelist(ips):
    lines = ["map $http_cf_connecting_ip $kf2_allowed {", "\tdefault\t0;"]
    for ip in ips:
        lines.append("\t" + ip + "\t1;")
    lines.append("}")
    # Likely do not have permission to write directly to nginx config files
    # ... so we write to a /tmp file and copy it over
    with open("/tmp/kf2-nginx.conf", "w") as f:
        f.write("\n".join(lines))
    sp.check_output(["bash", "-c", f"sudo cp /tmp/kf2-nginx.conf {KF2_NGINX_PATH}"])
    try:
        sp.check_output(["bash", "-c", "sudo /etc/init.d/nginx reload"])
        return True
    except:
        return False

# Remove IP from nginx config
def removeIpFromWhitelist(del_ip):
    ips = [ip for ip in getCurrentWhitelist() if ip != del_ip]
    writeIpsToWhitelist(ips)

# Add a new IP to the whitelist
def addIpToWhitelist(ip):
    ips = getCurrentWhitelist()
    if ip not in ips:
        ips.append(ip)
    success = writeIpsToWhitelist(ips)
    if success:
        return True
    else:
        removeIpFromWhitelist(ip)
        return False

# Flask routes
@kf2_module.route("/kf2/status", methods=["GET"])
def getKf2Status():
    # Get game data. First get most recent, but if cut off early, get second-most recent.
    # If still not working, show default as error.
    try:
        try:
            data = getCurrentGame(1)
        except:
            data = getCurrentGame(2)
    except:
        # Game probably restarting, if not then fuck
        data = {
            "server": "Restarting... Default shown.",
            "length": "Short",
            "difficulty": "Suicidal",
            "mode": "Survival",
            "map": "KF-CATACOMBS",
            "current_wave": "1"
            }
    server_status = checkServerStatus()
    return {
        "status": 200,
        "serverstatus": "on" if server_status else "off",
        "currentgame": data,
        "maps": maps,
        "modes": list(modes.keys()),
        "difficulties": list(difficulties.keys()),
        "lengths": list(lengths.keys())
    }, 200

@kf2_module.route("/kf2/change", methods=["POST"])
def changeKf2Game():
    # Validate inputs
    req = request.json
    for inp in ["map", "mode", "difficulty", "length"]:
        if inp not in req.keys():
            return {
                "status": 400,
                "error": f"Missing required parameter '{inp}'."
            }, 400
    # Edit file
    message = changeGameStartConfig(req["mode"], req["difficulty"], req["map"], req["length"])
    if message != "ok":
        return {
            "status": 400,
            "error": message
        }
    # Restart server
    else:
        try:
            sp.check_output(["bash", "-c", restart_server_command])
            return {
                "status": 200
            }
        except sp.SubprocessError:
            return {
                "status": 500,
                "error": "Config changed, but server could not be restarted at this time."
            }, 500

# Disable KF2
@kf2_module.route("/kf2/disable", methods=["GET"])
def disableKf2Server():
    if checkServerStatus():
        return changeCommonService("stop", "kf2-game")

# Enable KF2
@kf2_module.route("/kf2/enable", methods=["GET"])
def enableKf2Server():
    if not checkServerStatus():
        return changeCommonService("start", "kf2-game")


@kf2_module.route("/kf2/whitelist")
def getWhitelistRoute():
    ips = getCurrentWhitelist()
    return {
        "status": 200,
        "user_ip": get_request_ip(request),
        "ips": ips
    }, 200

@kf2_module.route("/kf2/whitelist/add", methods=["POST"])
def addWhitelistRoute():
    # Validate
    req = request.json
    if "ip" not in req.keys():
        return {
            "status": 400,
            "error": "Missing required parameter 'ip'."
        }, 400
    ip = req["ip"]
    # Allow "me" to add user IP
    if ip == "me":
        ip = get_request_ip(request)
    # Check ip contains ipv4/ipv6 chars
    is_ip = True
    for char in ip:
        if char not in "0123456789abcdef:.":
            is_ip = False
    if not is_ip:
        return {
            "status": 400,
            "error": "Invalid IP."
        }, 400
    # Add
    success = addIpToWhitelist(ip)
    if success:
        return {
            "status": 200,
        }, 200
    else:
        return {
            "status": 400,
            "error": "Invalid IP."
        }

@kf2_module.route("/kf2/whitelist/remove", methods=["POST"])
def removeWhitelistRoute():
    # Validate
    req = request.json
    if "ip" not in req.keys():
        return {
            "status": 400,
            "error": "Missing required parameter 'ip'."
        }, 400
    ip = req["ip"]
    # Remove
    removeIpFromWhitelist(ip)
    return {
        "status": 200
    }, 200
