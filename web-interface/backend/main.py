#!/usr/bin/env python3

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
import os
import random
import subprocess
import time
import logging
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
try:
    import RPi.GPIO as GPIO
except:
    import Mock.GPIO as GPIO

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Button Controller API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioController:
    def __init__(self):
        self.light_pin = int(os.getenv('LIGHT_PIN', '22'))
        self.audio_directory = os.getenv('AUDIO_DIRECTORY', '/data/audio')
        self.pulse_server = os.getenv('PULSE_SERVER', 'tcp:audio:4317')

        # WLED Configuration
        self.wled_host = os.getenv('WLED_HOST', '')
        self.wled_preset = int(os.getenv('WLED_PRESET', '1')) if os.getenv('WLED_PRESET') else 1
        self.wled_enabled = bool(self.wled_host)
        self.original_wled_preset = None

        self.light_on = False
        self.is_playing = False
        self.current_audio_process = None

        Path(self.audio_directory).mkdir(parents=True, exist_ok=True)

        self.setup_gpio()
        logger.info(f"AudioController initialized - Light: {self.light_pin}")
        if self.wled_enabled:
            logger.info(f"WLED enabled - Host: {self.wled_host}, Preset: {self.wled_preset}")

    def setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.light_pin, GPIO.OUT)
            GPIO.output(self.light_pin, GPIO.LOW)
            logger.info("GPIO setup complete")
        except Exception as e:
            logger.error(f"GPIO setup failed: {e}")
            logger.info("Running in simulation mode")

    def get_audio_files(self) -> List[Dict[str, Any]]:
        audio_extensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']
        audio_path = Path(self.audio_directory)

        files = []
        for ext in audio_extensions:
            for file in audio_path.glob(f'*{ext}'):
                files.append({
                    'name': file.name,
                    'size': file.stat().st_size,
                    'modified': file.stat().st_mtime
                })

        return sorted(files, key=lambda x: x['name'])

    async def stop_audio(self) -> bool:
        """Stop currently playing audio"""
        if not self.is_playing or not self.current_audio_process:
            logger.info("No audio currently playing")
            return False

        try:
            logger.info("Stopping audio playback")
            self.current_audio_process.terminate()
            await asyncio.sleep(0.1)  # Give it time to terminate gracefully
            return True

        except Exception as e:
            logger.error(f"Failed to stop audio: {e}")
            return False

    async def play_audio(self, filename: str = None) -> bool:
        if self.is_playing:
            logger.warning("Audio already playing - stopping current playback")
            await self.stop_audio()
            await asyncio.sleep(0.2)  # Brief pause before starting new audio

        audio_files = list(Path(self.audio_directory).glob('*'))
        audio_files = [f for f in audio_files if f.suffix.lower() in ['.mp3', '.wav', '.ogg', '.flac', '.m4a']]

        if not audio_files:
            logger.warning("No audio files found")
            return False

        if filename:
            audio_file = Path(self.audio_directory) / filename
            if not audio_file.exists():
                logger.error(f"Audio file not found: {filename}")
                return False
        else:
            audio_file = random.choice(audio_files)

        logger.info(f"Playing: {audio_file.name}")
        self.is_playing = True

        try:
            await self.turn_light_on()
            self.current_audio_process = await asyncio.create_subprocess_exec(
                'paplay',
                '--property', 'media.role=phone', str(audio_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, 'PULSE_SERVER': self.pulse_server}
            )
            stdout, stderr = await self.current_audio_process.communicate()

            if self.current_audio_process.returncode != 0 and self.current_audio_process.returncode != -15:  # -15 is SIGTERM
                logger.error(f"paplay failed: {stderr.decode()}")
                return False

            if self.current_audio_process.returncode == 0:
                logger.info("Audio playback completed normally")
            return True

        except asyncio.CancelledError:
            logger.info("Audio playback cancelled")
            return False
        except Exception as e:
            logger.error(f"Failed to play audio: {e}")
            return False
        finally:
            self.is_playing = False
            self.current_audio_process = None
            await self.turn_light_off()

    async def get_wled_preset(self) -> Optional[int]:
        """Get current WLED preset"""
        if not self.wled_enabled:
            return None

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://{self.wled_host}/json", timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data = await response.json()
                        preset = data.get('ps', -1)
                        logger.info(f"Current WLED preset: {preset}")
                        return preset
        except Exception as e:
            logger.error(f"Failed to get WLED preset: {e}")
            return None

    async def set_wled_preset(self, preset: int) -> bool:
        """Set WLED preset"""
        if not self.wled_enabled:
            return True

        try:
            async with aiohttp.ClientSession() as session:
                payload = {"ps": preset}
                async with session.post(
                    f"http://{self.wled_host}/json",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        logger.info(f"Set WLED preset to {preset}")
                        return True
                    else:
                        logger.error(f"Failed to set WLED preset: HTTP {response.status}")
                        return False
        except Exception as e:
            logger.error(f"Failed to set WLED preset: {e}")
            return False

    async def turn_light_on(self) -> bool:
        try:
            # Save current WLED preset before changing
            if self.wled_enabled and self.original_wled_preset is None:
                self.original_wled_preset = await self.get_wled_preset()
                logger.info(f"Saved original WLED preset: {self.original_wled_preset}")

            # Turn on GPIO light
            GPIO.output(self.light_pin, GPIO.HIGH)
            self.light_on = True
            logger.info(f"Light ON")

            # Set WLED to configured preset
            if self.wled_enabled:
                await self.set_wled_preset(self.wled_preset)

            return True

        except Exception as e:
            logger.error(f"Failed to turn light on: {e}")
            return False

    async def turn_light_off(self) -> bool:
        try:
            # Turn off GPIO light
            GPIO.output(self.light_pin, GPIO.LOW)
            self.light_on = False
            logger.info("Light OFF")

            # Restore original WLED preset
            if self.wled_enabled and self.original_wled_preset is not None:
                await self.set_wled_preset(self.original_wled_preset)
                logger.info(f"Restored WLED preset to {self.original_wled_preset}")
                self.original_wled_preset = None

            return True

        except Exception as e:
            logger.error(f"Failed to turn light off: {e}")
            return False

    async def toggle_light(self) -> bool:
        if self.light_on:
            return await self.turn_light_off()
        else:
            return await self.turn_light_on()

    def cleanup(self):
        try:
            GPIO.cleanup()
        except:
            pass

controller = AudioController()

@app.on_event("shutdown")
async def shutdown_event():
    controller.cleanup()

@app.get("/")
async def root():
    return {"message": "Button Controller API", "version": "1.0.0"}

@app.get("/api/status")
async def get_status():
    return {
        "light_on": controller.light_on,
        "is_playing": controller.is_playing,
        "audio_files_count": len(controller.get_audio_files())
    }

@app.get("/api/sounds")
async def list_sounds():
    return controller.get_audio_files()

@app.post("/api/upload")
async def upload_sound(file: UploadFile = File(...)):
    allowed_extensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

    file_path = Path(controller.audio_directory) / file.filename

    try:
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)

        logger.info(f"Uploaded: {file.filename}")
        return {"filename": file.filename, "size": len(content)}

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(500, "Upload failed")

@app.delete("/api/sounds/{filename}")
async def delete_sound(filename: str):
    file_path = Path(controller.audio_directory) / filename

    if not file_path.exists():
        raise HTTPException(404, "File not found")

    try:
        file_path.unlink()
        logger.info(f"Deleted: {filename}")
        return {"message": f"Deleted {filename}"}
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(500, "Delete failed")

@app.post("/api/play/{filename}")
async def play_specific_sound(filename: str):
    # If audio is playing, stop it first
    if controller.is_playing:
        await controller.stop_audio()
        await asyncio.sleep(0.2)

    success = await controller.play_audio(filename)
    if not success:
        raise HTTPException(400, "Failed to play audio")
    return {"message": f"Playing {filename}"}

@app.post("/api/trigger/random")
async def trigger_random():
    asyncio.create_task(controller.play_audio())
    return {"message": "Triggered random sound and light"}

@app.post("/api/trigger/button")
async def trigger_button():
    logger.info("Physical button pressed!")

    # If audio is playing, stop it instead of starting new audio
    if controller.is_playing:
        logger.info("Stopping current playback")
        success = await controller.stop_audio()
        return {"message": "Stopped playback", "stopped": success}
    else:
        return await trigger_random()

@app.post("/api/stop")
async def stop_playback():
    """Stop current audio playback"""
    success = await controller.stop_audio()
    if not success:
        raise HTTPException(400, "No audio playing or failed to stop")
    return {"message": "Playback stopped"}

@app.post("/api/light/on")
async def light_on():
    success = await controller.turn_light_on()
    if not success:
        raise HTTPException(400, "Failed to turn light on")
    return {"message": "Light on"}

@app.post("/api/light/off")
async def light_off():
    success = await controller.turn_light_off()
    if not success:
        raise HTTPException(400, "Failed to turn light off")
    return {"message": "Light off"}

@app.post("/api/light/toggle")
async def light_toggle():
    success = await controller.toggle_light()
    if not success:
        raise HTTPException(400, "Failed to toggle light")
    return {"message": f"Light {'on' if controller.light_on else 'off'}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)