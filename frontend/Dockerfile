FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest
COPY . ./

EXPOSE 3000
CMD ["npm", "run", "start"]

# DEBUG: Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]