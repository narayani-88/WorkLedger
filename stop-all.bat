@echo off
echo ==========================================
echo Shutting down WorkLedger Platform...
echo ==========================================

echo Stopping Auth Service (Port 8081)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do taskkill /F /PID %%a 2>nul

echo Stopping Tenant Service (Port 8082)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082') do taskkill /F /PID %%a 2>nul

echo Stopping Core Service (Port 8083)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8083') do taskkill /F /PID %%a 2>nul

echo Stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul

echo.
echo Killing any remaining Java processes...
taskkill /F /IM java.exe 2>nul

echo Killing any remaining Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo ==========================================
echo All services stopped.
echo ==========================================
pause
