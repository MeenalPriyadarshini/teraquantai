$ErrorActionPreference = "Stop"

# Run this script from any PowerShell location.
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

# Load the repository's private .env file into this PowerShell process.
if (!(Test-Path ".env")) {
    throw "Missing .env. Run: Copy-Item .env.example .env, then fill in your local values."
}

Get-Content ".env" | ForEach-Object {
    $Line = $_.Trim()
    if ($Line -and !$Line.StartsWith("#") -and $Line.Contains("=")) {
        $Parts = $Line.Split("=", 2)
        [Environment]::SetEnvironmentVariable($Parts[0].Trim(), $Parts[1].Trim(), "Process")
    }
}

if (!$env:POSTGRES_DB -or !$env:POSTGRES_USER -or !$env:POSTGRES_PASSWORD) {
    throw "POSTGRES_DB, POSTGRES_USER and POSTGRES_PASSWORD must be set in .env."
}
if (!$env:POSTGRES_PORT) { $env:POSTGRES_PORT = "5433" }

# Spring Boot uses the host-side Docker port (5433 by default).
$env:DATABASE_URL = "jdbc:postgresql://127.0.0.1:$($env:POSTGRES_PORT)/$($env:POSTGRES_DB)"
$env:DATABASE_USERNAME = $env:POSTGRES_USER
$env:DATABASE_PASSWORD = $env:POSTGRES_PASSWORD
if (!$env:FRONTEND_URL) { $env:FRONTEND_URL = "http://localhost:4200" }
if (!$env:MAIL_ENABLED) { $env:MAIL_ENABLED = "true" }
if (!$env:MAIL_HOST) { $env:MAIL_HOST = "127.0.0.1" }
if (!$env:MAIL_PORT) { $env:MAIL_PORT = "1025" }
if (!$env:MAIL_AUTH) { $env:MAIL_AUTH = "false" }
if (!$env:MAIL_STARTTLS) { $env:MAIL_STARTTLS = "false" }

Write-Host "Starting PostgreSQL..."
docker compose up -d postgres mailpit
if ($LASTEXITCODE -ne 0) { throw "Docker Compose could not start PostgreSQL. Check Docker Desktop." }

Write-Host "Waiting for PostgreSQL to become ready..."
$Ready = $false
for ($Attempt = 0; $Attempt -lt 30; $Attempt++) {
    docker compose exec -T postgres pg_isready -U $env:POSTGRES_USER -d $env:POSTGRES_DB *> $null
    if ($LASTEXITCODE -eq 0) { $Ready = $true; break }
    Start-Sleep -Seconds 2
}
if (!$Ready) { throw "PostgreSQL did not become ready within 60 seconds." }

Write-Host "Starting TerraQuantAI backend on http://localhost:8081 ..."
Push-Location "backend"
try { gradle bootRun }
finally { Pop-Location }
