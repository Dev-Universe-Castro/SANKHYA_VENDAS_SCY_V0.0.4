
#!/bin/bash

echo "🧹 Limpando processos anteriores..."
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "🚀 Iniciando sistema completo..."
echo ""
echo "📍 URL: http://0.0.0.0:5000"
echo "🔑 Login: admin@sistema.com / admin123"
echo ""

# Seed do banco de dados Oracle
npm run db:seed

# Iniciar servidor Node.js
npm run dev
