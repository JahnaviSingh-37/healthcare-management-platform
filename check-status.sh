#!/bin/bash

echo "🔍 Checking Healthcare Platform Status..."
echo ""

# Check Backend
if lsof -i :5001 | grep -q LISTEN; then
    echo "✅ Backend API: Running on port 5001"
else
    echo "❌ Backend API: NOT running on port 5001"
fi

# Check Frontend
if lsof -i :3001 | grep -q LISTEN; then
    echo "✅ Frontend: Running on port 3001"
else
    echo "❌ Frontend: NOT running on port 3001"
fi

# Check MongoDB
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB: Running"
else
    echo "❌ MongoDB: NOT running"
fi

echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:5001"
echo ""
