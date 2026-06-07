@echo off
setlocal

cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    start "Idle Vikingz Server" cmd /k "py -m http.server 8000"
) else (
    where python >nul 2>nul
    if %errorlevel%==0 (
        start "Idle Vikingz Server" cmd /k "python -m http.server 8000"
    ) else (
        echo Python was not found. Install Python or add it to PATH.
        pause
        exit /b 1
    )
)

timeout /t 1 /nobreak >nul
start "" "http://localhost:8000"

endlocal
