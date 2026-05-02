@echo off
echo Nettoyage des anciens fichiers React/Mongo...
del App.css HomePage.js OrderDetailPage.js Product.js ProductDetailPage.js ShopPage.js orderController.js productController.js seed.js 2>nul

echo.
echo Creation du backend Node.js + MySQL...
mkdir backend
cd backend
call npm init -y
call npm install express sequelize mysql2 dotenv cors jsonwebtoken bcrypt
cd ..

echo.
echo Creation du frontend Angular 18 (patientez, cela peut prendre quelques minutes)...
call npx @angular/cli new frontend --routing=true --style=css --standalone=true --skip-git

echo.
echo Termine !
pause
