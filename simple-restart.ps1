# Simplified restart script for MERN School Management System

Write-Host "Starting MERN School Management System..." -ForegroundColor Cyan

# Stop any existing Node.js processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process: $($_.Id)" -ForegroundColor Red
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Free up the ports we need
$ports = @(3000, 5000)
foreach ($port in $ports) {
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
        
        foreach ($process in $processes) {
            Write-Host "Killing process using port $port" -ForegroundColor Red
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        }
    }
    catch {
        # Just continue if there's an error
    }
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\backend' && npm start" -WindowStyle Normal

# Wait for the backend to initialize
Write-Host "Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start the frontend server
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\frontend' && npm start" -WindowStyle Normal

Write-Host "Both servers are now starting!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "Backend: http://localhost:5000" -ForegroundColor Magenta
