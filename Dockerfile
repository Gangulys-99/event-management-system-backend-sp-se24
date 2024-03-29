# Use an official Node.js runtime as a parent image
FROM node:20.11.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Define environment variable
ENV MONGO_URI mongodb+srv://ishaghaisas:C2ZQTuW1Z1fA4imj@eventmate.kmhysst.mongodb.net/

# Command to run your application
CMD ["node", "app.js"]