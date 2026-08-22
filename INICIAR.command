#!/bin/bash
# EnduranceAI — inicia o app com um duplo clique (macOS).
cd "$(dirname "$0")/apps/web" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado."
  echo "Instale a versão LTS em https://nodejs.org e rode este arquivo de novo."
  open "https://nodejs.org"
  read -n 1 -s -r -p "Pressione qualquer tecla para sair..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Primeira execução: instalando dependências (~2 min)..."
  npm install || { echo "npm install falhou"; exit 1; }
fi

( sleep 6 && open -a Safari "http://localhost:3000" ) &
echo ""
echo "EnduranceAI rodando em http://localhost:3000 — abrindo no Safari..."
echo "Para parar: feche esta janela ou pressione Ctrl+C."
echo ""
npm run dev
