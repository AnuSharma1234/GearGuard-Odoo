#!/bin/bash

# Apply Seed Data Script
# This script loads test data into the GearGuard database

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults
POSTGRES_USER=${POSTGRES_USER:-gearguard_user}
POSTGRES_DB=${POSTGRES_DB:-gearguard_db}

echo "🌱 Loading seed data into ${POSTGRES_DB}..."
echo ""
echo "⚠️  WARNING: This will DELETE ALL existing data!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Seed data loading cancelled."
    exit 0
fi

# Check if container is running
if ! docker ps | grep -q gearguard-db; then
    echo "❌ Error: Database container is not running."
    echo "   Start it with: docker-compose up -d db"
    exit 1
fi

# Apply the seed data
docker exec -i gearguard-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < seed_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed data loaded successfully!"
    echo ""
    echo "📊 Test credentials:"
    echo "   Admin:      alice.admin@gearguard.com"
    echo "   Manager:    bob.manager@gearguard.com"
    echo "   Technician: dave.tech@gearguard.com"
    echo "   User:       henry.user@gearguard.com"
    echo ""
    echo "   Password: (hashed - $2b$12$placeholder_hash...)"
    echo "   ⚠️  Update password_hash with real bcrypt hashes!"
else
    echo "❌ Error loading seed data."
    exit 1
fi
