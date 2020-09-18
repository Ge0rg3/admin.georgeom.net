# Custom PATH so that we can run this with cron
PATH="/usr/local/bin:/usr/bin:/bin"
# Get path of start.sh script
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
# Start uwsgi server
(cd $SCRIPTPATH/backend && uwsgi --http 127.0.0.1:1337 --disable-logging --module app:app) >>/log/admin.log 2>&1 &
