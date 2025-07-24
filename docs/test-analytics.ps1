# Analytics System Test PowerShell Script
# This script helps automate testing of the analytics system with different user accounts

# Configuration
$BACKEND_URL = "http://localhost:5000"
$FRONTEND_URL = "http://localhost:3000"

function Test-AnalyticsSystem {
    param (
        [string]$SchoolId = $null,
        [string]$AdminEmail = $null,
        [string]$AdminPassword = $null
    )

    Write-Host "====== Analytics System Test ======" -ForegroundColor Cyan
    
    # If credentials are provided, try to login and get the school ID
    if ($AdminEmail -and $AdminPassword) {
        Write-Host "Testing login with email: $AdminEmail" -ForegroundColor Yellow
        try {
            $loginBody = @{
                email    = $AdminEmail
                password = $AdminPassword
            } | ConvertTo-Json
            
            $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/login/Admin" -Method Post -Body $loginBody -ContentType "application/json"
            Write-Host "Login successful: $($loginResponse.name)" -ForegroundColor Green
            
            # Extract school ID
            if ($loginResponse.role -eq "Admin") {
                $SchoolId = $loginResponse._id
            }
            elseif ($loginResponse.school) {
                if ($loginResponse.school -is [string]) {
                    $SchoolId = $loginResponse.school
                }
                else {
                    $SchoolId = $loginResponse.school._id
                }
            }
            
            Write-Host "Extracted School ID: $SchoolId" -ForegroundColor Green
        }
        catch {
            Write-Host "Login failed: $_" -ForegroundColor Red
            return
        }
    }
    
    # Test analytics data loading with the school ID
    if ($SchoolId) {
        Write-Host "Testing analytics data loading for school: $SchoolId" -ForegroundColor Yellow
        
        # Test loading students
        try {
            $studentsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/Students/$SchoolId" -Method Get
            Write-Host "Found $($studentsResponse.Count) students" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading students: $_" -ForegroundColor Red
        }
        
        # Test loading teachers
        try {
            $teachersResponse = Invoke-RestMethod -Uri "$BACKEND_URL/Teachers/$SchoolId" -Method Get
            Write-Host "Found $($teachersResponse.Count) teachers" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading teachers: $_" -ForegroundColor Red
        }
        
        # Test loading classes
        try {
            $classesResponse = Invoke-RestMethod -Uri "$BACKEND_URL/SclassList/$SchoolId" -Method Get
            Write-Host "Found $($classesResponse.Count) classes" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading classes: $_" -ForegroundColor Red
        }
        
        # Test loading subjects
        try {
            $subjectsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/subject/school/$SchoolId" -Method Get
            Write-Host "Found $($subjectsResponse.Count) subjects" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading subjects: $_" -ForegroundColor Red
        }
        
        # Test loading assignments
        try {
            $assignmentsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/Assignments/$SchoolId" -Method Get
            Write-Host "Found $($assignmentsResponse.Count) assignments" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading assignments: $_" -ForegroundColor Red
        }
        
        # Test loading events
        try {
            $eventsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/Events/$SchoolId" -Method Get
            Write-Host "Found $($eventsResponse.Count) events" -ForegroundColor Green
        }
        catch {
            Write-Host "Error loading events: $_" -ForegroundColor Red
        }
        
        Write-Host "All data loading tests completed" -ForegroundColor Cyan
    }
    else {
        Write-Host "No school ID provided or could be extracted" -ForegroundColor Red
    }
}

function Start-Application {
    Write-Host "Starting the MERN School Management System..." -ForegroundColor Cyan
    
    # Start backend server
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"e:\mca final\MERN-School-Management-System\backend`" && npm start" -WindowStyle Normal
    
    # Wait for backend to initialize
    Write-Host "Waiting for backend server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Start frontend server
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"e:\mca final\MERN-School-Management-System\frontend`" && npm start" -WindowStyle Normal
    
    # Wait for frontend to initialize
    Write-Host "Waiting for frontend server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "Application started. Backend: $BACKEND_URL, Frontend: $FRONTEND_URL" -ForegroundColor Green
}

function Open-BrowserToAnalytics {
    Write-Host "Opening browser to analytics page..." -ForegroundColor Yellow
    Start-Process "$FRONTEND_URL/Admin/login"
}

# Main script execution
if ($args.Count -eq 0) {
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\test-analytics.ps1 start - Start the application" -ForegroundColor White
    Write-Host "  .\test-analytics.ps1 test <schoolId> - Test analytics with school ID" -ForegroundColor White
    Write-Host "  .\test-analytics.ps1 login <email> <password> - Login and test analytics" -ForegroundColor White
    Write-Host "  .\test-analytics.ps1 browser - Open browser to analytics login" -ForegroundColor White
}
elseif ($args[0] -eq "start") {
    Start-Application
}
elseif ($args[0] -eq "test") {
    if ($args.Count -lt 2) {
        Write-Host "Please provide a school ID" -ForegroundColor Red
    }
    else {
        Test-AnalyticsSystem -SchoolId $args[1]
    }
}
elseif ($args[0] -eq "login") {
    if ($args.Count -lt 3) {
        Write-Host "Please provide email and password" -ForegroundColor Red
    }
    else {
        Test-AnalyticsSystem -AdminEmail $args[1] -AdminPassword $args[2]
    }
}
elseif ($args[0] -eq "browser") {
    Open-BrowserToAnalytics
}
