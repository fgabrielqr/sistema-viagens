# Sistema de Viagens

Sistema para gerenciamento de viagens e motoristas desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Deploy no Netlify

### Opção 1: Deploy via GitHub (Recomendado)

1. **Faça push do código para o GitHub:**
   ```bash
   git add .
   git commit -m "Preparando para deploy no Netlify"
   git push origin main
   ```

2. **Acesse o Netlify:**
   - Vá para [netlify.com](https://netlify.com)
   - Faça login ou crie uma conta

3. **Conecte com GitHub:**
   - Clique em "New site from Git"
   - Escolha "GitHub"
   - Autorize o Netlify a acessar seus repositórios
   - Selecione este repositório

4. **Configure o build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18 (ou superior)

5. **Deploy:**
   - Clique em "Deploy site"
   - Aguarde o build completar

### Opção 2: Deploy via Drag & Drop

1. **Build local:**
   ```bash
   npm run build
   ```

2. **Compacte a pasta .next:**
   - Vá para a pasta `.next` no seu projeto
   - Compacte toda a pasta em um arquivo ZIP

3. **Upload no Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Arraste o arquivo ZIP para a área de deploy
   - Aguarde o upload e deploy

## 🔧 Configurações do Projeto

### Variáveis de Ambiente (Opcional)
Se necessário, configure no Netlify:
- Vá em Site settings > Environment variables
- Adicione variáveis se houver

### Domínio Personalizado
1. Vá em Site settings > Domain management
2. Clique em "Add custom domain"
3. Siga as instruções para configurar DNS

## 📱 Funcionalidades

- ✅ **Login de Administrador e Motorista**
- ✅ **Cadastro de Motoristas**
- ✅ **Cadastro de Veículos**
- ✅ **Cadastro de Pacientes**
- ✅ **Gerenciamento de Viagens**
- ✅ **Formatação Automática de Telefone**
- ✅ **Interface Responsiva**

## 🛠 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase Firestore** - Persistência de dados em nuvem
- **Lucide React** - Ícones

## 📋 Credenciais de Teste

### Administrador:
- **Email:** admin@exemplo.com
- **Senha:** admin123

### Motorista:
- **Email:** joao@exemplo.com
- **Senha:** 123456

## 🔗 Links Úteis

- [Netlify Docs](https://docs.netlify.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Docs](https://firebase.google.com/docs)

## 🔥 Firebase Setup

Para configurar o Firebase, consulte o arquivo [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

**Status:** ✅ Pronto para Deploy com Firebase
**Versão:** 2.0 - Firebase Integration
