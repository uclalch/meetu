#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Recommendation Service...${NC}"

# Check Python version
python3 --version

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install numpy first
echo -e "${YELLOW}Installing numpy...${NC}"
pip install numpy

# Install other dependencies
echo -e "${YELLOW}Installing other dependencies...${NC}"
pip install -r requirements.txt

# Create necessary directories if they don't exist
mkdir -p src/models/{content_based,collaborative,hybrid}
mkdir -p src/{api,preprocessing,utils}
mkdir -p tests/{test_api,test_models}

# Create __init__.py files
touch src/models/{content_based,collaborative,hybrid}/__init__.py
touch src/{api,preprocessing,utils}/__init__.py

echo -e "${GREEN}Setup complete! You can now run tests using:${NC}"
echo -e "${YELLOW}source venv/bin/activate && pytest${NC}" 