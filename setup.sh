#!/bin/bash

USER=$(whoami)

echo "Navigating to nodes/Alertrack directory..."
cd nodes/Alertrack || { echo "Directory nodes/Alertrack not found!"; exit 1; }

echo "Installing dependencies..."
npm i --force

echo "Building the project..."
npm run build

CUSTOM_DIR="/home/$USER/.n8n/custom"

if [ -d "$CUSTOM_DIR/dist" ]; then
    echo "Removing existing 'dist' directory..."
    rm -rf "$CUSTOM_DIR/dist"
fi

echo "Moving 'dist' to $CUSTOM_DIR..."
mkdir -p "$CUSTOM_DIR"
cd ..
cd ..
mv -f dist "$CUSTOM_DIR"

cd "$CUSTOM_DIR/dist" || exit

echo "Installing dependencies inside dist..."
npm i

echo "Linking package..."
npm link

echo "Linking 'n8n-nodes-alertrack'..."
npm link n8n-nodes-alertrack

echo "Script execution complete."