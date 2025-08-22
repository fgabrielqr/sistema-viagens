# 🚀 Guia de Deploy no Netlify

## ✅ Pré-requisitos

- ✅ Projeto buildado com sucesso (`npm run build`)
- ✅ Conta no GitHub (para deploy automático)
- ✅ Conta no Netlify (gratuita)

## 📋 Passos para Deploy

### 1. **Preparar o Repositório GitHub**

```bash
# Se ainda não tem um repositório no GitHub:
git init
git add .
git commit -m "Sistema de Viagens - Pronto para deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sistema-viagens.git
git push -u origin main
```

### 2. **Acessar o Netlify**

1. Vá para [netlify.com](https://netlify.com)
2. Clique em "Sign up" ou "Log in"
3. Faça login com sua conta GitHub

### 3. **Criar Novo Site**

1. Clique em **"New site from Git"**
2. Escolha **"GitHub"**
3. Autorize o Netlify a acessar seus repositórios
4. Selecione o repositório `sistema-viagens`

### 4. **Configurar Build**

Configure as seguintes opções:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `18` (ou superior)

### 5. **Deploy**

1. Clique em **"Deploy site"**
2. Aguarde o build completar (2-3 minutos)
3. ✅ **Site publicado com sucesso!**

## 🔧 Configurações Adicionais

### **Variáveis de Ambiente (Opcional)**
Se necessário, configure em **Site settings > Environment variables**:
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://seu-site.netlify.app`

### **Domínio Personalizado**
1. Vá em **Site settings > Domain management**
2. Clique em **"Add custom domain"**
3. Siga as instruções para configurar DNS

## 📱 Testando o Deploy

### **Credenciais de Teste:**
- **Admin:** admin@exemplo.com / admin123
- **Motorista:** joao@exemplo.com / 123456

### **Funcionalidades para Testar:**
- ✅ Login de administrador e motorista
- ✅ Cadastro de motoristas, veículos e pacientes
- ✅ Criação e gerenciamento de viagens
- ✅ Formatação automática de telefone
- ✅ Interface responsiva

## 🛠 Solução de Problemas

### **Erro de Build:**
- Verifique se o Node.js está na versão 18+
- Confirme se todas as dependências estão instaladas
- Verifique os logs de build no Netlify

### **Erro de Deploy:**
- Confirme se o repositório está público ou o Netlify tem acesso
- Verifique se o branch está correto (main)
- Confirme as configurações de build

### **Site não carrega:**
- Verifique se o domínio está configurado corretamente
- Confirme se o SSL está ativo
- Verifique os logs de erro no Netlify

## 📊 Monitoramento

### **Analytics (Opcional):**
1. Vá em **Site settings > Analytics**
2. Ative o Google Analytics ou Plausible
3. Configure o tracking code

### **Formulários (Opcional):**
1. Vá em **Site settings > Forms**
2. Configure notificações de formulários
3. Integre com Zapier ou webhooks

## 🔄 Deploy Automático

O Netlify fará deploy automático sempre que você:
- Fizer push para o branch `main`
- Criar um Pull Request
- Fazer merge de uma PR

## 📞 Suporte

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com/)
- **Netlify Support:** [support.netlify.com](https://support.netlify.com/)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

**Status:** ✅ Pronto para Deploy
**Última atualização:** Dezembro 2024
