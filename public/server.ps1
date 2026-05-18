[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "PalmForge - PALM Parameter Configurator"

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "    PalmForge - PALM Parameter Configurator" -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

$distPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $distPath

if (-not (Test-Path (Join-Path $distPath "index.html"))) {
    Write-Host "[Error] index.html not found in current directory!" -ForegroundColor Red
    Write-Host "  Please make sure server.ps1 is in the same folder as index.html" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$ports = @(8080, 8081, 8082, 8083, 8084, 8085)
$selectedPort = $null
foreach ($p in $ports) {
    $inUse = netstat -aon 2>$null | Select-String ":${p}\s.*LISTENING"
    if (-not $inUse) { $selectedPort = $p; break }
}
if (-not $selectedPort) {
    Write-Host "[Error] No available port found (tried 8080-8085)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[Start] Starting server on port $selectedPort..." -ForegroundColor Green

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$selectedPort/")

try {
    $listener.Start()
} catch {
    Write-Host "[Error] Failed to start server: $_" -ForegroundColor Red
    Write-Host "  Try running as administrator or use a different port" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$url = "http://localhost:$selectedPort"
Write-Host "[OK] Server started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  PalmForge: $url" -ForegroundColor White
Write-Host ""
Write-Host "  Press Q to stop the server and exit" -ForegroundColor DarkGray
Write-Host ""

Start-Sleep -Milliseconds 500
Start-Process $url

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.mjs'  = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.txt'  = 'text/plain; charset=utf-8'
    '.map'  = 'application/json'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

$asyncResult = $listener.BeginGetContext($null, $null)
$running = $true

while ($running) {
    if ($asyncResult.IsCompleted) {
        try {
            $context = $listener.EndGetContext($asyncResult)
            $request = $context.Request
            $response = $context.Response

            $localPath = $request.Url.LocalPath
            if ($localPath -eq '/') { $localPath = '/index.html' }

            $relativePath = $localPath.Substring(1).Replace('/', '\')
            $filePath = Join-Path $distPath $relativePath

            if (Test-Path $filePath -PathType Leaf) {
                $buffer = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = $mimeTypes[$ext]
                if (-not $contentType) { $contentType = 'application/octet-stream' }

                $response.ContentType = $contentType
                $response.ContentLength64 = $buffer.Length
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
                $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
                $response.ContentType = 'text/plain; charset=utf-8'
                $response.ContentLength64 = $notFound.Length
                $response.OutputStream.Write($notFound, 0, $notFound.Length)
            }
            $response.Close()
        } catch {
            if ($running) {
                Write-Host "[Warn] Request error: $_" -ForegroundColor DarkYellow
            }
        }

        if ($listener.IsListening) {
            $asyncResult = $listener.BeginGetContext($null, $null)
        }
    }

    if ($Host.UI.RawUI.KeyAvailable) {
        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
            $running = $false
        }
    }

    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host "[Stop] Shutting down server..." -ForegroundColor Yellow
$listener.Stop()
Write-Host "[Done] PalmForge closed." -ForegroundColor Green
Start-Sleep -Seconds 1
