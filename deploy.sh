#!/bin/bash

# Exit script on error
set -e

# Usage function to show help message
usage() {
  echo "Usage: $0 -d <app_directory>"
  echo ""
  echo "  -d  Application directory on the Raspberry Pi (e.g., /home/<user>/home-automation-app)"
  exit 1
}

# Parse parameters
while getopts "d:" opt; do
  case ${opt} in
    d)
      PI_APP_DIR=$OPTARG
      ;;
    *)
      usage
      ;;
  esac
done

# Check for missing parameters
if [[ -z "$PI_APP_DIR" ]]; then
  echo "Error: Missing required parameters."
  usage
fi

# Raspberry Pi Host alias (from .ssh/config)
PI_HOST="raspberrypi"

# Step 1: Build the Next.js app
echo "Running a release build..."
npm install
npm run build

# Step 2: Copy necessary files to the Raspberry Pi
echo "Copying files to Raspberry Pi..."
rsync -avz --delete \
  --exclude "node_modules" \
  --exclude ".git" \
  --exclude "*.ts" \
  --exclude "*.tsx" \
  ./ $PI_HOST:$PI_APP_DIR

# Step 3: Set up PM2 on the Raspberry Pi
echo "Setting up PM2 on Raspberry Pi..."
ssh $PI_HOST <<EOF
  export NVM_DIR="\$HOME/.nvm"
  [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh" # Load NVM
  [ -s "\$NVM_DIR/bash_completion" ] && \. "\$NVM_DIR/bash_completion" # Load NVM bash_completion
  cd $PI_APP_DIR
  npm install --production
  pm2 delete home-automation-app-app || true
  pm2 start npm --name "home-automation-app" -- start
  pm2 save
EOF

echo "Deployment complete! Your app is now live and managed by PM2."