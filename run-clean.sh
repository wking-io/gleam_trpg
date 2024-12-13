#!/bin/bash

# Navigate to the client directory and clean Gleam
cd ./client || {
    echo "Failed to navigate to ./client"
    exit 1
}
gleam clean

# Navigate to the server directory and clean Gleam
cd ../server || {
    echo "Failed to navigate to ../server"
    exit 1
}
gleam clean

# Navigate to the shared directory and clean Gleam
cd ../shared || {
    echo "Failed to navigate to ../shared"
    exit 1
}
gleam clean

# Navigate back to the root directory
cd ../ || {
    echo "Failed to navigate back to the root directory"
    exit 1
}
