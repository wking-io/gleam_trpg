#!/bin/bash

# Navigate to the client directory
cd ./client || {
    echo "Failed to navigate to ./client"
    exit 1
}

# Create or overwrite the env.gleam file with the API URL
echo "pub fn get_api_url() { \"http://localhost:1234\" }" >./src/env.gleam

# Run the Gleam Lustre development server with proxy settings in the background
gleam run -m lustre/dev start --proxy-from=/api --proxy-to=http://localhost:8001/api &

# Navigate to the server directory
cd ../server || {
    echo "Failed to navigate to ../server"
    exit 1
}
