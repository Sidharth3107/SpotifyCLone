# Use an official Node.js runtime
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Your app binds to port 3000
EXPOSE 3000

# Command to start the React app
CMD ["npm", "start"]