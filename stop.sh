pkill -SIGINT -f "uwsgi --http 127.0.0.1:1337 --disable-logging --module app:app"
