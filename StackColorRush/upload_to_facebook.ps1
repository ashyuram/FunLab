param(
    [string]$AppId = "1268848091767887",
    [string]$Token = ""
)

# Clear screen for readability
Clear-Host

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Stack Color Rush - FB Instant Game Uploader  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not $Token) {
    Write-Host "[!] 오류: Facebook User Access Token이 비어있습니다." -ForegroundColor Red
    Write-Host "안전한 업로드를 위해 아래 가이드를 따라 토큰을 발급받아 매개변수로 넣어주세요." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "👉 발급 방법:" -ForegroundColor White
    Write-Host "1. https://developers.facebook.com/tools/explorer/ 접속" -ForegroundColor White
    Write-Host "2. 우측 상단 'Facebook 앱'에서 [Stack Color Rush] 선택" -ForegroundColor White
    Write-Host "3. '토큰 받기' -> '사용자 액세스 토큰 받기' 클릭 및 로그인 권한 승인" -ForegroundColor White
    Write-Host "4. 생성된 EAAC...로 시작하는 긴 토큰 문자열 복사" -ForegroundColor White
    Write-Host ""
    Write-Host "👉 실행 명령어 예시:" -ForegroundColor White
    Write-Host ".\upload_to_facebook.ps1 -Token 'EAAC_내_토큰_값'" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Cyan
    exit
}

Write-Host "[*] 업로드 대상 App ID: $AppId" -ForegroundColor Yellow
Write-Host "[*] 빌드 경로: d:\Github\FunLab\StackColorRush\StackColorRush_FBInstant.zip" -ForegroundColor Yellow
Write-Host "[*] 페이스북 호스팅 서버로 전송 중..." -ForegroundColor Cyan

# Execute direct upload via graph-video.facebook.com endpoint
Write-Host "[*] 페이스북 비디오/에셋 업로드 서버로 패키지 전송 중..." -ForegroundColor Yellow
$response = curl.exe -s -X POST "https://graph-video.facebook.com/$AppId/assets" `
  -F "access_token=$Token" `
  -F "type=BUNDLE" `
  -F "asset=@d:\Github\FunLab\StackColorRush\StackColorRush_FBInstant.zip" `
  -F "comment=Build uploaded via uploader script"

# Print raw response for debugging
Write-Host "서버 응답: $response" -ForegroundColor Gray

if ($LASTEXITCODE -eq 0 -and $response -notlike "*error*") {
    Write-Host ""
    Write-Host "[✓] 업로드가 성공적으로 완료되었습니다!" -ForegroundColor Green
    Write-Host "페이스북 개발자 센터의 '웹 호스팅' 탭에서 새 빌드 버전을 확인하고 테스트 상태로 전환하세요." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[x] 업로드 도중 오류가 발생했습니다." -ForegroundColor Red
    Write-Host "오류 사유: 페이스북 서버가 잘못된 토큰 또는 규격 에러를 반환했습니다." -ForegroundColor Red
}
