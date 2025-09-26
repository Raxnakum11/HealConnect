# =============================================================================
# HealConnect Setup Script (PowerShell)
# =============================================================================
# This script helps set up HealConnect with protected configurations

Write-Host "🏥 HealConnect Setup Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
function Test-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
        
        # Check version (should be 16+)
        $majorVersion = ($nodeVersion -replace 'v', '').Split('.')[0]
        if ([int]$majorVersion -lt 16) {
            Write-Warning "Node.js version should be 16 or higher. Current: $nodeVersion"
        }
        return $true
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        return $false
    }
}

# Check if MongoDB is accessible  
function Test-MongoDB {
    try {
        $mongoVersion = mongod --version
        Write-Success "MongoDB found locally"
    }
    catch {
        Write-Warning "MongoDB not found locally. You can:"
        Write-Host "  1. Install MongoDB locally, or"
        Write-Host "  2. Use MongoDB Atlas (cloud database)"
        Write-Host "  3. Continue and configure database connection later"
    }
}

# Setup backend
function Set-BackendEnvironment {
    Write-Status "Setting up backend..."
    
    Push-Location backend
    
    # Install dependencies
    Write-Status "Installing backend dependencies..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend dependencies installed"
    }
    else {
        Write-Error "Failed to install backend dependencies"
        Pop-Location
        exit 1
    }
    
    # Setup environment file
    if (-not (Test-Path ".env")) {
        Write-Status "Creating backend .env file..."
        if (Test-Path ".env.example.new") {
            Copy-Item ".env.example.new" ".env"
        }
        else {
            Copy-Item ".env.example" ".env"
        }
        Write-Success "Backend .env file created"
        Write-Warning "Please edit backend/.env with your actual configuration"
    }
    else {
        Write-Warning "Backend .env file already exists"
    }
    
    Pop-Location
}

# Setup frontend
function Set-FrontendEnvironment {
    Write-Status "Setting up frontend..."
    
    Push-Location frontend
    
    # Install dependencies
    Write-Status "Installing frontend dependencies..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend dependencies installed"
    }
    else {
        Write-Error "Failed to install frontend dependencies"
        Pop-Location
        exit 1
    }
    
    # Setup environment file
    if (-not (Test-Path ".env")) {
        Write-Status "Creating frontend .env file..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Frontend .env file created"
        }
        else {
            # Create basic .env for frontend
            @"
VITE_API_URL=http://localhost:9000/api
VITE_API_DEBUG=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Success "Frontend .env file created with default values"
        }
    }
    else {
        Write-Warning "Frontend .env file already exists"
    }
    
    Pop-Location
}

# Generate JWT secret
function New-JWTSecret {
    Write-Status "Generating JWT secret..."
    
    # Generate random JWT secret
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    $jwtSecret = [System.Convert]::ToBase64String($bytes)
    
    Write-Success "JWT secret generated: $jwtSecret"
    Write-Host ""
    Write-Warning "Please update JWT_SECRET in backend/.env with:"
    Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
    
    $rng.Dispose()
}

# Main setup function
function Start-Setup {
    Write-Host "This script will help you set up HealConnect with protected configurations."
    Write-Host "It will NOT expose any sensitive data in your repository."
    Write-Host ""
    
    # Checks
    if (-not (Test-NodeJS)) {
        exit 1
    }
    Test-MongoDB
    Write-Host ""
    
    # Setup
    Set-BackendEnvironment
    Write-Host ""
    Set-FrontendEnvironment
    Write-Host ""
    
    # Security
    New-JWTSecret
    Write-Host ""
    
    # Final instructions
    Write-Success "Setup completed! 🎉"
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Edit backend/.env with your actual database and email credentials"
    Write-Host "2. Start MongoDB (locally or use MongoDB Atlas)"
    Write-Host "3. Start the backend: cd backend; npm run dev"
    Write-Host "4. Start the frontend: cd frontend; npm run dev"
    Write-Host "5. Access the application at http://localhost:8080"
    Write-Host ""
    Write-Host "🔐 Security Notes:" -ForegroundColor Yellow
    Write-Host "- Your .env files are protected by .gitignore"
    Write-Host "- Never commit real credentials to version control"
    Write-Host "- Use Gmail App Password (not regular password) for email"
    Write-Host "- Generate a strong JWT secret for production"
    Write-Host ""
    Write-Host "📚 Documentation:" -ForegroundColor Green
    Write-Host "- README.md - Comprehensive setup guide"
    Write-Host "- CONTRIBUTING.md - Contribution guidelines"
    Write-Host "- SECURITY.md - Security best practices"
    Write-Host ""
    Write-Host "🆘 Need help? Check the README.md or create an issue on GitHub." -ForegroundColor Magenta
}

# Run main function
Start-Setup