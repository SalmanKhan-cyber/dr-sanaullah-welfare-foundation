#!/bin/bash

# Setup environment files for Dr. Sanaullah Welfare Foundation
echo "🔧 Setting up environment files..."

# Backend .env
cat > apps/backend/.env << 'EOF'
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://qudebdejubackprbarvc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2NDEwMSwiZXhwIjoyMDc3MzQwMTAxfQ.KrrnIlsvTyV9IXNrrFjRadUnStD-_tiAob4R8XF64do

# Security
CORS_ORIGIN=http://localhost:5173
EOF

echo "✅ Backend .env created"

# Frontend .env
cat > apps/frontend/.env << 'EOF'
VITE_SUPABASE_URL=https://qudebdejubackprbarvc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y
VITE_API_URL=http://localhost:4000
EOF

echo "✅ Frontend .env created"

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Install dependencies:"
echo "   cd apps/backend && npm install"
echo "   cd apps/frontend && npm install"
echo ""
echo "2. Run the app:"
echo "   Backend:  cd apps/backend && npm run dev"
echo "   Frontend: cd apps/frontend && npm run dev"
echo ""

