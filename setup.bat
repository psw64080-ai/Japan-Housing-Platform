@echo off
REM ==================================================
REM Japan Housing Platform - 자동 설정 및 실행 스크립트
REM ==================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║  🏠 Japan Housing Platform Auto Setup      ║
echo ║     Java 17 + PostgreSQL + Spring Boot    ║
echo ╚════════════════════════════════════════════╝
echo.

REM ==================================================
REM 1. Java 17 설치
REM ==================================================
echo [1/4] 📦 Java 17 설치 중...
echo.

java -version >nul 2>&1
if errorlevel 1 (
    echo Java를 찾을 수 없습니다. 설치 중...
    REM SQL Server를 설치할 때 사용하는 winget으로 Java 설치 시도
    winget install GraalVM.GraalVMCommunity --accept-source-agreements --accept-package-agreements -e -h >nul 2>&1
    
    if errorlevel 1 (
        echo Java 설치 실패. Chocolatey 시도 중...
        powershell -Command "& {iex ((new-object net.webclient).DownloadString('https://community.chocolatey.org/install.ps1'))}" >nul 2>&1
        choco install openjdk17 -y >nul 2>&1
    )
) else (
    for /f "tokens=2" %%i in ('java -version 2^>^&1 ^| find "version"') do set JAVA_VER=%%i
    echo ✓ Java 버전: !JAVA_VER!
)

REM ==================================================
REM 2. PostgreSQL 설치
REM ==================================================
echo.
echo [2/4] 🗄️  PostgreSQL 설치 중...
echo.

psql --version >nul 2>&1
if errorlevel 1 (
    echo PostgreSQL을 찾을 수 없습니다. 설치 중...
    winget install PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements -e -h >nul 2>&1
    
    if errorlevel 1 (
        choco install postgresql15 -y --params "/Password=password123" >nul 2>&1
    )
) else (
    echo ✓ PostgreSQL이 이미 설치되어 있습니다.
)

REM ==================================================
REM 3. PostgreSQL 설정
REM ==================================================
echo.
echo [3/4] ⚙️  PostgreSQL 데이터베이스 설정 중...
echo.

REM PostgreSQL 서비스 시작
net start postgresql-x64-15 >nul 2>&1
if errorlevel 1 (
    echo PostgreSQL 서비스 시작 실패. 수동으로 시작해주세요.
    pause
) else (
    echo ✓ PostgreSQL 서비스 시작됨
)

REM 데이터베이스 초기화 (5초 대기)
timeout /t 5 /nobreak

REM psql 명령어로 데이터베이스 및 사용자 생성
psql -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = 'japan_housing'" >nul 2>&1
if errorlevel 1 (
    echo 데이터베이스 생성 중...
    psql -U postgres -h localhost -c "CREATE USER developer WITH PASSWORD 'password123';" >nul 2>&1
    psql -U postgres -h localhost -c "CREATE DATABASE japan_housing OWNER developer;" >nul 2>&1
    psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE japan_housing TO developer;" >nul 2>&1
    echo ✓ 데이터베이스 설정 완료
) else (
    echo ✓ 데이터베이스가 이미 존재합니다.
)

REM ==================================================
REM 4. Spring Boot 실행
REM ==================================================
echo.
echo [4/4] 🚀 Spring Boot 시작 중...
echo.

cd /d "C:\aitest\Japan-Housing-Platform\backend"

REM Maven으로 빌드 및 실행
echo Maven으로 프로젝트 빌드 및 실행 중...
call mvn clean spring-boot:run

pause
