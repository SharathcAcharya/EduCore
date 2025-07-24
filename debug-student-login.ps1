# Student Login Debugging Script
# This script restarts the backend server with enhanced logging for student login issues

# Define paths
$backendPath = "e:\mca final\MERN-School-Management-System\backend"
$frontendPath = "e:\mca final\MERN-School-Management-System\frontend"

# Function to check if a process is running on port 5000
function Test-PortInUse {
    param($port)
    
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return ($connection -ne $null)
}

# Function to kill process using port 5000
function Stop-ProcessOnPort {
    param($port)
    
    $processInfo = netstat -ano | findstr :$port | findstr LISTENING
    if ($processInfo) {
        $processId = ($processInfo -split ' ')[-1]
        Write-Host "Stopping process with ID $processId on port $port"
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 1
    }
}

# Check if port 5000 is in use
if (Test-PortInUse 5000) {
    Write-Host "Port 5000 is already in use. Stopping the process..."
    Stop-ProcessOnPort 5000
}

# Clear the console
Clear-Host

Write-Host "=== Student Login Debugging Mode ===" -ForegroundColor Cyan
Write-Host "This script will restart the backend server with enhanced logging for student login"

# Navigate to backend directory
Set-Location $backendPath

# Set environment variables for enhanced debugging
$env:DEBUG_STUDENT_LOGIN = "true"
$env:NODE_ENV = "development"

# Install any missing dependencies
Write-Host "`nChecking for missing dependencies..." -ForegroundColor Yellow
npm install

# Start the backend server with enhanced logging
Write-Host "`nStarting backend server in debug mode..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $backendPath

# Wait for the server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test server connection
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/ping" -Method Get -ErrorAction Stop
    Write-Host "`n✅ Server is running and responding!" -ForegroundColor Green
    Write-Host "Server time: $($response.serverTime)"
    Write-Host "Port: $($response.port)"
}
catch {
    Write-Host "`n❌ Server failed to start or is not responding: $_" -ForegroundColor Red
    exit
}

# Show diagnostic options
Write-Host "`n=== Diagnostic Options ===" -ForegroundColor Cyan
Write-Host "1. Run student login diagnostic tool"
Write-Host "2. Fix student data in database"
Write-Host "3. Test frontend connection to backend"
Write-Host "4. Reload backend server"
Write-Host "5. Exit"

while ($true) {
    $option = Read-Host "`nEnter option number"
    
    switch ($option) {
        "1" {
            Write-Host "`nRunning student login diagnostic tool..." -ForegroundColor Yellow
            Set-Location "e:\mca final\MERN-School-Management-System"
            node student-login-diagnostic.js
        }
        "2" {
            Write-Host "`nRunning database fixing tool..." -ForegroundColor Yellow
            Set-Location "e:\mca final\MERN-School-Management-System"
            node fix-student-login.js
        }
        "3" {
            Write-Host "`nTesting frontend connection to backend..." -ForegroundColor Yellow
            try {
                # Check if frontend server is running
                $frontendStatus = netstat -ano | findstr :3000 | findstr LISTENING
                if (-not $frontendStatus) {
                    Write-Host "Frontend server is not running. Starting it now..." -ForegroundColor Yellow
                    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory $frontendPath
                    Start-Sleep -Seconds 5
                }
                
                Write-Host "Frontend should be available at http://localhost:3000" -ForegroundColor Green
                Write-Host "Please open the URL in your browser and try logging in" -ForegroundColor Green
            }
            catch {
                Write-Host "Error starting frontend: $_" -ForegroundColor Red
            }
        }
        "4" {
            Write-Host "`nReloading backend server..." -ForegroundColor Yellow
            if (Test-PortInUse 5000) {
                Stop-ProcessOnPort 5000
                Start-Sleep -Seconds 1
            }
            
            Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $backendPath
            Start-Sleep -Seconds 3
            
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:5000/ping" -Method Get -ErrorAction Stop
                Write-Host "✅ Server restarted successfully!" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Server failed to restart: $_" -ForegroundColor Red
            }
        }
        "5" {
            Write-Host "`nExiting..." -ForegroundColor Yellow
            if (Test-PortInUse 5000) {
                $stopServer = Read-Host "Do you want to stop the backend server? (y/n)"
                if ($stopServer -eq "y") {
                    Stop-ProcessOnPort 5000
                    Write-Host "Backend server stopped." -ForegroundColor Green
                }
            }
            exit
        }
        default {
            Write-Host "Invalid option, please try again" -ForegroundColor Red
        }
    }
}
