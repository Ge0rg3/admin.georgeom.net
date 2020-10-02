import subprocess as sp
from os import path
import sqlite3

"""
    Some services do not work within the dev WSL environment.
    We can detect whether we are in this dev environment through the
    /proc/version file, and load in dev data accordingly.
"""
IS_DEV = "microsoft" in sp.check_output(["cat", "/proc/version"]).decode()


"""
    We often need to access files from the home dir,
    so the home filepath may be needed
"""
HOME_FILEPATH = path.dirname(path.realpath(__file__)) + "/"


"""
    Get passwords from permissions.db
    Empty db stored in backend/dev_data/permissions.db
    ```
"""
def getPermissions():
    # Get data from DB
    conn = sqlite3.connect(f"{HOME_FILEPATH}auth/permissions.db")
    cur = conn.cursor()
    cur.execute("SELECT * FROM permissions")
    rows = cur.fetchall()
    # Parse data
    permissions = []
    for row in rows:
        permissions.append({
            "name": row[1],
            "accesskey": row[2],
            "paths": row[3].split(",")
        })
    return permissions

PERMISSIONS = getPermissions()
