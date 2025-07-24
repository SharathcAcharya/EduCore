# Run backend and frontend for testing
$ErrorActionPreference = "Stop"

# Set working directory
cd "e:\mca final\MERN-School-Management-System"

# Function to check if a process is running on a port
function Test-PortInUse {
    param(
        [int]$Port
    )
    $connections = netstat -ano | Select-String -Pattern ".*:$Port\s.*LISTENING"
    return $connections.Count -gt 0
}

# Kill any processes using the ports
function Kill-ProcessOnPort {
    param(
        [int]$Port
    )
    $connections = netstat -ano | Select-String -Pattern ".*:$Port\s.*LISTENING"
    if ($connections.Count -gt 0) {
        foreach ($connection in $connections) {
            $line = $connection.ToString()
            $pid = ($line -split '\s+')[-1]
            Write-Host "Killing process $pid on port $Port"
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

# Kill processes on common ports
Kill-ProcessOnPort -Port 5000  # Backend
Kill-ProcessOnPort -Port 3000  # Frontend

# Start backend server
Write-Host "Starting backend server..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '.\backend'; npm start" -WindowStyle Normal

# Wait for backend to start
$backendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempts++
    Write-Host "Waiting for backend to start... ($attempts/$maxAttempts)"
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction SilentlyContinue
        if ($response.status -eq "ok") {
            $backendReady = $true
            Write-Host "Backend is ready!"
        }
    }
    catch {
        # Continue waiting
    }
}

if (-not $backendReady) {
    Write-Host "Backend failed to start within the timeout period. Please check for errors."
    exit 1
}

# Start frontend
Write-Host "Starting frontend..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '.\frontend'; npm start" -WindowStyle Normal

Write-Host "Both servers started successfully!"
Write-Host "- Backend: http://localhost:5000"
Write-Host "- Frontend: http://localhost:3000"
Write-Host ""
Write-Host "To test messaging functionality:"
Write-Host "1. Log in as a student and a teacher/admin in different browsers"
Write-Host "2. Navigate to the Messages section"
Write-Host "3. Try sending messages between users"
Write-Host ""
Write-Host "For automated testing, run: node message-diagnostics.js"
