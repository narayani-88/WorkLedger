@echo off
echo ==========================================
echo WorkLedger Multi-Tenant Platform Startup
echo ==========================================

start "WorkLedger: Auth Service (8081)" cmd /k "cd auth-service && mvn spring-boot:run"
start "WorkLedger: Tenant Service (8082)" cmd /k "cd tenant-service && mvn spring-boot:run"
start "WorkLedger: Core Service (8083)" cmd /k "cd core-service && mvn spring-boot:run"
start "WorkLedger: Frontend (3000)" cmd /k "cd frontend && npm run dev"

echo All services are starting in separate windows...
echo Check individual windows for logs.
echo ==========================================
