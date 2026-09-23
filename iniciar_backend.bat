@echo off
chcp 65001 >nul
title ClinicMed - Servidor Backend (API)
color 0B

echo ========================================================
echo        CLINICMED - SISTEMA CLINICO HOSPITALARIO
echo            Servidor Backend Node.js y Express
echo ========================================================
echo.

:: 1. Ir a la raiz del repositorio
cd /d "%~dp0"

:: 2. Verificar archivo .env en backend
if not exist "backend\.env" (
    echo [INFO] Creando archivo de configuracion backend\.env desde plantilla...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Archivo backend\.env configurado exitosamente.
    ) else (
        echo [ALERTA] No se encontro backend\.env.example
    )
)

:: 3. Entrar a la carpeta backend
cd /d "%~dp0backend"

:: 4. Verificar dependencias instaladas
if not exist "node_modules\" (
    echo.
    echo [AVISO] Dependencias no encontradas en el backend.
    echo [INSTALANDO] Descargando dependencias de Node.js por primera vez...
    echo.
    call npm.cmd install
    if errorlevel 1 (
        echo.
        echo [ERROR] Ocurrio un error al instalar las dependencias del backend.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas con exito.
    echo.
)

:: 5. Iniciar servidor de desarrollo
echo [INICIANDO] Levantando servidor en http://localhost:4000
echo Presiona Ctrl + C para detener el servidor.
echo --------------------------------------------------------
call npm.cmd run dev

if errorlevel 1 (
    echo.
    echo [ERROR] El servidor backend se detuvo inesperadamente.
    pause
)
