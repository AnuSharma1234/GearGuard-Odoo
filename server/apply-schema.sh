#!/bin/bash

# Apply Database Schema Script
# This script applies the init.sql schema to the GearGuard database

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults
POSTGRES_USER=${POSTGRES_USER:-gearguard_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-gearguard123}
POSTGRES_DB=${POSTGRES_DB:-gearguard_db}
POSTGRES_PORT=${POSTGRES_PORT:-5432}

echo "🔄 Applying database schema to ${POSTGRES_DB}..."

# Check if container is running
if ! docker ps | grep -q gearguard-db; then
    echo "❌ Error: Database container is not running."
    echo "   Start it with: docker-compose up -d db"
    exit 1
fi

# Apply the schema
docker exec -i gearguard-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < init.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema applied successfully!"
    echo ""
    echo "📋 Created tables:"
    docker exec -i gearguard-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
else
    echo "❌ Error applying database schema."
    exit 1
fi
