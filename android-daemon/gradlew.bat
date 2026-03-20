@echo off
setlocal
set DIR=%~dp0
set APP_BASE_NAME=%~n0
set CLASSPATH=

if exist "%DIR%gradle\wrapper\gradle-wrapper.jar" (
    set CLASSPATH=%DIR%gradle\wrapper\gradle-wrapper.jar
    java -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
) else (
    echo Gradle wrapper not found. Please run 'gradle wrapper' first.
    exit /b 1
)
