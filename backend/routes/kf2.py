"""
    Allows a user to get current KF2 server settings, and change the gamemode
"""
import requests as rq 
import subprocess as sp
from flask import Blueprint, request
from variables import KF2_DIRECTORY

# Setup module
kf2_module = Blueprint("kf2_module", __name__)

# Helper func for opening files
def read_file(path):
    with open(path, "r") as f:
        return f.read()

# Vars
if KF2_DIRECTORY[-1] != "/":
    KF2_DIRECTORY += "/"

kfgame_path = KF2_DIRECTORY + "serverfiles/KFGame/Config/kf2server/LinuxServer-KFGame.ini"

lgsm_config_path = KF2_DIRECTORY + "lgsm/config-lgsm/kf2server/common.cfg"

kf2_log_path = KF2_DIRECTORY + "serverfiles/KFGame/Logs/Launch.log"

maps = read_file(kfgame_path).split('GameMapCycles=(Maps=("')[1].upper().split('"))')[0].split('","')

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

# Change game in config file. Validate data here, otherwise it's free rce
def changeGameStartConfig(mode, difficulty, map_choice, game_length):
    map_choice = map_choice.upper()
    # Validate!
    if mode not in modes.keys():
        return "Invalid mode"
    elif difficulty not in difficulties.keys():
        return "Invalid difficulty"
    elif map_choice not in maps:
        return "Invalid map"
    elif game_length not in lengths.keys():
        return "Invalid wave length"
    # Generate string
    launch_string = f"{map_choice}?Game={modes[mode]}?Difficulty={difficulties[difficulty]}?GameLength={game_length}"
    launch_string += "?ConfigSubDir=kf2server -QueryPort=27015"
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
def getCurrentGame():
    # Get advert broadcast from log
    log = read_file(kf2_log_path)
    adverts = log.split("Refreshing published game settings")
    recent_advert = adverts[-1].split("\n")
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
    if game_length != 0:
        current_game["length"] = wave_lengths[int(current_game["length"])]
    else:
        current_game["length"] = "N/A"
    # Return details
    return current_game


# Flask routes
@kf2_module.route("/kf2/status", methods=["GET"])
def getKf2Status():
    try:
        data = getCurrentGame()
    except:
        return {
            "status": 500,
            "error": "An unknown error occurred."
        }, 500
    return {
        "status": 200,
        "results": data
    }, 200

@kf2_module.route("/kf2/change", methods=["POST"])
def changeKf2Game():
    # Validate inputs
    req = request.json
    for inp in ["map", "mode", "difficulty", "length"]:
        if inp not in req.keys():
            return {
                "status": 400,
                "error": f"Missing required input {inp}"
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