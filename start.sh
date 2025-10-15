#!/bin/bash

# Healthcare Platform Startup Script
# This script starts the healthcare platform on ports 3001 (frontend) and 5001 (backend)

echo "🏥 Starting Secure Healthcare Platform..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}🔍 Checking MongoDB...${NC}"
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB is not running. Starting MongoDB...${NC}"
    brew services start mongodb-community 2>/dev/null || sudo systemctl start mongod 2>/dev/null
    sleep 2
    if pgrep -x mongod > /dev/null; then
        echo -e "${GREEN}✓ MongoDB started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start MongoDB. Please start it manually.${NC}"
        exit 1
    fi
fi

# Check if Redis is running
echo -e "${BLUE}🔍 Checking Redis...${NC}"
if pgrep -x redis-server > /dev/null; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠ Redis is not running. Starting Redis...${NC}"
    brew services start redis 2>/dev/null || sudo systemctl start redis 2>/dev/null
    sleep 2
    if pgrep -x redis-server > /dev/null; then
        echo -e "${GREEN}✓ Redis started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start Redis. Please start it manually.${NC}"
        exit 1
    fi
fi

# Check if .env files exist
echo ""
echo -e "${BLUE}🔍 Checking configuration files...${NC}"
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠ Backend .env not found. Creating from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi

if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠ Frontend .env not found. Creating from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
fi

# Check if node_modules exist
echo ""
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠ Dependencies not installed. Running npm install...${NC}"
    npm run install-all
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting Healthcare Platform${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📍 Backend API:${NC}  http://localhost:5001"
echo -e "${BLUE}📍 Frontend App:${NC} http://localhost:3001"
echo ""
echo -e "${YELLOW}💡 Your other project on port 3000 will continue to run${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both services
npm run dev
