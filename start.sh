# Get path of start.sh script
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
# Start uwsgi server
cd $SCRIPTPATH/backend && uwsgi --http 127.0.0.1:5000 --disable-logging --module app:app
