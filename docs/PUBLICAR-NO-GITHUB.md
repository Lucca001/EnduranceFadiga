# Publicar no GitHub

## Caminho recomendado (sem digitar senha)

Duplo clique em `PUBLICAR-NO-GITHUB.command`. Ele instala o GitHub CLI se necessário,
faz login pelo navegador, cria o repositório e envia tudo.

Se o macOS bloquear na primeira vez: botão direito no arquivo → **Abrir** → **Abrir**.

## Por que a senha não funciona

O GitHub removeu a autenticação por senha no Git em **13 de agosto de 2021**. Digitar
a senha da conta no terminal sempre falha com:

```
remote: Support for password authentication was removed on August 13, 2021.
fatal: Authentication failed for 'https://github.com/...'
```

Existem três formas válidas de autenticar. Em ordem de facilidade:

## Opção A — GitHub CLI (o que o script usa)

```bash
brew install gh          # se ainda não tiver
gh auth login --web      # abre o navegador, você cola um código de 8 caracteres
gh auth setup-git        # o Git passa a usar essa autenticação
```

Depois, dentro da pasta do projeto:

```bash
gh repo create SEU-USUARIO/enduranceai --public --source=. --remote=origin --push
```

## Opção B — Token de acesso pessoal (PAT)

1. Acesse https://github.com/settings/tokens?type=beta → **Generate new token**.
2. Marque a permissão **Contents: Read and write** (e **Administration** se quiser criar o repositório pelo terminal).
3. Copie o token — ele começa com `github_pat_` e aparece uma única vez.
4. No `git push`, quando pedir:
   - **Username:** seu usuário do GitHub
   - **Password:** cole o **token**, não a senha da conta

Para não repetir a cada push, guarde no Keychain:

```bash
git config --global credential.helper osxkeychain
```

> Se você já errou a senha antes, o macOS pode ter guardado a credencial errada.
> Limpe em **Acesso às Chaves** → busque por `github.com` → apague as entradas.

## Opção C — Chave SSH

```bash
ssh-keygen -t ed25519 -C "seu@email.com"     # Enter em tudo
pbcopy < ~/.ssh/id_ed25519.pub                # copia a chave pública
```

Cole em https://github.com/settings/ssh/new e teste:

```bash
ssh -T git@github.com
```

Depois use a URL SSH no remoto:

```bash
git remote set-url origin git@github.com:SEU-USUARIO/enduranceai.git
git push -u origin main
```

## Erros comuns

| Mensagem | Causa e solução |
| --- | --- |
| `Support for password authentication was removed` | Você digitou a senha. Use a Opção A, B ou C. |
| `Repository not found` | O repositório não existe ou o token não tem permissão. Crie em https://github.com/new e confira as permissões. |
| `failed to push some refs` | O repositório remoto já tem commits. Use `git pull --rebase origin main` e envie de novo. |
| `Updates were rejected because the remote contains work` | Criou o repositório com README no GitHub. Ou use `--force`, ou crie um repositório vazio. |
| `xcrun: error: invalid active developer path` | Falta o Command Line Tools. Rode `xcode-select --install`. |
