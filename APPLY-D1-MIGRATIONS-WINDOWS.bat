@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "EXPECTED_DB_ID=f66b8595-d025-44e5-bc89-a32f69909509"
set "BACKUP_FILE=d1-backup-before-migrations.sql"
echo ============================================================
echo DERMATOLOGUE TANGER - APPLY PENDING D1 CMS MIGRATIONS
echo ============================================================
echo Project: dermtanger
echo Database: dermatologue-tanger-cms
echo Database ID expected: %EXPECTED_DB_ID%
echo.
echo This script operates on the REMOTE Cloudflare D1 database.
echo It does not create or replace the database.
echo A local SQL export is created before applying any migration.
echo The backup is excluded from Git by .gitignore.
echo.
where node >nul 2>nul || (echo ERROR: Install Node.js LTS first.& pause & exit /b 1)
where npx >nul 2>nul || (echo ERROR: npm/npx is missing.& pause & exit /b 1)
if not exist "wrangler.toml" (echo ERROR: Run this file from the extracted repository root.& pause & exit /b 1)
findstr /I /C:"%EXPECTED_DB_ID%" wrangler.toml >nul
if errorlevel 1 (echo ERROR: wrangler.toml does not reference the expected existing D1 database ID.& echo Open wrangler.toml and verify the DB binding before continuing.& pause & exit /b 1)
echo.
echo [1/4] Checking Cloudflare authentication...
npx --yes wrangler@3.114.17 whoami
if errorlevel 1 (echo ERROR: Wrangler authentication failed. Run npx wrangler@3.114.17 login first.& pause & exit /b 1)
echo.
echo [2/4] Current remote migration state:
npx --yes wrangler@3.114.17 d1 migrations list dermatologue-tanger-cms --remote
if errorlevel 1 (echo ERROR: Could not read remote migration state. Check account access and D1 binding.& pause & exit /b 1)
echo.
echo IMPORTANT: Check that Wrangler is authenticated to the Cloudflare account that owns the intended database.
set /p CONFIRM=Type APPLY-CMS-MIGRATIONS to export and apply pending migrations: 
if /I not "%CONFIRM%"=="APPLY-CMS-MIGRATIONS" (echo Cancelled. No export or migrations were run.& pause & exit /b 0)
echo.
echo [3/4] Exporting current remote D1 database...
if exist "%BACKUP_FILE%" (echo ERROR: %BACKUP_FILE% already exists. Rename the old backup before running again.& pause & exit /b 1)
npx --yes wrangler@3.114.17 d1 export dermatologue-tanger-cms --remote --output="%BACKUP_FILE%"
if errorlevel 1 (echo ERROR: Backup export failed. No migrations were applied.& pause & exit /b 1)
if not exist "%BACKUP_FILE%" (echo ERROR: Backup file was not created. No migrations were applied.& pause & exit /b 1)
for %%A in ("%BACKUP_FILE%") do if %%~zA LEQ 0 (echo ERROR: Backup file is empty. No migrations were applied.& pause & exit /b 1)
echo Backup created and verified: %BACKUP_FILE%
echo Keep this file private and outside Git.
echo.
echo [4/4] Applying pending migrations in order...
npx --yes wrangler@3.114.17 d1 migrations apply dermatologue-tanger-cms --remote
if errorlevel 1 (echo ERROR: Migration failed. Keep the SQL backup and do not continue deployment until resolved.& pause & exit /b 1)
echo.
echo Verifying migration state...
npx --yes wrangler@3.114.17 d1 migrations list dermatologue-tanger-cms --remote
if errorlevel 1 (echo WARNING: Migration command completed but verification failed.& pause & exit /b 1)
echo.
echo Verifying CMS tables...
npx --yes wrangler@3.114.17 d1 execute dermatologue-tanger-cms --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('cms_articles','cms_videos','cms_audit_log') ORDER BY name;"
if errorlevel 1 (echo ERROR: Could not verify CMS tables. Keep the backup and investigate.& pause & exit /b 1)
echo.
echo Verifying video spoken_language column...
npx --yes wrangler@3.114.17 d1 execute dermatologue-tanger-cms --remote --command "PRAGMA table_info(cms_videos);"
if errorlevel 1 (echo ERROR: Could not verify cms_videos schema.& pause & exit /b 1)
echo.
echo SUCCESS only if cms_articles, cms_videos, cms_audit_log and spoken_language are present above.
echo Then check https://dermatologue-tanger.com/sitemap-cms.xml returns HTTP 200 and valid XML.
echo If the sitemap still returns 503, inspect Pages Production D1 binding DB and the remote migration list.
pause
endlocal
