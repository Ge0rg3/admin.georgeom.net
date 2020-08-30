# Sudo prompt
echo "Please run as sudo."
sudo echo "Thank you."
# Apt packages
apt-get install sysstat nodejs npm python3-pip
# Pip packages
pip3 install requests flask flask_cors uwsgi
# Angular (Currently handled as local package, uncheck below to change this)
# npm install -g @angular/cli > /dev/null
# Node dependencies
npm --prefix ./frontend install ./frontend
