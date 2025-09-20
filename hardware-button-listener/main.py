#!/usr/bin/env python3

import RPi.GPIO as GPIO
import os
import time
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ButtonListener:
    def __init__(self):
        self.button_pin = int(os.getenv('BUTTON_PIN', '17'))
        self.api_url = os.getenv('API_URL', 'http://web-interface:8000')
        self.debounce_time = int(os.getenv('DEBOUNCE_TIME', '1000'))
        self.last_press_time = 0

        self.session = self.create_session()
        self.setup_gpio()

    def create_session(self):
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        return session

    def setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            logger.info(f"GPIO setup complete. Button on pin {self.button_pin}")
        except Exception as e:
            logger.error(f"GPIO setup failed: {e}")
            raise

    def handle_button_press(self):
        logger.info("Button pressed - sending to API")

        try:
            response = self.session.post(
                f"{self.api_url}/api/trigger/button",
                timeout=5
            )
            if response.status_code == 200:
                logger.info("API notified successfully")
            else:
                logger.error(f"API returned status {response.status_code}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to notify API: {e}")

    def wait_for_api(self):
        max_attempts = 30
        for attempt in range(max_attempts):
            try:
                response = self.session.get(f"{self.api_url}/api/status", timeout=2)
                if response.status_code == 200:
                    logger.info("API is ready")
                    return True
            except:
                pass

            logger.info(f"Waiting for API... ({attempt + 1}/{max_attempts})")
            time.sleep(2)

        logger.error("API failed to become ready")
        return False

    def run(self):
        logger.info("Starting button listener...")

        if not self.wait_for_api():
            logger.error("Cannot start without API connection")
            return

        logger.info("Button listener ready. Press Ctrl+C to exit.")

        button_was_pressed = False

        try:
            while True:
                # Read current button state (0 = pressed, 1 = not pressed with pull-up)
                button_state = GPIO.input(self.button_pin)

                if button_state == 0 and not button_was_pressed:
                    # Button is pressed and wasn't pressed before
                    current_time = time.time()

                    # Check debounce time
                    if (current_time - self.last_press_time) * 1000 >= self.debounce_time:
                        self.last_press_time = current_time
                        self.handle_button_press()

                    button_was_pressed = True

                elif button_state == 1:
                    # Button is not pressed
                    button_was_pressed = False

                # Small delay to prevent excessive CPU usage
                time.sleep(0.01)

        except KeyboardInterrupt:
            logger.info("Shutting down...")
        finally:
            GPIO.cleanup()
            logger.info("GPIO cleanup complete")

if __name__ == "__main__":
    listener = ButtonListener()
    listener.run()