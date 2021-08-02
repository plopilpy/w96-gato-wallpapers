@echo off
set OLD=%CD%
cd "%~dp0.."
node "index.js" %*
cd "%OLD%"