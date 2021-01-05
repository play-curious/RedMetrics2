FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json yarn.lock ./
RUN yarn 

# Copy the rest
COPY . .

EXPOSE 6627
CMD ["yarn", "start"]
