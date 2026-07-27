@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
if not "%MAVEN_PROJECTBASEDIR%"=="" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    mvn %*
    goto end
)

if exist %WRAPPER_JAR% (
    java -cp %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
    goto end
)

echo Error: Maven or maven-wrapper.jar not found.
exit /B 1

:end
@endlocal
