#!/bin/bash

echo "🚀 Starting Study Planner..."

cd /home/workspace/my-project/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Start server
node server.js