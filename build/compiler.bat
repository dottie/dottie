@ECHO OFF
pushd "%~dp0"
java -jar compiler.jar --charset "utf-8" --js=%1 --js_output_file=%~n1.min%~x1

PAUSE