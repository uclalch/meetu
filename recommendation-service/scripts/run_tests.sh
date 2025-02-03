#!/bin/bash
echo "Running tests with coverage..."
pytest --cov=src --cov-report=term-missing -v 