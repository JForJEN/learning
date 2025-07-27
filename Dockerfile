FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install dependencies with production flag
RUN npm ci --only=production

# Install dev dependencies for build
RUN npm install --only=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and clean up
RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"] 