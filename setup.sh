#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting MeetU Chat Platform Setup...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if node:16-alpine image exists locally
if ! docker images | grep -q "node.*16-alpine"; then
    echo -e "${YELLOW}Node.js image not found locally. Pulling from Docker Hub...${NC}"
    docker pull node:16-alpine
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to pull Node.js image. Please check your Docker Hub connection.${NC}"
        exit 1
    fi
fi

# Source external .env file if it exists
if [ -f "/Users/larryli/Documents/Sobriety/Companies/companies_keys/MeetU/.env" ]; then
    echo -e "${GREEN}Found external .env file, importing credentials...${NC}"
    export $(cat "/Users/larryli/Documents/Sobriety/Companies/companies_keys/MeetU/.env" | grep -E "TENCENT_|JWT_" | xargs)
else
    echo -e "${RED}No external .env file found at /Users/larryli/Documents/Sobriety/Companies/companies_keys/MeetU/.env${NC}"
    echo -e "${RED}Please ensure TENCENT_SECRET_ID and TENCENT_SECRET_KEY are set.${NC}"
    exit 1
fi

# Check if containers are already running
if docker-compose ps | grep -q "meetu"; then
    echo -e "${YELLOW}MeetU services are already running.${NC}"
    echo -e "${YELLOW}Use 'docker-compose down' to stop or 'docker-compose logs -f' to view logs.${NC}"
    exit 0
fi

# Check if package.json exists, if not create it
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Creating package.json...${NC}"
    cat > package.json << 'EOL'
{
  "name": "meetu",
  "version": "1.0.0",
  "description": "MeetU Chat Platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "socket.io": "^4.6.1"
  }
}
EOL
fi

# Check if node_modules exists and package.json hasn't changed
if [ -d "node_modules" ] && [ -f "package.json" ]; then
    CURRENT_HASH=$(md5sum package.json | cut -d' ' -f1)
    if [ -f ".package_hash" ]; then
        STORED_HASH=$(cat .package_hash)
        if [ "$CURRENT_HASH" == "$STORED_HASH" ]; then
            echo -e "${GREEN}Dependencies are up to date.${NC}"
        else
            echo -e "${YELLOW}Package.json has changed. Removing node_modules...${NC}"
            rm -rf node_modules
            echo "$CURRENT_HASH" > .package_hash
        fi
    else
        echo "$CURRENT_HASH" > .package_hash
    fi
fi

# Build and start containers in foreground
echo -e "${GREEN}Starting services...${NC}"
docker-compose up --build