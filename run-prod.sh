#!/bin/bash

# Step 1: Clean using the run-clean script
sh ./run-clean.sh || {
    echo "Failed to run clean script"
    exit 1
}

# Step 2: Navigate to the client directory
cd ./client || {
    echo "Failed to navigate to ./client"
    exit 1
}

# Step 3: Create or overwrite the env.gleam file with the API URL
if [ -z "$API_URL" ]; then
    echo "API_URL environment variable is not set"
    exit 1
fi

echo "pub fn get_api_url() { \"${API_URL}\" }" >./src/env.gleam

# Step 4: Build the Gleam project with Lustre and output static files
gleam run -m lustre/dev build --outdir=../server/priv/static --minify || {
    echo "Failed to build the client"
    exit 1
}

# Step 5: Navigate to the server directory
cd ../server || {
    echo "Failed to navigate to ../server"
    exit 1
}

# Step 6: Run the Gleam server
gleam run || {
    echo "Failed to run the server"
    exit 1
}
