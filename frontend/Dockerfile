FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm i

# Copy the rest
COPY . ./

EXPOSE 3000
CMD ["npm", "run", "start"]

# DEBUG: Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]