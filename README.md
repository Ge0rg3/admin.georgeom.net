# admin.georgeom.net
API + Frontend to remotely manage and monitor different services on my site.

git wasn't used during the bulk development of the project, this is just for changes past 30-08-2020.

## Setup
1) Clone repo
2) Add password to backend/auth/password.txt file
3) Run setup.sh script with sudo/as root
4) Run deploy.sh script to compile angular
5) Run start.sh script to start the uwsgi server

## Restart on system boot
Add the following to user crontab
```
@reboot bash /var/www/admin/start.sh
```

## Serving on nginx
Create the following nginx config
```
server {
        listen 80;

	# If cloudflare enforcer exists, uncheck below
        # include /etc/nginx/cloudflare-allow.conf;
        # deny all;

	# Replace site.com with domain
        server_name site.com;
        location / {
                proxy_pass http://127.0.0.1:1337/;
        }
}
```

## Permissions
This service needs a bunch of permissions, but we don't want RCE if someone logs in. As such, the following entries have been added to the sudoers file:
```
# nginx service permissions
george ALL=NOPASSWD: /usr/sbin/nginx -s reload
# nginx sites permissions
george ALL=NOPASSWD: /usr/bin/rm /etc/nginx/sites-enabled/georgeom.net.conf, /usr/bin/ln -s /etc/nginx/sites-available/georgeom.net.conf /etc/nginx/sites-enabled/georgeom.net.conf
george ALL=NOPASSWD: /usr/bin/rm /etc/nginx/sites-enabled/nextcloud.conf, /usr/bin/ln -s /etc/nginx/sites-available/nextcloud.conf /etc/nginx/sites-enabled/nextcloud.conf
george ALL=NOPASSWD: /usr/bin/rm /etc/nginx/sites-enabled/stegonline.conf, /usr/bin/ln -s /etc/nginx/sites-available/stegonline.conf /etc/nginx/sites-enabled/stegonline.conf
george ALL=NOPASSWD: /usr/bin/rm /etc/nginx/sites-enabled/kf2.conf, /usr/bin/ln -s /etc/nginx/sites-available/kf2.conf /etc/nginx/sites-enabled/kf2.conf
# linuxgsm permissions
george ALL=NOPASSWD: /usr/bin/su - kf2server - /home/kf2server/kf2server stop
george ALL=NOPASSWD: /usr/bin/su - kf2server - /home/kf2server/kf2server start
george ALL=NOPASSWD: /usr/bin/su - kf2server - /home/kf2server/kf2server restart
george ALL=NOPASSWD: /usr/bin/su - mcserver - /home/mcserver/mcserver stop
george ALL=NOPASSWD: /usr/bin/su - mcserver - /home/mcserver/mcserver start
george ALL=NOPASSWD: /usr/bin/su - mcserver - /home/mcserver/mcserver restart
```
