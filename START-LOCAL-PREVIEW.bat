@echo off
setlocal
cd /d "%~dp0"
echo Starting local preview at http://localhost:8080/
echo Keep this window open while testing. Press Ctrl+C to stop.
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8080
  exit /b %errorlevel%
)
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8080
  exit /b %errorlevel%
)
echo Python was not found. Install Python 3 or use the Wrangler preview command in DEPLOY-DIRECT-UPLOAD-WINDOWS.md.
pause
