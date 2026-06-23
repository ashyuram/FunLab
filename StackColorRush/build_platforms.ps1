# Stack Color Rush Multi-Platform Packager Script
# This script compiles index.html into platform-specific bundles (Facebook Instant and Poki)
# by stripping out code blocks meant for other platforms.

Clear-Host
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Stack Color Rush - Platform Builder & Packager   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$WorkspaceDir = "d:\Github\FunLab\StackColorRush"
$SourceIndex = Join-Path $WorkspaceDir "index.html"
$AppIcon = Join-Path $WorkspaceDir "app_icon.png"
$FbConfig = Join-Path $WorkspaceDir "fbapp-config.json"
$TempDir = Join-Path $WorkspaceDir "dist_temp"

# Target Zip files
$FbZip = Join-Path $WorkspaceDir "StackColorRush_FBInstant.zip"
$PokiZip = Join-Path $WorkspaceDir "StackColorRush_Poki.zip"

if (-not (Test-Path $SourceIndex)) {
    Write-Host "[!] 오류: index.html 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit
}

# 1. Clean old outputs
Write-Host "[*] 기존 빌드 파일 정리 중..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item -Path $TempDir -Recurse -Force }
if (Test-Path $FbZip) { Remove-Item -Path $FbZip -Force }
if (Test-Path $PokiZip) { Remove-Item -Path $PokiZip -Force }

# Create temp directories
New-Item -ItemType Directory -Path (Join-Path $TempDir "facebook") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $TempDir "poki") -Force | Out-Null

# Read index.html source
$Content = [System.IO.File]::ReadAllText($SourceIndex)

# ==========================================
# 2. FACEBOOK INSTANT GAME BUNDLE COMPILATION
# ==========================================
Write-Host "[*] Facebook Instant Games 패키지 빌드 중..." -ForegroundColor Cyan

$FbContent = $Content
# Strip Poki-only HTML and JS blocks
$FbContent = [System.Text.RegularExpressions.Regex]::Replace($FbContent, "(?s)<!-- START_POKI_ONLY -->.*?<!-- END_POKI_ONLY -->", "")
$FbContent = [System.Text.RegularExpressions.Regex]::Replace($FbContent, "(?s)/\* START_POKI_ONLY \*/.*?\/\* END_POKI_ONLY \*/", "")

# Strip Facebook markers (leave the code inside)
$FbContent = $FbContent.Replace("<!-- START_FB_ONLY -->", "").Replace("<!-- END_FB_ONLY -->", "")
$FbContent = $FbContent.Replace("/* START_FB_ONLY */", "").Replace("/* END_FB_ONLY */", "")

# Explicitly set platform variable
$FbContent = $FbContent.Replace("let currentPlatform = 'facebook';", "let currentPlatform = 'facebook';")
$FbContent = $FbContent.Replace("let currentPlatform = 'poki';", "let currentPlatform = 'facebook';")

# Save Facebook index.html
$FbDestHtml = Join-Path $TempDir "facebook\index.html"
[System.IO.File]::WriteAllText($FbDestHtml, $FbContent)

# Copy configuration and icon
Copy-Item -Path $AppIcon -Destination (Join-Path $TempDir "facebook\app_icon.png") -Force
Copy-Item -Path $FbConfig -Destination (Join-Path $TempDir "facebook\fbapp-config.json") -Force

# Compress Facebook Package
Compress-Archive -Path (Join-Path $TempDir "facebook\*") -DestinationPath $FbZip -Force
Write-Host "[✓] Facebook 패키지 생성 완료: StackColorRush_FBInstant.zip" -ForegroundColor Green

# ==========================================
# 3. POKI GAME BUNDLE COMPILATION
# ==========================================
Write-Host "[*] Poki 플랫폼 패키지 빌드 중..." -ForegroundColor Cyan

$PokiContent = $Content
# Strip Facebook-only HTML and JS blocks (and Facebook placement IDs entirely)
$PokiContent = [System.Text.RegularExpressions.Regex]::Replace($PokiContent, "(?s)<!-- START_FB_ONLY -->.*?<!-- END_FB_ONLY -->", "")
$PokiContent = [System.Text.RegularExpressions.Regex]::Replace($PokiContent, "(?s)/\* START_FB_ONLY \*/.*?\/\* END_FB_ONLY \*/", "")

# Strip Poki markers (leave the code inside)
$PokiContent = $PokiContent.Replace("<!-- START_POKI_ONLY -->", "").Replace("<!-- END_POKI_ONLY -->", "")
$PokiContent = $PokiContent.Replace("/* START_POKI_ONLY */", "").Replace("/* END_POKI_ONLY */", "")

# Explicitly set platform variable to 'poki'
$PokiContent = $PokiContent.Replace("let currentPlatform = 'facebook';", "let currentPlatform = 'poki';")

# Save Poki index.html
$PokiDestHtml = Join-Path $TempDir "poki\index.html"
[System.IO.File]::WriteAllText($PokiDestHtml, $PokiContent)

# Copy icon (excluding facebook configuration for Poki security review)
Copy-Item -Path $AppIcon -Destination (Join-Path $TempDir "poki\app_icon.png") -Force

# Compress Poki Package
Compress-Archive -Path (Join-Path $TempDir "poki\*") -DestinationPath $PokiZip -Force
Write-Host "[✓] Poki 패키지 생성 완료: StackColorRush_Poki.zip" -ForegroundColor Green

# ==========================================
# 4. Clean up temp folder
# ==========================================
Write-Host "[*] 임시 파일 정리 중..." -ForegroundColor Yellow
if (Test-Path $TempDir) { Remove-Item -Path $TempDir -Recurse -Force }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  빌드가 모두 정상적으로 완료되었습니다!         " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
