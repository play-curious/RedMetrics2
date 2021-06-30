# NOTE: this dockerfile is run in the context of the parent directory

FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY backend/package*.json ./
COPY typings ./rm2-typings
RUN cd rm2-typings && npm link && cd ../ && npm link rm2-typings

# npm link takes care installing everything
# RUN npm i

# Copy the rest
COPY backend/ ./

EXPOSE 6627

# Just run dist
# CMD ["npm", "run", "start"]

# Restart when file changes
CMD ["npm", "run", "watch"]

# DEBUG: Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]