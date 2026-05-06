@echo off
REM Optimized APK Build Script for Gyrus NEET
REM This script performs a clean build with all optimizations enabled

echo ========================================
echo Gyrus NEET - Optimized APK Builder
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

REM Step 4: Build release APK
echo [4/5] Building optimized release APK...
echo This may take 5-10 minutes...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ APK build completed
echo.

REM Step 5: Show results
echo [5/5] Build Summary:
echo ========================================
echo APKs created in:
echo android\app\build\outputs\apk\release\
echo.
dir /b android\app\build\outputs\apk\release\*.apk
echo.
echo File sizes:
for %%f in (android\app\build\outputs\apk\release\*.apk) do (
    echo   %%~nxf: %%~zf bytes
)
echo ========================================
echo.
echo ✓ Build process completed successfully!
echo.
echo To install on device:
echo adb install android\app\build\outputs\apk\release\app-arm64-v8a-release.apk
echo.
pause
