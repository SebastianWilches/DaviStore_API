#!/usr/bin/env bash
# Build script para Render

set -o errexit

echo "🔨 Installing dependencies..."
npm ci

echo "🏗️  Building TypeScript..."
npm run build

echo "🗄️  Running database migrations..."
node setup-database.js

echo "✅ Build completed successfully!"

