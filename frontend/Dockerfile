FROM node:16

# Create app directory
WORKDIR /usr/src/app

# No copy is done, because all files are shared via volumes and bind mounts in Docker Compose
# COPY . ./

# Configure
EXPOSE 3000

# Run
CMD ["bash", "start_frontend.sh"]

# DEBUG: Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]
