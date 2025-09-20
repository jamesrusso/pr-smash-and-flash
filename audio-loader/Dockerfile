FROM alpine:latest

# Copy loader script
COPY loader.sh /loader.sh
RUN chmod +x /loader.sh

# Copy all audio files to root for processing
COPY *.wav *.mp3 *.ogg *.flac *.m4a /

# Run the loader script
CMD ["/loader.sh"]