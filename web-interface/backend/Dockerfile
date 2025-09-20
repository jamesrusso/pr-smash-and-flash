FROM python:3.13-slim-bookworm

RUN apt-get update && apt-get install -y \
    build-essential \
    pulseaudio-utils \
    python3-rpi.gpio \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]