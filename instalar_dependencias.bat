@echo off
chcp 65001 >nul
title ClinicMed - Instalador de Dependencias y Configuracion
color 0E

echo ========================================================
echo        CLINICMED - INSTALADOR AUTOMATICO INTEGRAL
echo ========================================================
echo Este asistente preparara y descargara todo lo necesario
echo para que puedas correr ClinicMed en cualquier computadora.
echo.

:: 1. Ir a la raiz del repositorio dinamicamente
cd /d "%~dp0"
echo [RUTA LOCAL] %CD%
echo.

:: 2. Verificar si Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
    color 0C
    echo [ERROR CRITICO] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor descarga e instala Node.js version LTS desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado:
node -v
npm -v
echo.

:: 3. Configurar variables de entorno backend/.env
echo --------------------------------------------------------
echo [1/3] Configurando variables de entorno del Backend...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Archivo backend\.env creado con conexion cloud y credenciales.
    ) else (
        echo [ALERTA] No se encontro backend\.env.example
    )
) else (
    echo [OK] Archivo backend\.env ya existe.
)
echo.

:: 4. Instalar dependencias del Backend
echo --------------------------------------------------------
echo [2/3] Instalando dependencias del Backend (Express, Base de Datos, IA)...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    color 0C
    echo [ERROR] Fallo la instalacion de dependencias del backend.
    pause
    exit /b 1
)
echo [OK] Backend preparado exitosamente.
echo.

:: 5. Instalar dependencias del Frontend
echo --------------------------------------------------------
echo [3/3] Instalando dependencias del Frontend (React, Vite, Tailwind)...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    color 0C
    echo [ERROR] Fallo la instalacion de dependencias del frontend.
    pause
    exit /b 1
)
echo [OK] Frontend preparado exitosamente.
echo.

:: 6. Finalizacion
cd /d "%~dp0"
color 0A
echo ========================================================
echo       TODO LISTO: CLINICMED HA SIDO CONFIGURADO
echo ========================================================
echo Ya puedes iniciar el sistema con:
echo   - iniciar_sistema_completo.bat  (Inicia Backend, Frontend y Navegador)
echo   - o individualmente con iniciar_backend.bat e iniciar_frontend.bat
echo ========================================================
echo.
pause
