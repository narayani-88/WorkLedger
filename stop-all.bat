@echo off
echo ==========================================
echo Shutting down WorkLedger Platform...
echo ==========================================

echo Stopping Java services...
taskkill /FI "WINDOWTITLE eq WorkLedger: Auth Service (8081)*" /T /F
taskkill /FI "WINDOWTITLE eq WorkLedger: Tenant Service (8082)*" /T /F
taskkill /FI "WINDOWTITLE eq WorkLedger: Core Service (8083)*" /T /F

echo Stopping Frontend...
taskkill /FI "WINDOWTITLE eq WorkLedger: Frontend (3000)*" /T /F

echo.
echo All specialized windows have been requested to close.
echo If any window remains, you can manually close it or press Ctrl+C.
echo ==========================================
pause
