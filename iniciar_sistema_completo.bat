@echo off
chcp 65001 >nul
title ClinicMed - Lanzador General
color 09

echo ========================================================
echo        CLINICMED - SISTEMA CLINICO HOSPITALARIO
echo              Iniciador del Sistema Completo
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Abriendo Servidor Backend...
start "" "%~dp0iniciar_backend.bat"

echo [2/3] Abriendo Interfaz Frontend...
start "" "%~dp0iniciar_frontend.bat"

echo [3/3] Esperando 5 segundos para inicializar servicios y abrir el navegador...
timeout /t 5 /nobreak >nul

echo Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo El sistema se esta ejecutando.
echo Puedes minimizar esta ventana. Para cerrar el sistema,
echo simplemente cierra las ventanas de Backend y Frontend.
echo ========================================================
timeout /t 5 >nul
