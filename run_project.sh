#!/bin/bash
echo "=========================================="
echo "      LEXILEARN - PROJECT STARTUP       "
echo "=========================================="

echo "[1/4] Checking dependencies..."
if ! command -v python3 &> /dev/null
then
    echo "ERROR: Python is not installed or not in PATH."
    exit 1
fi

if command -v bun &> /dev/null
then
    RUNTIME="bun"
elif command -v npm &> /dev/null
then
    RUNTIME="npm"
else
    echo "ERROR: Neither Bun nor Node/NPM are installed."
    exit 1
fi

echo "[2/4] Installing backend dependencies..."
python3 -m pip install -r server/requirements.txt || echo "[WARNING] Backend installation failed."

echo "[3/4] Installing frontend dependencies..."
if [ "$RUNTIME" == "bun" ]; then
    bun install
else
    npm install
fi

echo "[4/4] Starting project (Backend + Frontend)..."
if [ "$RUNTIME" == "bun" ]; then
    bun run start-all
else
    npm run start-all
fi
