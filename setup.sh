# Sudo prompt
echo "Please run as sudo."
sudo echo "Thank you."

# Apt packages
apt-get install sysstat nodejs npm python3-pip

# Pip packages (telegram-send will need to be configured separately)
pip3 install requests flask flask_cors uwsgi telegram-send

# Angular (Currently handled as local package, uncheck below to change this)
# npm install -g @angular/cli > /dev/null

# Node dependencies
npm --prefix ./frontend install ./frontend
