#!/bin/bash

# =============================================================================
# HealConnect Setup Script
# =============================================================================
# This script helps set up HealConnect with protected configurations

echo "🏥 HealConnect Setup Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check version (should be 16+)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_warning "Node.js version should be 16 or higher. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is accessible
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_success "MongoDB found locally"
    else
        print_warning "MongoDB not found locally. You can:"
        echo "  1. Install MongoDB locally, or"
        echo "  2. Use MongoDB Atlas (cloud database)"
        echo "  3. Continue and configure database connection later"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend || exit
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        print_status "Creating backend .env file..."
        cp .env.example.new .env
        print_success "Backend .env file created"
        print_warning "Please edit backend/.env with your actual configuration"
    else
        print_warning "Backend .env file already exists"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend || exit
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        print_status "Creating frontend .env file..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Frontend .env file created"
        else
            # Create basic .env for frontend
            echo "VITE_API_URL=http://localhost:9000/api" > .env
            echo "VITE_API_DEBUG=true" >> .env
            print_success "Frontend .env file created with default values"
        fi
    else
        print_warning "Frontend .env file already exists"
    fi
    
    cd ..
}

# Generate JWT secret
generate_jwt_secret() {
    print_status "Generating JWT secret..."
    
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_success "JWT secret generated: $JWT_SECRET"
        echo ""
        print_warning "Please update JWT_SECRET in backend/.env with:"
        echo "JWT_SECRET=$JWT_SECRET"
    else
        print_warning "OpenSSL not found. Please generate a 32+ character JWT secret manually"
        print_status "You can use: https://generate-secret.vercel.app/32"
    fi
}

# Main setup function
main() {
    echo "This script will help you set up HealConnect with protected configurations."
    echo "It will NOT expose any sensitive data in your repository."
    echo ""
    
    # Checks
    check_nodejs
    check_mongodb
    echo ""
    
    # Setup
    setup_backend
    echo ""
    setup_frontend
    echo ""
    
    # Security
    generate_jwt_secret
    echo ""
    
    # Final instructions
    print_success "Setup completed! 🎉"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Edit backend/.env with your actual database and email credentials"
    echo "2. Start MongoDB (locally or use MongoDB Atlas)"
    echo "3. Start the backend: cd backend && npm run dev"
    echo "4. Start the frontend: cd frontend && npm run dev"
    echo "5. Access the application at http://localhost:8080"
    echo ""
    echo "🔐 Security Notes:"
    echo "- Your .env files are protected by .gitignore"
    echo "- Never commit real credentials to version control"
    echo "- Use Gmail App Password (not regular password) for email"
    echo "- Generate a strong JWT secret for production"
    echo ""
    echo "📚 Documentation:"
    echo "- README.md - Comprehensive setup guide"
    echo "- CONTRIBUTING.md - Contribution guidelines"
    echo "- SECURITY.md - Security best practices"
    echo ""
    echo "🆘 Need help? Check the README.md or create an issue on GitHub."
}

# Run main function
main