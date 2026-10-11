@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Margdarshi Backend
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableExtensions EnableDelayedExpansion

SET "BASE_DIR=%~dp0"
IF %BASE_DIR:~-1%==\ SET "BASE_DIR=%BASE_DIR:~0,-1%"
SET "MAVEN_PROJECTBASEDIR=%BASE_DIR%"

SET "WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"

IF "%JAVA_HOME%"=="" (
    SET "JAVA_EXE=java"
) ELSE (
    SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 EXIT /B %ERRORLEVEL%
