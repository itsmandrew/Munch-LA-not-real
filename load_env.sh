#!/bin/bash

# Path to the file containing API keys
KEYS_FILE=".env"

# Check if the file exists
if [ ! -f "$KEYS_FILE" ]; then
    echo "API keys file not found!"
    exit 1
fi

# Load the API keys into environment variables
export $(grep -v '^#' "$KEYS_FILE" | xargs)

# Print the loaded variables (for debugging purposes, remove this in production)
echo "API keys loaded into environment variables"
