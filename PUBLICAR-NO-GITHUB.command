#!/bin/bash
# EnduranceAI — publica este projeto no seu GitHub.
# Duplo clique para executar. Nenhuma senha é digitada aqui:
# a autenticação acontece na janela do navegador ou do próprio Git.

cd "$(dirname "$0")" || exit 1
set -e

echo ""
echo "════════════════════════════════════════════"
echo "  EnduranceAI → GitHub"
echo "════════════════════════════════════════════"
echo ""

if ! command -v git >/dev/null 2>&1; then
  echo "Git não encontrado. Instale as ferramentas de linha de comando do Xcode:"
  echo "   xcode-select --install"
  read -n 1 -s -r -p "Pressione qualquer tecla para sair..."
  exit 1
fi

# Garante que o repositório existe e tem um commit.
if [ ! -d .git ]; then
  git init -b main -q
fi
if ! git rev-parse HEAD >/dev/null 2>&1; then
  git add -A
  git commit -q -m "EnduranceAI: initial commit"
fi

read -r -p "Seu usuário do GitHub: " USER_GH
[ -z "$USER_GH" ] && { echo "Usuário vazio. Saindo."; exit 1; }
read -r -p "Nome do repositório [enduranceai]: " REPO
REPO=${REPO:-enduranceai}

# Substitui o placeholder USERNAME nos badges e links do README.
if grep -q "USERNAME/enduranceai" README.md 2>/dev/null; then
  sed -i '' "s|USERNAME/enduranceai|$USER_GH/$REPO|g" README.md .github/ISSUE_TEMPLATE/config.yml 2>/dev/null || true
  git add -A && git commit -q -m "docs: point badges and links to the repository" || true
fi

REMOTE="https://github.com/$USER_GH/$REPO.git"

if command -v gh >/dev/null 2>&1; then
  echo ""
  echo "GitHub CLI detectado. Autenticando (se necessário)..."
  gh auth status >/dev/null 2>&1 || gh auth login
  echo ""
  read -r -p "Repositório público? [S/n]: " PUB
  VIS="--public"; [[ "$PUB" =~ ^[Nn] ]] && VIS="--private"
  gh repo create "$USER_GH/$REPO" $VIS --source=. --remote=origin --push
else
  echo ""
  echo "GitHub CLI não instalado (opcional: brew install gh)."
  echo "Crie um repositório VAZIO em: https://github.com/new"
  echo "   Nome: $REPO   —   sem README, sem .gitignore, sem licença"
  open "https://github.com/new" 2>/dev/null || true
  echo ""
  read -n 1 -s -r -p "Depois de criar, pressione qualquer tecla para continuar..."
  echo ""
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REMOTE"
  git branch -M main
  echo ""
  echo "Enviando... (o Git vai pedir login no navegador ou um token de acesso)"
  git push -u origin main
fi

echo ""
echo "Pronto: https://github.com/$USER_GH/$REPO"
open "https://github.com/$USER_GH/$REPO" 2>/dev/null || true
echo ""
read -n 1 -s -r -p "Pressione qualquer tecla para fechar..."
