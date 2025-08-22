# 🔧 Configurar GitHub para Deploy no Netlify

## ✅ Status Atual

- ✅ **Git configurado** localmente
- ✅ **Commit inicial** realizado
- ✅ **26 arquivos** commitados
- ✅ **Pronto para conectar** com GitHub

## 📋 Passos para Configurar GitHub

### 1. **Criar Repositório no GitHub**

1. **Acesse o GitHub:**
   - Vá para [github.com](https://github.com)
   - Faça login com sua conta `fgabrielqr`

2. **Criar Novo Repositório:**
   - Clique no botão **"+"** no canto superior direito
   - Selecione **"New repository"**

3. **Configurar Repositório:**
   - **Repository name:** `sistema-viagens`
   - **Description:** `Sistema para gerenciamento de viagens e motoristas`
   - **Visibility:** `Public` (recomendado para Netlify)
   - **NÃO** marque "Add a README file" (já temos um)
   - **NÃO** marque "Add .gitignore" (já temos um)
   - **NÃO** marque "Choose a license"

4. **Criar Repositório:**
   - Clique em **"Create repository"**

### 2. **Conectar Repositório Local com GitHub**

Após criar o repositório, o GitHub mostrará comandos. Execute estes comandos no PowerShell:

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/fgabrielqr/sistema-viagens.git

# Definir o branch principal como 'main'
git branch -M main

# Fazer push do código para o GitHub
git push -u origin main
```

### 3. **Verificar Conexão**

```bash
# Verificar se o remote foi adicionado
git remote -v

# Verificar status
git status
```

## 🚀 Próximos Passos para Deploy

### 1. **Deploy no Netlify**

Após conectar com o GitHub:

1. **Acesse o Netlify:**
   - Vá para [netlify.com](https://netlify.com)
   - Faça login com GitHub

2. **Criar Novo Site:**
   - Clique em **"New site from Git"**
   - Escolha **"GitHub"**
   - Selecione o repositório `sistema-viagens`

3. **Configurar Build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `18`

4. **Deploy:**
   - Clique em **"Deploy site"**

### 2. **Deploy Automático**

Após o primeiro deploy, o Netlify fará deploy automático sempre que você:
- Fizer `git push` para o branch `main`
- Criar Pull Requests
- Fazer merge de PRs

## 🔄 Comandos Git Úteis

### **Para futuras atualizações:**

```bash
# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Fazer push (deploy automático no Netlify)
git push origin main
```

### **Para verificar status:**

```bash
# Ver arquivos modificados
git status

# Ver histórico de commits
git log --oneline

# Ver branches
git branch -a
```

## 📱 Testando o Deploy

### **Credenciais de Teste:**
- **Admin:** admin@exemplo.com / admin123
- **Motorista:** joao@exemplo.com / 123456

### **Funcionalidades:**
- ✅ Login de administrador e motorista
- ✅ Cadastro de motoristas, veículos e pacientes
- ✅ Gerenciamento de viagens
- ✅ Formatação automática de telefone
- ✅ Interface responsiva

## 🛠 Solução de Problemas

### **Erro de Push:**
```bash
# Se der erro de autenticação, use:
git remote set-url origin https://fgabrielqr@github.com/fgabrielqr/sistema-viagens.git
```

### **Erro de Branch:**
```bash
# Se precisar criar branch main:
git checkout -b main
git push -u origin main
```

### **Erro de Permissão:**
- Verifique se o repositório está público
- Confirme se você tem permissão de push
- Verifique se o token de acesso está válido

## 📞 Links Úteis

- **GitHub:** [github.com/fgabrielqr](https://github.com/fgabrielqr)
- **Netlify:** [netlify.com](https://netlify.com)
- **Documentação:** `DEPLOY_NETLIFY.md`

---

**Status:** ✅ Git Configurado - Pronto para GitHub
**Próximo passo:** Criar repositório no GitHub
**Última atualização:** Dezembro 2024
