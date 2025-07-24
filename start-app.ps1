#!/bin/env pwsh
# start-app.ps1 - Script to start the MERN School Management System

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       MERN School Management System Starter           " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Stop any existing Node.js processes
Write-Host "`n🔄 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name node, npm -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "   Stopping process: $($_.Name) (ID: $($_.Id))" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Free up the ports we need
Write-Host "`n🔄 Freeing up required ports..." -ForegroundColor Yellow
$ports = @(3000, 5000, 5001)
foreach ($port in $ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            $procInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
            if ($procInfo) {
                Write-Host "   Killing process $($procInfo.Name) (ID: $process) using port $port" -ForegroundColor Red
                Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            }
            else {
                Write-Host "   Killing unknown process (ID: $process) using port $port" -ForegroundColor Red
                Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        Write-Host "   Port $port is free" -ForegroundColor Green
    }
}

# Check if MongoDB is running
Write-Host "`n🔄 Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "   ✅ MongoDB service is running" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️ MongoDB service not found or not running" -ForegroundColor Red
    Write-Host "   ℹ️ The application may not function correctly without MongoDB" -ForegroundColor Yellow
    Write-Host "   ℹ️ Please ensure MongoDB is installed and running" -ForegroundColor Yellow
}

# Install dependencies if needed
Write-Host "`n🔄 Checking for node_modules in backend..." -ForegroundColor Yellow
if (-not (Test-Path "e:\mca final\MERN-School-Management-System\backend\node_modules")) {
    Write-Host "   ⚠️ Backend node_modules not found, installing dependencies..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\backend' && npm install" -Wait -NoNewWindow
}
else {
    Write-Host "   ✅ Backend dependencies are installed" -ForegroundColor Green
}

Write-Host "`n🔄 Checking for node_modules in frontend..." -ForegroundColor Yellow
if (-not (Test-Path "e:\mca final\MERN-School-Management-System\frontend\node_modules")) {
    Write-Host "   ⚠️ Frontend node_modules not found, installing dependencies..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\frontend' && npm install" -Wait -NoNewWindow
}
else {
    Write-Host "   ✅ Frontend dependencies are installed" -ForegroundColor Green
}

# Start the backend server
Write-Host "`n🚀 Starting backend server on port 5000..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\backend' && npm start" -WindowStyle Normal

# Wait for the backend to initialize
Write-Host "`n⏳ Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start the frontend server
Write-Host "`n🚀 Starting frontend server on port 3000..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'e:\mca final\MERN-School-Management-System\frontend' && npm start" -WindowStyle Normal

Write-Host "`n🎉 Both servers are now starting up!" -ForegroundColor Cyan
Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "   🔌 Backend: http://localhost:5000" -ForegroundColor Magenta
Write-Host "`n📋 Troubleshooting:" -ForegroundColor White
Write-Host "   - Run 'node connection-test.js' to check backend connectivity" -ForegroundColor White
Write-Host "   - Run 'node config-test.js' to verify configuration" -ForegroundColor White
Write-Host "   - If servers fail to start, run restart.ps1 script" -ForegroundColor White
Write-Host "`n=======================================================" -ForegroundColor Cyan
