#!/bin/sh

echo "==================================="
echo "Audio File Loader"
echo "==================================="

# Create directory if it doesn't exist
mkdir -p /data/audio

# Count and copy audio files
count=0
for ext in wav mp3 ogg flac m4a; do
    for file in /*.${ext}; do
        if [ -f "$file" ]; then
            cp "$file" /data/audio/
            echo "✓ Loaded: $(basename "$file")"
            count=$((count + 1))
        fi
    done
done

echo "==================================="
echo "Total files loaded: $count"
echo "==================================="

# Keep container running for a moment to ensure volume is properly synced
sleep 2