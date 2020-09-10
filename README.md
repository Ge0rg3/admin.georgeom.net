# admin.georgeom.net
API + Frontend to remotely manage and monitor different services on my site.

git wasn't used during the bulk development of the project, this is just for changes past 30-08-2020.

## Setup
1) Clone repo
2) Add password to backend/auth/password.txt file
3) Run setup.sh script with sudo/as root
4) Run deploy.sh script to compile angular
5) Run start.sh script to start the uwsgi server

## Securing
This should be run by a service account with passwordless sudo access, and the account should be disabled so no authentication is possible.
The following commands will create such an account:
```
sudo useradd -M dashboard
sudo usermod -L dashboard
sudo usermod -aG www-data dashboard
sudo usermod -aG sudo dashboard
```
The following will then need to be added to the sudoers file:
```
dashboard ALL=(ALL) NOPASSWD:ALL
```

## Restart on system boot
Add the following to dashboard user crontab (where `/var/www/admin` is the project path).
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

## Usage
#### Diskspace
![Diskspace](/frontend/src/assets/diskspace.png "Diskspace")
#### Processes
![Processes](/frontend/src/assets/processes.png "Processes")
#### Statuses
![Statuses](/frontend/src/assets/status.png "Statuses")