@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo Dr Yassir Chaibi - Cloudflare Pages deployment
echo Project: dermtanger
echo ============================================================
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed. Install the current Node.js LTS release first.
  pause
  exit /b 1
)
echo Checking Cloudflare authentication...
call npx wrangler whoami >nul 2>nul
if errorlevel 1 (
  echo A browser window will open so you can authorize Wrangler.
  call npx wrangler login
  if errorlevel 1 goto failed
)
echo Running automated tests...
call npm test
if errorlevel 1 goto failed
call npm run check
if errorlevel 1 goto failed
echo Deploying complete Pages project, including Functions and Wrangler bindings...
call npx wrangler pages deploy . --project-name=dermtanger
if errorlevel 1 goto failed
echo.
echo Deployment command completed. Verify the production URLs and CMS checklist in DEPLOY-DIRECT-UPLOAD-WINDOWS.md.
pause
exit /b 0
:failed
echo.
echo Deployment stopped because a command failed. No success is claimed.
pause
exit /b 1
