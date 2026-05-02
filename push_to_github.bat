@echo off
echo Nettoyage des fichiers inutiles...
del App.css HomePage.js OrderDetailPage.js ProductDetailPage.js ShopPage.js orderController.js productController.js 2>nul

echo Initialisation du depot Git...
git init
git add .
git commit -m "Mama Africa E-commerce - Version Finale"

echo.
set /p repo_url="Entrez l'URL de votre depot GitHub (ex: https://github.com/votre-nom/votre-projet.git) : "

git remote add origin %repo_url%
git branch -M main
git push -u origin main

echo.
echo Termine ! Verifiez votre GitHub.
pause
