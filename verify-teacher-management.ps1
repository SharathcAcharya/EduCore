# Teacher Management Verification Script
Write-Host "Running Teacher Management Verification..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Navigate to the project directory
$projectDir = "e:\mca final\MERN-School-Management-System"
Set-Location $projectDir

# Run the verification script
Write-Host "Running verification script..." -ForegroundColor Yellow
node verify-teacher-management.js

# Check if the app is running
Write-Host "`nVerifying application status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Application is running correctly" -ForegroundColor Green
    } else {
        Write-Host "Application is running but returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Application doesn't seem to be running or health endpoint not available" -ForegroundColor Red
    
    # Suggest starting the application
    Write-Host "`nWould you like to start the application? (Y/N)" -ForegroundColor Cyan
    $answer = Read-Host
    if ($answer -eq "Y" -or $answer -eq "y") {
        Write-Host "Starting the application..." -ForegroundColor Green
        npm start
    }
}

Write-Host "`nVerification complete. Teacher management should now work properly." -ForegroundColor Green
