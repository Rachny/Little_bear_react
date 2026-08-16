@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==============================================
echo   LittleBear - Deploy Firebase Firestore Rules
echo ==============================================
echo.

echo Project: my-react-app-d5e78
echo.

echo Checking Firebase CLI...
where npx >nul 2>nul
if errorlevel 1 goto NONPX

npx --yes firebase-tools@latest --version
if errorlevel 1 goto CLIERROR

echo.
echo If Firebase asks you to log in, complete the browser login.
echo.
npx --yes firebase-tools@latest login
if errorlevel 1 goto LOGINERROR

echo.
echo Deploying Firestore rules...
npx --yes firebase-tools@latest deploy --only firestore:rules --project my-react-app-d5e78
if errorlevel 1 goto DEPLOYERROR

echo.
echo ==============================================
echo   SUCCESS: Firestore rules are deployed.
echo ==============================================
echo.
echo Restart your Vite server and test the Contact form.
pause
exit /b 0

:NONPX
echo ERROR: Node.js/npm/npx is not installed.
echo Install Node.js from https://nodejs.org/ and run this file again.
pause
exit /b 1

:CLIERROR
echo ERROR: Firebase CLI could not be started through npx.
pause
exit /b 1

:LOGINERROR
echo ERROR: Firebase login failed or was cancelled.
pause
exit /b 1

:DEPLOYERROR
echo ERROR: Firestore rules deployment failed.
echo Copy the error shown above and send it to ChatGPT.
pause
exit /b 1
