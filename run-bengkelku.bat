@echo off
echo ===================================================
echo    BENGKELKU MOBILE APP - DEVELOPMENT SERVER
echo ===================================================
echo.

:: Berpindah ke direktori aplikasi
cd /d D:\bengkel\bengkelku-mobile

:: Menampilkan informasi
echo Direktori: %CD%
echo.
echo Memulai server development...
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo.

:: Menjalankan aplikasi
npm run dev

:: Jika server dihentikan
echo.
echo Server telah dihentikan.
echo.

:: Menunggu input sebelum menutup jendela
pause
