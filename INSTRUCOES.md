# Instruções para Executar o Sistema de Viagens

## Problema de Permissão no PowerShell

Se você encontrar o erro "execução de scripts foi desabilitada", siga estas etapas:

### Solução 1: Executar como Administrador
1. Abra o PowerShell como **Administrador**
2. Execute o comando:
   ```powershell
   Set-ExecutionPolicy RemoteSigned
   ```
3. Digite "S" ou "Y" para confirmar

### Solução 2: Usar o Prompt de Comando (CMD)
1. Abra o **Prompt de Comando** (CMD)
2. Navegue até a pasta do projeto:
   ```cmd
   cd "C:\Users\Sec. Saúde\sistema-viagens"
   ```

## Passos para Executar o Projeto

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar o Projeto
```bash
npm run dev
```

### 3. Acessar o Sistema
- Abra seu navegador
- Acesse: http://localhost:3000

## Credenciais de Login

### Administrador:
- **Email:** admin@exemplo.com
- **Senha:** admin123

### Motorista:
- **Email:** joao@exemplo.com
- **Senha:** 123456

## Funcionalidades

### Como Administrador:
1. Faça login com as credenciais de admin
2. Clique em "Nova Viagem" para criar uma viagem
3. Selecione motorista, veículo, pacientes, cidade, data e horário
4. Visualize todas as viagens na tabela
5. Clique no ícone de olho para ver detalhes

### Como Motorista:
1. Faça login com as credenciais de motorista
2. Veja suas viagens agendadas
3. Clique em "Iniciar" para começar uma viagem
4. Clique em "Concluir Viagem" quando terminar
5. Veja os detalhes dos pacientes e endereços

## Suporte

Se encontrar problemas:
1. Verifique se o Node.js está instalado (versão 18+)
2. Certifique-se de estar na pasta correta do projeto
3. Tente deletar a pasta `node_modules` e executar `npm install` novamente
