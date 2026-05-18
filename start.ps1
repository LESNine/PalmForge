$Host.UI.RawUI.WindowTitle = "PalmForge - PALM Parameter Configurator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PalmForge - PALM Parameter Configurator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Clean up residual ports
Write-Host "[Clean] Cleaning residual ports..." -ForegroundColor Yellow
$ports = @(5173, 5174, 5175, 5176, 5177)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Terminate PID $($proc.Id) occupying port $port" -ForegroundColor DarkYellow
            $proc.Kill()
        }
    }
}
Start-Sleep -Seconds 1

# Start dev server
Write-Host "[Start] Starting dev server..." -ForegroundColor Green
$devProcess = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -PassThru -WindowStyle Normal

# Wait for server
Write-Host "[Wait] Waiting for server..." -ForegroundColor Yellow
$foundPort = $null
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    foreach ($port in $ports) {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn -and $conn.State -eq "Listen") {
            $foundPort = $port
            break
        }
    }
    if ($foundPort) { break }
}

if ($foundPort) {
    Write-Host "[Browser] Opening http://localhost:$foundPort ..." -ForegroundColor Green
    Start-Process "http://localhost:$foundPort"
} else {
    Write-Host "[Warning] No port detected, please visit http://localhost:5173 manually" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server started!" -ForegroundColor Cyan
Write-Host "  Press Q to close server and exit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for key
while ($true) {
    if ($Host.UI.RawUI.KeyAvailable) {
        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

# Shutdown
Write-Host ""
Write-Host "[Close] Shutting down server..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            $proc.Kill()
        }
    }
}
if ($devProcess -and !$devProcess.HasExited) {
    $devProcess.Kill()
}
Write-Host "[Done] PalmForge closed." -ForegroundColor Green
Start-Sleep -Seconds 2