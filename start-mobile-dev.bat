@echo off
echo Clearing Next.js cache and rebuilding...

echo Removing .next directory...
if exist .next rmdir /s /q .next

echo Clearing npm cache...
npm cache clean --force

echo Updating browserslist database...
npx update-browserslist-db@latest --yes

echo Starting development server with increased memory...
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev

echo.
echo If you still get memory errors, try:
echo - Restart your computer
echo - Close other applications
echo - Run: npm run build instead of npm run dev
