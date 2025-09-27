# WLED Integration Setup

This project now supports integration with WLED controllers to synchronize LED preset changes with the light/audio playback.

## Features

When configured, the system will:
1. Save the current WLED preset when the light turns on
2. Switch to a configured preset during playback
3. Restore the original preset when the light turns off

## Configuration

Set the following environment variables in your `docker-compose.yml` or `.env` file:

### Environment Variables

- `WLED_HOST`: The IP address or hostname of your WLED controller (e.g., `192.168.1.100` or `wled.local`)
  - Leave empty to disable WLED integration
  - Default: empty (disabled)

- `WLED_PRESET`: The preset number to activate during playback (1-250)
  - Default: 1

## Example Configuration

```yaml
environment:
  - WLED_HOST=192.168.1.100
  - WLED_PRESET=5
```

This configuration will:
- Connect to WLED at `192.168.1.100`
- Activate preset 5 when the light turns on
- Restore the previous preset when the light turns off

## WLED JSON API

The integration uses WLED's JSON API endpoints:
- `GET http://<WLED_HOST>/json` - Read current preset (ps field)
- `POST http://<WLED_HOST>/json` - Set preset with `{"ps": <preset_number>}`

## Troubleshooting

1. **Connection Issues**: Ensure your WLED device is on the same network and accessible from the container
2. **Preset Not Changing**: Verify the preset number exists in your WLED configuration (1-250)
3. **Check Logs**: Monitor the backend logs for WLED-related messages:
   ```bash
   docker-compose logs web-backend | grep WLED
   ```

## Disable WLED Integration

To disable WLED integration, simply leave the `WLED_HOST` environment variable empty or remove it from your configuration.