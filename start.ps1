$Host.UI.RawUI.WindowTitle = "PalmForge - PALM Parameter Configurator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PalmForge - PALM Parameter Configurator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "[Clean] Cleaning residual ports..." -ForegroundColor Yellow
$ports = @(5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180)
foreach ($port in $ports) {
    $line = netstat -aon 2>$null | Select-String ":${port}\s"
    if ($line) {
        $pid = ($line -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Write-Host "  Terminate PID $pid occupying port $port" -ForegroundColor DarkYellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 1

Write-Host "[Start] Starting dev server..." -ForegroundColor Green
$devProcess = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -PassThru -WindowStyle Normal

Write-Host "[Wait] Waiting for server..." -ForegroundColor Yellow
$foundPort = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    foreach ($port in $ports) {
        $line = netstat -aon 2>$null | Select-String ":${port}\s.*LISTENING"
        if ($line) {
            $foundPort = $port
            break
        }
    }
    if ($foundPort) { break }
    Write-Host "  Waiting... ($($i+1)s)" -ForegroundColor DarkGray
}

if ($foundPort) {
    Write-Host "[Browser] Opening http://localhost:$foundPort ..." -ForegroundColor Green
    Start-Process "http://localhost:$foundPort"
} else {
    Write-Host "[Warning] No port detected after 30s" -ForegroundColor Red
    Write-Host "  Please check if Node.js is installed and try http://localhost:5173 manually" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server started!" -ForegroundColor Cyan
Write-Host "  Press Q to close server and exit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {
    if ($Host.UI.RawUI.KeyAvailable) {
        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "[Close] Shutting down server..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $line = netstat -aon 2>$null | Select-String ":${port}\s.*LISTENING"
    if ($line) {
        $pid = ($line -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
if ($devProcess -and !$devProcess.HasExited) {
    $devProcess.Kill()
}
Write-Host "[Done] PalmForge closed." -ForegroundColor Green
Start-Sleep -Seconds 2