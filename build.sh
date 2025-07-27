#!/bin/bash

echo "🔧 Starting build process..."

# Clean install
echo "📦 Installing dependencies..."
npm ci --only=production

# Install dev dependencies for build
echo "🔨 Installing build dependencies..."
npm install --only=dev

# Build the application
echo "🏗️ Building application..."
npm run build

# Clean up dev dependencies
echo "🧹 Cleaning up..."
npm prune --production

echo "✅ Build completed successfully!" 