#!/bin/env pwsh
# restart.ps1 - Comprehensive restart script for MERN School Management System

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     MERN School Management System - Restart Tool      " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Function to check and restart MongoDB if needed
function Ensure-MongoDBRunning {
    Write-Host "`n🔄 Checking MongoDB status..." -ForegroundColor Yellow
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    
    if ($null -eq $mongoService) {
        Write-Host "   ⚠️ MongoDB service not found. MongoDB may not be installed correctly." -ForegroundColor Red
        Write-Host "   ℹ️ The application requires MongoDB to function properly." -ForegroundColor Yellow
        return $false
    }
    
    if ($mongoService.Status -ne 'Running') {
        Write-Host "   ⚠️ MongoDB service is not running. Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service -Name MongoDB
            Start-Sleep -Seconds 3
            $mongoService = Get-Service -Name MongoDB
            if ($mongoService.Status -eq 'Running') {
                Write-Host "   ✅ MongoDB service started successfully" -ForegroundColor Green
                return $true
            }
            else {
                Write-Host "   ❌ Failed to start MongoDB service" -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "   ❌ Error starting MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "   ✅ MongoDB service is running" -ForegroundColor Green
        return $true
    }
}

# Kill any existing node processes
Write-Host "`n🔄 Stopping any running Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object { 
        Write-Host "   Stopping node process with ID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✅ All node processes stopped" -ForegroundColor Green
}
else {
    Write-Host "   ℹ️ No running node processes found" -ForegroundColor Gray
}

# Check for and kill any processes using our ports
$ports = @(5000, 3000)
Write-Host "`n🔄 Checking for processes using required ports..." -ForegroundColor Yellow
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
        else {
            Write-Host "   Port $port is free" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   Error checking port $port" -ForegroundColor Red
    }
}

# Ensure MongoDB is running
$mongodbRunning = Ensure-MongoDBRunning
if (-not $mongodbRunning) {
    Write-Host "`n⚠️ Warning: MongoDB is not running. The application may not function correctly." -ForegroundColor Yellow
}

# Check if node_modules exists and install if needed
Write-Host "`n🔄 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "e:\mca final\MERN-School-Management-System\backend\node_modules")) {
    Write-Host "   ⚠️ Backend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location "e:\mca final\MERN-School-Management-System\backend"
    Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend dependencies installed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Failed to install backend dependencies" -ForegroundColor Red
    }
}
else {
    Write-Host "   ✅ Backend dependencies exist" -ForegroundColor Green
}

if (-not (Test-Path "e:\mca final\MERN-School-Management-System\frontend\node_modules")) {
    Write-Host "   ⚠️ Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location "e:\mca final\MERN-School-Management-System\frontend"
    Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend dependencies installed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Failed to install frontend dependencies" -ForegroundColor Red
    }
}
else {
    Write-Host "   ✅ Frontend dependencies exist" -ForegroundColor Green
}

# Navigate to the backend directory
Set-Location "e:\mca final\MERN-School-Management-System\backend"
Write-Host "`n🚀 Starting backend server on port 5000..." -ForegroundColor Green

# Start the backend server
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

# Wait for the backend to initialize
Write-Host "`n⏳ Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Navigate to the frontend directory
Set-Location "e:\mca final\MERN-School-Management-System\frontend"
Write-Host "`n🚀 Starting frontend..." -ForegroundColor Green

# Start the frontend development server
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

Write-Host "`n🎉 MERN School Management System has been restarted!" -ForegroundColor Green
Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "   🔌 Backend: http://localhost:5000" -ForegroundColor Magenta

Write-Host "`n📋 Troubleshooting:" -ForegroundColor White
Write-Host "   - Run 'node connection-test.js' to check backend connectivity" -ForegroundColor White
Write-Host "   - Run 'node mongo-test.js' to check MongoDB status" -ForegroundColor White
Write-Host "   - Run 'node config-test.js' to verify configuration" -ForegroundColor White
Write-Host "`n=======================================================" -ForegroundColor Cyan
