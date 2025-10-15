#!/bin/bash

# FlowTracker Backend Setup Script
echo "🚀 Setting up FlowTracker Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Create PostgreSQL database: createdb flowtracker"
echo "3. Run migrations: cd backend && npm run migrate"
echo "4. Start development server: cd backend && npm run dev"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Health check: http://localhost:3001/health"
