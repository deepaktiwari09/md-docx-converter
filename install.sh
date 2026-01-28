#!/bin/bash
# MD-DOCX Converter Installer
# Downloads, installs, and opens the app

set -e

APP_NAME="MD-DOCX Converter"
DMG_URL="https://dt-md-docx-downloads.s3.amazonaws.com/v1.0.0/MD-DOCX-Converter_1.0.0_aarch64.dmg"
DMG_FILE="/tmp/MD-DOCX-Converter.dmg"
MOUNT_POINT="/Volumes/MD-DOCX Converter"

echo "================================"
echo "  MD-DOCX Converter Installer"
echo "================================"
echo ""

# Download
echo "Downloading..."
curl -L -o "$DMG_FILE" "$DMG_URL" --progress-bar

# Mount DMG
echo "Mounting disk image..."
hdiutil attach "$DMG_FILE" -nobrowse -quiet

# Find the actual mount point (might have a number suffix)
ACTUAL_MOUNT=$(ls -d /Volumes/MD-DOCX\ Converter* 2>/dev/null | head -1)

if [ -z "$ACTUAL_MOUNT" ]; then
    echo "Error: Could not find mounted volume"
    exit 1
fi

# Remove old version if exists
if [ -d "/Applications/$APP_NAME.app" ]; then
    echo "Removing previous version..."
    rm -rf "/Applications/$APP_NAME.app"
fi

# Copy to Applications
echo "Installing to /Applications..."
cp -R "$ACTUAL_MOUNT/$APP_NAME.app" /Applications/

# Remove quarantine attribute
echo "Configuring app..."
xattr -cr "/Applications/$APP_NAME.app"

# Unmount
echo "Cleaning up..."
hdiutil detach "$ACTUAL_MOUNT" -quiet
rm -f "$DMG_FILE"

echo ""
echo "Installation complete!"
echo "Opening $APP_NAME..."
echo ""

# Open the app
open "/Applications/$APP_NAME.app"
