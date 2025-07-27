# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 4000

# Start the app
CMD ["npm", "start"] 