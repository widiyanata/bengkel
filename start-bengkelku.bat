@echo off
setlocal enabledelayedexpansion

:: Judul jendela
title Bengkelku Mobile App - Development Server

:: Cek apakah direktori bengkelku-mobile ada di lokasi yang sama dengan file batch
echo Mencari direktori aplikasi...

:: Coba cari di direktori yang sama dengan file batch
set "BATCH_DIR=%~dp0"
set "APP_DIR=%BATCH_DIR%bengkelku-mobile"

if exist "%APP_DIR%" (
    echo Direktori aplikasi ditemukan di: %APP_DIR%
    cd /d "%APP_DIR%"
    goto start_server
)

:: Coba cari di D:\bengkel\bengkelku-mobile
set "APP_DIR=D:\bengkel\bengkelku-mobile"
if exist "%APP_DIR%" (
    echo Direktori aplikasi ditemukan di: %APP_DIR%
    cd /d "%APP_DIR%"
    goto start_server
)

:: Jika tidak ditemukan, minta input dari pengguna
echo Direktori aplikasi tidak ditemukan secara otomatis.
echo.
set /p APP_DIR="Masukkan path lengkap direktori bengkelku-mobile: "

if not exist "%APP_DIR%" (
    echo.
    echo ERROR: Direktori %APP_DIR% tidak ditemukan.
    echo.
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

:start_server
echo.
echo ===================================================
echo    BENGKELKU MOBILE APP - DEVELOPMENT SERVER
echo ===================================================
echo.
echo Direktori: %CD%
echo.
echo Memulai server development...
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo.

:: Cek apakah npm tersedia
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm tidak ditemukan. Pastikan Node.js terinstal.
    echo.
    pause
    exit /b 1
)

:: Menjalankan aplikasi
npm run dev

:: Jika server dihentikan
echo.
echo Server telah dihentikan.
echo.

:: Menunggu input sebelum menutup jendela
pause
