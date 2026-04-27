# OpenMTSciEd API Test Script

Write-Host "=== OpenMTSciEd API Function Test ===" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing health check endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "PASS: Health check passed: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "FAIL: Health check failed: $_" -ForegroundColor Red
}

# Test 2: User Registration
Write-Host "`n2. Testing user registration..." -ForegroundColor Yellow
$randomId = Get-Random
$registerBody = @{
    username = "apitest$randomId"
    email = "apitest$randomId@example.com"
    password = "test123"
} | ConvertTo-Json

try {
    $registerResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
    Write-Host "PASS: User registration successful" -ForegroundColor Green
} catch {
    Write-Host "FAIL: User registration failed: $_" -ForegroundColor Red
}

# Test 3: User Login
Write-Host "`n3. Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    username = "testuser2"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    if ($loginResult.access_token) {
        Write-Host "PASS: User login successful, token received" -ForegroundColor Green
        $token = $loginResult.access_token
    } else {
        Write-Host "WARN: Login successful but no token returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL: User login failed: $_" -ForegroundColor Red
}

# Test 4: Get Current User Info (requires token)
if ($token) {
    Write-Host "`n4. Testing get current user info..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $userInfo = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" -Method Get -Headers $headers
        Write-Host "PASS: Get user info successful: $($userInfo.username)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: Get user info failed: $_" -ForegroundColor Red
    }
}

# Test 5: Learning Path API
Write-Host "`n5. Testing learning path API..." -ForegroundColor Yellow
try {
    $pathResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/learning/path?user_id=1" -Method Get
    Write-Host "PASS: Learning path API responded normally" -ForegroundColor Green
} catch {
    Write-Host "WARN: Learning path API may require authentication or parameters: $_" -ForegroundColor Yellow
}

# Test 6: Questions API
Write-Host "`n6. Testing questions API..." -ForegroundColor Yellow
try {
    $questionsResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/learning/questions?limit=5" -Method Get
    Write-Host "PASS: Questions API responded normally, got $($questionsResult.items.Count) questions" -ForegroundColor Green
} catch {
    Write-Host "WARN: Questions API may require authentication: $_" -ForegroundColor Yellow
}

Write-Host "`n=== API Test Complete ===" -ForegroundColor Green