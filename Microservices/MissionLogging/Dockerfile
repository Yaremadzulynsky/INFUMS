# Use the official Node.js 16 image
FROM node:16

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install -g typescript


# Copy the rest of the application code
COPY . .
RUN tsc

# Expose the port the app runs on (if applicable, not needed in this case)
# EXPOSE 8080

# Command to run the application
CMD ["node", "bin/index.js"]
