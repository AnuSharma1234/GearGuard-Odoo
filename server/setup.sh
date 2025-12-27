#!/bin/bash

# GearGuard Server Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 GearGuard Server Setup"
echo "========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. You can edit it to customize settings."
    else
        echo "⚠️  .env.example not found. Using default values."
    fi
else
    echo "✅ .env file already exists"
fi
echo ""

# Create postgres_data directory with proper permissions
echo "📁 Setting up postgres_data directory..."
mkdir -p postgres_data
chmod 777 postgres_data
echo "✅ postgres_data directory ready"
echo ""

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose down -v 2>/dev/null || true
echo ""

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 3

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps
echo ""

# Test the API
echo "🧪 Testing API endpoint..."
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ API is responding at http://localhost:8000"
    echo "✅ API Documentation: http://localhost:8000/docs"
else
    echo "⚠️  API might still be starting. Check logs with: docker-compose logs api"
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f        # View logs"
echo "  docker-compose down           # Stop services"
echo "  docker-compose up -d          # Start services"
echo "  docker-compose restart        # Restart services"
echo ""
