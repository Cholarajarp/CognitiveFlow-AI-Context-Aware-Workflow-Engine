@echo off
echo Initializing Git repository...
git init

echo Adding files...
git add .

echo Committing files...
git commit -m "Initial commit: CognitiveFlow MVP with Gemini AI integration"

echo Renaming branch to main...
git branch -M main

echo Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Cholarajarp/CognitiveFlow-AI-Context-Aware-Workflow-Engine.git

echo Pushing to GitHub...
git push -u origin main

echo Done!
pause
