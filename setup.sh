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
    # Add some debug output
    echo -e "${YELLOW}Checking Tencent credentials...${NC}"
    export $(cat "/Users/larryli/Documents/Sobriety/Companies/companies_keys/MeetU/.env" | grep -E "TENCENT_|JWT_" | xargs)
    # Print (masked) credentials to verify
    echo -e "${GREEN}TENCENT_SECRET_ID=${TENCENT_SECRET_ID:0:4}...${NC}"
    echo -e "${GREEN}TENCENT_SECRET_KEY=${TENCENT_SECRET_KEY:0:4}...${NC}"
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

# Create frontend directory if it doesn't exist
mkdir -p frontend

# Check if package.json exists, if not create it
if [ ! -f "frontend/package.json" ]; then
    echo -e "${YELLOW}Creating package.json...${NC}"
    cat > frontend/package.json << 'EOL'
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
    "@vitalets/google-translate-api": "^9.2.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "socket.io": "^4.6.1",
    "tencentcloud-sdk-nodejs": "^4.0.1022"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
EOL
fi

# Build and start containers in foreground
echo -e "${GREEN}Starting services...${NC}"
docker-compose up --build