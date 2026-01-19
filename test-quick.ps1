#!/usr/bin/env pwsh

Write-Host "`n========== TASK MANAGEMENT API - QUICK API TESTS ==========" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$passed = 0
$failed = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Name,
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $url = "$baseUrl$Path"
        $params = @{
            Uri = $url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Name" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "❌ $Name" -ForegroundColor Red
            Write-Host "   Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        Write-Host "❌ $Name" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

# Health Checks
Write-Host "📋 HEALTH CHECKS" -ForegroundColor Yellow
Write-Host "─" * 60 -ForegroundColor Gray
Test-Endpoint "GET" "/" "Welcome Endpoint" -ExpectedStatus 200
Test-Endpoint "GET" "/api-docs" "Swagger UI" -ExpectedStatus 200

# User Management
Write-Host "`n👤 USER MANAGEMENT TESTS" -ForegroundColor Yellow
Write-Host "─" * 60 -ForegroundColor Gray

$userData = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
}
Test-Endpoint "POST" "/users" "Register New User" -Body $userData -ExpectedStatus 201

Test-Endpoint "GET" "/users" "Get All Users" -ExpectedStatus 200

# Error cases
Write-Host "`n⚠️  ERROR HANDLING TESTS" -ForegroundColor Yellow
Write-Host "─" * 60 -ForegroundColor Gray

$missingEmail = @{
    name = "Test User"
    password = "password123"
}
Test-Endpoint "POST" "/users" "Register with missing email (should fail)" -Body $missingEmail -ExpectedStatus 400

$weakPassword = @{
    name = "Weak Pass User"
    email = "weakpass@example.com"
    password = "123"
}
Test-Endpoint "POST" "/users" "Register with weak password (should fail)" -Body $weakPassword -ExpectedStatus 400

# Task Management
Write-Host "`n📝 TASK MANAGEMENT TESTS" -ForegroundColor Yellow
Write-Host "─" * 60 -ForegroundColor Gray

Test-Endpoint "GET" "/tasks" "Get All Tasks" -ExpectedStatus 200

# Summary
Write-Host "`n========== TEST SUMMARY ==========" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan

$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

Write-Host "📊 Total Tests: $total"
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "📈 Success Rate: $successRate%`n"

if ($failed -eq 0) {
    Write-Host "🎉 All tests passed! API is working correctly.`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the output above for details.`n" -ForegroundColor Yellow
}
