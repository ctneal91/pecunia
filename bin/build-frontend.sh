#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
echo "Copying frontend build to public directory..."
cp -r build/* ../public/
cd ..
echo "Frontend build complete!"
