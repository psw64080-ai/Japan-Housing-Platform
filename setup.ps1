# Japan Housing Platform Auto Setup Script
# Java 17, PostgreSQL, Spring Boot 자동 설치 및 실행

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🏠 Japan Housing Auto Setup & Run       ║" -ForegroundColor Cyan
Write-Host "║     Java 17 + PostgreSQL + Spring Boot  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ==================== Step 1: Java 17 설치 ====================
Write-Host "[1/4] 📦 Java 17 확인 및 설치..." -ForegroundColor Yellow
$javaCheck = java -version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Java 미설치 감지. 설치 중..." -ForegroundColor Red
    
    # Chocolatey 설치 확인
    $chocoCheck = choco --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Chocolatey 설치 중..." -ForegroundColor Gray
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.ServicePointClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    Write-Host "   Java 17 설치 중 (약 2-3분)..." -ForegroundColor Gray
    choco install openjdk17 -y --ignore-checksums
    
    # 환경변수 갱신
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    $version = $javaCheck | Select-String "version"
    Write-Host "✓ Java 설치됨: $version" -ForegroundColor Green
}

# ==================== Step 2: PostgreSQL 설치 ====================
Write-Host ""
Write-Host "[2/4] 🗄️  PostgreSQL 확인 및 설치..." -ForegroundColor Yellow
$pgCheck = psql --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PostgreSQL 미설치 감지. 설치 중..." -ForegroundColor Red
    Write-Host "   PostgreSQL 설치 중 (약 3-5분)..." -ForegroundColor Gray
    
    # PostgreSQL 설치 (기본 포트 5432, 사용자 postgres)
    choco install postgresql15 -y --params "/Password=`'password123`'" --ignore-checksums
    
    # 환경변수 갱신
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "✓ PostgreSQL 설치됨" -ForegroundColor Green
}

# ==================== Step 3: PostgreSQL 데이터베이스 설정 ====================
Write-Host ""
Write-Host "[3/4] ⚙️  PostgreSQL 데이터베이스 설정..." -ForegroundColor Yellow

Write-Host "   PostgreSQL 서비스 시작 중..." -ForegroundColor Gray
Start-Service postgresql-x64-15 -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 데이터베이스 생성 (postgres 기본 사용자)
Write-Host "   데이터베이스 및 사용자 생성 중..." -ForegroundColor Gray

$dbSetupScript = @"
-- Japan Housing Platform Database Setup
CREATE USER IF NOT EXISTS developer WITH PASSWORD 'password123';
CREATE DATABASE IF NOT EXISTS japan_housing OWNER developer;
GRANT ALL PRIVILEGES ON DATABASE japan_housing TO developer;
"@

# psql로 SQL 실행
$dbSetupScript | psql -U postgres -h localhost 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {  # 1 = 이미 존재
    Write-Host "✓ PostgreSQL 설정 완료" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL 설정 중 문제 발생 (이미 설정되었을 수 있음)" -ForegroundColor Yellow
}

# ==================== Step 4: Spring Boot 실행 ====================
Write-Host ""
Write-Host "[4/4] 🚀 Spring Boot 시작..." -ForegroundColor Yellow
Write-Host "   Backend 디렉토리로 이동..." -ForegroundColor Gray

Set-Location "C:\aitest\Japan-Housing-Platform\backend"

Write-Host "   Maven으로 프로젝트 빌드 및 실행..." -ForegroundColor Gray
Write-Host "   (첫 실행: 약 2-3분 소요)" -ForegroundColor Gray
Write-Host ""

# Maven으로 빌드 및 실행
mvn clean spring-boot:run

Write-Host ""
Write-Host "🎉 Spring Boot 종료됨" -ForegroundColor Cyan
