@echo off
chcp 65001 >nul
title ClinicMed - Frontend SPA (React + Vite)
color 0A

echo ========================================================
echo        CLINICMED - SISTEMA CLINICO HOSPITALARIO
echo           Interfaz Web Frontend React y Vite
echo ========================================================
echo.

:: 1. Ir a la ruta del repositorio
cd /d "%~dp0frontend"

:: 2. Verificar dependencias instaladas
if not exist "node_modules\" (
    echo.
    echo [AVISO] Dependencias no encontradas en el frontend.
    echo [INSTALANDO] Descargando dependencias de Node.js por primera vez...
    echo.
    call npm.cmd install
    if errorlevel 1 (
        echo.
        echo [ERROR] Ocurrio un error al instalar las dependencias del frontend.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas con exito.
    echo.
)

:: 3. Iniciar servidor web de desarrollo
echo [INICIANDO] Levantando interfaz web en http://localhost:3000
echo Presiona Ctrl + C para detener la aplicacion.
echo --------------------------------------------------------
call npm.cmd run dev

if errorlevel 1 (
    echo.
    echo [ERROR] La aplicacion frontend se detuvo inesperadamente.
    pause
)
