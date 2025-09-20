# Audio Loader 🎵

This directory serves as the audio file initialization container for the Smash & Flash Controller.

## Purpose

The audio-loader is a one-time initialization service that:
1. **Loads audio files** into the shared Docker volume at deployment
2. **Pre-populates** the sound library before other services start
3. **Ensures persistence** across container restarts

## How It Works

When deployed to Balena:
1. The container starts and copies all audio files to `/data/audio`
2. Reports which files were loaded in the logs
3. Exits after completion (runs once per deployment)
4. The shared volume retains files even after container stops

## Adding Audio Files

Simply place your audio files in this directory before deployment:

```bash
audio-loader/
├── firebell.wav        # Example sound
├── airhorn.mp3         # Another sound
├── notification.ogg    # And another
├── loader.sh          # DO NOT MODIFY - Loading script
├── Dockerfile         # DO NOT MODIFY - Container definition
└── README.md          # This file
```

### Supported Formats
- `.wav` - Waveform Audio File
- `.mp3` - MPEG Audio Layer III
- `.ogg` - Ogg Vorbis
- `.flac` - Free Lossless Audio Codec
- `.m4a` - MPEG-4 Audio

## Important Notes

⚠️ **File Size**: Keep individual files under 10MB for optimal performance

⚠️ **Naming**: Use descriptive filenames without special characters

⚠️ **Volume**: Files are copied to the `audio-data` volume shared by all services

⚠️ **Updates**: To add new sounds after deployment, use the web interface upload feature

## File Management

- **Initial Load**: Place files here before first deployment
- **After Deployment**: Use the web interface to upload/delete sounds
- **Persistence**: Files remain in the volume even if you update the container

## Troubleshooting

If audio files aren't appearing:
1. Check the container logs: `balena logs audio-loader`
2. Verify file extensions are correct
3. Ensure files aren't corrupted
4. Check that the volume is properly mounted

---

Part of the Smash & Flash Controller system