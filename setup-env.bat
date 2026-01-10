@echo off
REM Setup environment files for Dr. Sanaullah Welfare Foundation
echo Setting up environment files...

REM Backend .env
(
echo PORT=4000
echo NODE_ENV=development
echo.
echo # Supabase
echo SUPABASE_URL=https://qudebdejubackprbarvc.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2NDEwMSwiZXhwIjoyMDc3MzQwMTAxfQ.KrrnIlsvTyV9IXNrrFjRadUnStD-_tiAob4R8XF64do
echo.
echo # Security
echo CORS_ORIGIN=http://localhost:5173
) > apps\backend\.env

echo Backend .env created

REM Frontend .env
(
echo VITE_SUPABASE_URL=https://qudebdejubackprbarvc.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y
echo VITE_API_URL=http://localhost:4000
) > apps\frontend\.env

echo Frontend .env created
echo.
echo Environment setup complete!
echo.
echo Next steps:
echo 1. Install dependencies:
echo    cd apps\backend ^&^& npm install
echo    cd apps\frontend ^&^& npm install
echo.
echo 2. Run the app:
echo    Backend:  cd apps\backend ^&^& npm run dev
echo    Frontend: cd apps\frontend ^&^& npm run dev
echo.
pause

