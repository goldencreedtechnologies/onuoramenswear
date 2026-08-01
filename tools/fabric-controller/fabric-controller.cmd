@echo off
setlocal
set "FABRIC_CONTROLLER_HAD_ARGS=0"
if not "%~1"=="" set "FABRIC_CONTROLLER_HAD_ARGS=1"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy RemoteSigned -STA -File "%~dp0FabricController.ps1" %*
set "FABRIC_CONTROLLER_EXIT=%ERRORLEVEL%"

if not "%FABRIC_CONTROLLER_EXIT%"=="0" if "%FABRIC_CONTROLLER_HAD_ARGS%"=="0" pause
exit /b %FABRIC_CONTROLLER_EXIT%

