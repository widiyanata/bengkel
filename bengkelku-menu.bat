@echo off
setlocal enabledelayedexpansion

:: Warna untuk tampilan
color 0A

:: Judul jendela
title Bengkelku Mobile App Launcher

:: Cek apakah direktori bengkelku-mobile ada di lokasi yang sama dengan file batch
echo Mencari direktori aplikasi...

:: Coba cari di direktori yang sama dengan file batch
set "BATCH_DIR=%~dp0"
set "APP_DIR=%BATCH_DIR%bengkelku-mobile"

if exist "%APP_DIR%" (
    echo Direktori aplikasi ditemukan di: %APP_DIR%
    set "FOUND_DIR=1"
    goto menu
)

:: Coba cari di D:\bengkel\bengkelku-mobile
set "APP_DIR=D:\bengkel\bengkelku-mobile"
if exist "%APP_DIR%" (
    echo Direktori aplikasi ditemukan di: %APP_DIR%
    set "FOUND_DIR=1"
    goto menu
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

set "FOUND_DIR=1"

:menu
cls
echo ===================================================
echo         BENGKELKU MOBILE APP - LAUNCHER
echo ===================================================
echo.
echo  Direktori aplikasi: %APP_DIR%
echo.
echo  [1] Jalankan Server Development
echo  [2] Jalankan Server Development + Buka Browser
echo  [3] Build untuk Produksi
echo  [4] Preview Build Produksi
echo  [5] Keluar
echo.
echo ===================================================
echo.

set /p pilihan="Pilih opsi (1-5): "

:: Berpindah ke direktori aplikasi
if "%FOUND_DIR%"=="1" (
    cd /d "%APP_DIR%"
) else (
    echo ERROR: Direktori aplikasi tidak ditemukan.
    pause
    exit /b 1
)

:: Cek apakah npm tersedia
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm tidak ditemukan. Pastikan Node.js terinstal.
    echo.
    pause
    goto menu
)

if "%pilihan%"=="1" (
    cls
    echo Memulai server development...
    echo.
    echo Direktori: %CD%
    echo.
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    npm run dev
    pause
    goto menu
)

if "%pilihan%"=="2" (
    cls
    echo Memulai server development dan membuka browser...
    echo.
    echo Direktori: %CD%
    echo.
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    start http://localhost:5173
    npm run dev
    pause
    goto menu
)

if "%pilihan%"=="3" (
    cls
    echo Building aplikasi untuk produksi...
    echo.
    echo Direktori: %CD%
    echo.
    npm run build
    echo.
    echo Build selesai.
    pause
    goto menu
)

if "%pilihan%"=="4" (
    cls
    echo Preview build produksi...
    echo.
    echo Direktori: %CD%
    echo.
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    npm run preview
    pause
    goto menu
)

if "%pilihan%"=="5" (
    cls
    echo Terima kasih telah menggunakan Bengkelku Mobile App Launcher!
    echo.
    timeout /t 2 >nul
    exit
)

echo.
echo Pilihan tidak valid. Silakan coba lagi.
timeout /t 2 >nul
goto menu
