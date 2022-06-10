FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy the code
COPY . ./

# Configure
EXPOSE 3000

# Run
CMD ["bash", "start_frontend.sh"]

# DEBUG: Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]