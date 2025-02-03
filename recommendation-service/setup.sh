#!/bin/bash

echo "Setting up recommendation service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install numpy first
echo "Installing numpy..."
pip install numpy

# Install other dependencies
echo "Installing other dependencies..."
pip install -r requirements.txt

echo "Setup complete! You can now run tests using:"
echo "source venv/bin/activate && pytest" 