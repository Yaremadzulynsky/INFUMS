# Use the official Node.js 16 image
FROM node:16

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Command to run the application
CMD ["node", "bin/index.js"]
