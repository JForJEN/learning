FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .npmrc ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code and pre-built files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"] 