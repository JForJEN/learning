FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json only (no package-lock.json)
COPY package.json ./

# Install only production dependencies without lock file
RUN npm install --only=production --no-package-lock

# Copy source code and pre-built files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"] 