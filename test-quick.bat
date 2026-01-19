@echo off
REM Task Management API - Quick Test Script
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║    TASK MANAGEMENT API - QUICK CURL TESTS                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Test 1: Welcome endpoint
echo 📋 HEALTH CHECKS
echo ────────────────────────────────────────────────────────────
echo Testing: GET /
curl -s http://localhost:5000/ | find "message" >nul && echo ✅ GET / - Welcome Endpoint OK || echo ❌ GET / - Failed

echo.
echo Testing: GET /api-docs
curl -s http://localhost:5000/api-docs | find "swagger" >nul && echo ✅ GET /api-docs - Swagger UI OK || echo ❌ GET /api-docs - Failed

echo.
echo 👤 USER MANAGEMENT TESTS
echo ────────────────────────────────────────────────────────────

REM Test User Registration
echo Testing: POST /users - Register User
for /f "tokens=*" %%A in ('curl -s -X POST http://localhost:5000/users ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"TestUser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"') do (
  echo %%A | find "success" >nul && echo ✅ POST /users - Register User OK || echo ❌ POST /users - Failed
)

echo.
echo Testing: GET /users
curl -s http://localhost:5000/users | find "success" >nul && echo ✅ GET /users - Get All Users OK || echo ❌ GET /users - Failed

echo.
echo 📝 TASK MANAGEMENT TESTS
echo ────────────────────────────────────────────────────────────

echo Testing: GET /tasks
curl -s http://localhost:5000/tasks | find "success" >nul && echo ✅ GET /tasks - Get All Tasks OK || echo ❌ GET /tasks - Failed

echo.
echo ✅ Quick tests completed!
echo.
pause
