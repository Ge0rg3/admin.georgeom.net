import subprocess as sp
from os import path

"""
    Some services do not work within the dev WSL environment.
    We can detect whether we are in this dev environment through the
    /proc/version file, and load in dev data accordingly.
"""
output = sp.check_output(["cat", "/proc/version"]).decode()
IS_DEV = "microsoft" in output

"""
    We often need to access files from the home dir,
    so the home filepath may be needed
"""
HOME_FILEPATH = path.dirname(path.realpath(__file__)) + "/"
