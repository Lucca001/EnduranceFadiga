#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  EnduranceAI → GitHub
#  Autenticação pelo NAVEGADOR. Você nunca digita senha aqui.
#  (O GitHub não aceita senha da conta no terminal desde 2021.)
# ─────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; OFF=$'\033[0m'
say()  { printf "%s\n" "$1"; }
ok()   { printf "${GREEN}✓${OFF} %s\n" "$1"; }
warn() { printf "${YELLOW}!${OFF} %s\n" "$1"; }
err()  { printf "${RED}✗${OFF} %s\n" "$1"; }
pause(){ printf "\n"; read -n 1 -s -r -p "Pressione qualquer tecla para fechar..."; printf "\n"; }

printf "\n${BOLD}════════════════════════════════════════════${OFF}\n"
printf "${BOLD}  EnduranceAI  →  GitHub${OFF}\n"
printf "${BOLD}════════════════════════════════════════════${OFF}\n\n"

# ── 1. Git ───────────────────────────────────────────────────
if ! command -v git >/dev/null 2>&1; then
  err "Git não encontrado."
  say "Abrindo o instalador das ferramentas de linha de comando..."
  xcode-select --install
  say "Conclua a instalação e rode este arquivo de novo."
  pause; exit 1
fi
ok "Git encontrado"

# ── 2. GitHub CLI (login sem senha, via navegador) ───────────
BREW=""
for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do [ -x "$p" ] && BREW="$p" && break; done
[ -n "$BREW" ] && eval "$($BREW shellenv)" 2>/dev/null

if ! command -v gh >/dev/null 2>&1; then
  warn "GitHub CLI (gh) não instalado — é ele que faz o login pelo navegador."
  if [ -n "$BREW" ]; then
    printf "\nInstalar agora com Homebrew? (leva ~1 min) [S/n]: "
    read -r R
    if [[ ! "$R" =~ ^[Nn] ]]; then
      say "Instalando..."
      "$BREW" install gh || { err "Falha ao instalar o gh."; pause; exit 1; }
    fi
  else
    say ""
    say "Homebrew não encontrado. Duas opções:"
    say "  A) Instale o Homebrew e depois o gh:"
    say "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    say "     brew install gh"
    say "  B) Baixe o instalador do GitHub CLI: https://cli.github.com"
    open "https://cli.github.com" 2>/dev/null
    say ""
    say "Depois rode este arquivo de novo."
    pause; exit 1
  fi
fi
command -v gh >/dev/null 2>&1 || { err "gh ainda indisponível. Feche e abra o Terminal, ou reinicie o script."; pause; exit 1; }
ok "GitHub CLI encontrado"

# ── 3. Login (navegador, sem senha no terminal) ──────────────
if ! gh auth status >/dev/null 2>&1; then
  printf "\n${BOLD}Login no GitHub${OFF}\n"
  say "Vai abrir o navegador com um código de 8 caracteres."
  say "Cole o código na página, autorize, e volte para cá."
  say ""
  gh auth login --hostname github.com --git-protocol https --web || {
    err "Login não concluído."
    say "Tente novamente rodando: gh auth login --web"
    pause; exit 1
  }
fi
gh auth setup-git >/dev/null 2>&1
USER_GH=$(gh api user --jq .login 2>/dev/null)
[ -z "$USER_GH" ] && { err "Não consegui ler seu usuário. Rode: gh auth login --web"; pause; exit 1; }
ok "Autenticado como ${BOLD}$USER_GH${OFF}"

# ── 4. Repositório local ─────────────────────────────────────
if [ ! -d .git ]; then
  git init -b main -q
  ok "Repositório Git criado"
fi
git config user.name  >/dev/null 2>&1 || git config user.name "$USER_GH"
git config user.email >/dev/null 2>&1 || git config user.email "$(gh api user --jq '.email // empty' 2>/dev/null)"
git config user.email >/dev/null 2>&1 || git config user.email "$USER_GH@users.noreply.github.com"
git branch -M main 2>/dev/null

printf "\nNome do repositório [enduranceai]: "
read -r REPO; REPO=${REPO:-enduranceai}
printf "Repositório público? [S/n]: "
read -r PUB; VIS="public"; [[ "$PUB" =~ ^[Nn] ]] && VIS="private"

# Badges e links do README apontando para o repositório real
if grep -q "USERNAME/enduranceai" README.md 2>/dev/null; then
  sed -i '' "s|USERNAME/enduranceai|$USER_GH/$REPO|g" README.md .github/ISSUE_TEMPLATE/config.yml 2>/dev/null
  ok "README ajustado para $USER_GH/$REPO"
fi

git add -A
git diff --cached --quiet 2>/dev/null || git commit -q -m "chore: prepare repository for publication"
git rev-parse HEAD >/dev/null 2>&1 || { git add -A; git commit -q -m "EnduranceAI: initial commit"; }
ok "Commit pronto"

# ── 5. Criar e enviar ────────────────────────────────────────
printf "\n${BOLD}Enviando para o GitHub...${OFF}\n"

if gh repo view "$USER_GH/$REPO" >/dev/null 2>&1; then
  warn "O repositório $USER_GH/$REPO já existe — enviando para ele."
  git remote remove origin 2>/dev/null
  git remote add origin "https://github.com/$USER_GH/$REPO.git"
  PUSH_OUT=$(git push -u origin main 2>&1) || {
    err "Push recusado."
    printf "%s\n" "$PUSH_OUT"
    say ""
    say "Se o repositório remoto já tem arquivos, force com:"
    say "   git push -u origin main --force"
    pause; exit 1
  }
else
  gh repo create "$USER_GH/$REPO" --"$VIS" --source=. --remote=origin --push || {
    err "Não consegui criar o repositório."
    say "Verifique se o nome já está em uso: https://github.com/$USER_GH?tab=repositories"
    pause; exit 1
  }
fi

printf "\n${GREEN}${BOLD}Publicado com sucesso${OFF}\n"
say "https://github.com/$USER_GH/$REPO"
open "https://github.com/$USER_GH/$REPO" 2>/dev/null
pause
