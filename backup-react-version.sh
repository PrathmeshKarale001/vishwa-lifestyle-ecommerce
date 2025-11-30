#!/bin/bash

# Vishwa Lifestyle - React Version Backup Script
# Run this before starting Shopify conversion

echo "🛡️  Creating React Version Backup..."
echo ""

# Get current date for backup filename
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="Vishwa-Lifestyle-REACT-BACKUP-${BACKUP_DATE}.zip"
BACKUP_PATH="/Users/prathmeshkarale/Downloads"
PROJECT_PATH="/Users/prathmeshkarale/Downloads/Vishwa-Lifestyle"

# Check if project exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: Project not found at $PROJECT_PATH"
    exit 1
fi

# Create backup
echo "📦 Creating backup: $BACKUP_NAME"
cd "$BACKUP_PATH"

zip -r "$BACKUP_NAME" Vishwa-Lifestyle \
  -x "Vishwa-Lifestyle/node_modules/*" \
  -x "Vishwa-Lifestyle/.next/*" \
  -x "Vishwa-Lifestyle/.git/*" \
  -x "Vishwa-Lifestyle/.vercel/*" \
  -x "Vishwa-Lifestyle/.netlify/*" \
  -x "Vishwa-Lifestyle/*.log" \
  -x "Vishwa-Lifestyle/.DS_Store" \
  -x "Vishwa-Lifestyle/Vishwa-Lifestyle-*.zip" \
  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    # Get file size
    FILE_SIZE=$(ls -lh "$BACKUP_NAME" | awk '{print $5}')
    
    echo ""
    echo "✅ Backup created successfully!"
    echo "📁 File: $BACKUP_NAME"
    echo "📊 Size: $FILE_SIZE"
    echo "📍 Location: $BACKUP_PATH"
    echo ""
    echo "🔗 Your React version is also live at:"
    echo "   https://vishwa-lifestyle-prototype.netlify.app"
    echo ""
    echo "🛡️  Your React code is now safely backed up!"
else
    echo "❌ Error: Backup failed"
    exit 1
fi

