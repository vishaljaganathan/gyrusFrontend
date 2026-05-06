@echo off
REM Optimized AAB Build Script for Gyrus NEET (Google Play)
REM AAB files are smaller and automatically optimized by Google Play

echo ========================================
echo Gyrus NEET - Optimized AAB Builder
echo (For Google Play Store)
echo ========================================
echo.

REM Step 1: Clean previous builds
echo [1/5] Cleaning previous builds...
cd android
call gradlew clean
if errorlevel 1 (
    echo ERROR: Clean failed!
    pause
    exit /b 1
)
cd ..
echo ✓ Clean completed
echo.

REM Step 2: Install/update dependencies
echo [2/5] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo ERROR: pnpm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Step 3: Clear Metro bundler cache
echo [3/5] Clearing Metro cache...
rmdir /s /q .metro 2>nul
echo ✓ Metro cache cleared
echo.

REM Step 4: Build release AAB
echo [4/5] Building optimized release AAB...
echo This may take 5-10 minutes...
cd android
call gradlew bundleRelease
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ AAB build completed
echo.

REM Step 5: Show results
echo [5/5] Build Summary:
echo ========================================
echo AAB created in:
echo android\app\build\outputs\bundle\release\
echo.
dir /b android\app\build\outputs\bundle\release\*.aab
echo.
echo File size:
for %%f in (android\app\build\outputs\bundle\release\*.aab) do (
    echo   %%~nxf: %%~zf bytes
)
echo ========================================
echo.
echo ✓ Build process completed successfully!
echo.
echo NOTE: AAB files are for Google Play Store upload only.
echo Google Play will automatically generate optimized APKs
echo for different device configurations.
echo.
echo Expected download size on user devices: 20-30%% smaller than universal APK
echo.
pause
