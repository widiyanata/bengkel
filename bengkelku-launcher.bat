@echo off
setlocal enabledelayedexpansion

:: Warna untuk tampilan
color 0A

:: Judul jendela
title Bengkelku Mobile App Launcher

:menu
cls
echo ===================================================
echo         BENGKELKU MOBILE APP - LAUNCHER
echo ===================================================
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
cd /d D:\bengkel\bengkelku-mobile

if "%pilihan%"=="1" (
    cls
    echo Memulai server development...
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
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    start http://localhost:5174
    npm run dev
    pause
    goto menu
)

if "%pilihan%"=="3" (
    cls
    echo Building aplikasi untuk produksi...
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
