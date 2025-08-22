import { Usuario, Veiculo, Paciente, Viagem } from './types';

// Dados iniciais para demonstração
const usuariosIniciais: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    senha: '123456',
    tipo: 'motorista',
    telefone: '(11) 99999-9999'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@exemplo.com',
    senha: '123456',
    tipo: 'motorista',
    telefone: '(11) 88888-8888'
  },
  {
    id: 'admin',
    nome: 'Damir Silva',
    email: 'admin@exemplo.com',
    senha: 'admin123',
    tipo: 'admin'
  }
];

const veiculosIniciais: Veiculo[] = [
  {
    id: '1',
    placa: 'ABC-1234',
    modelo: 'Sprinter',
    marca: 'Mercedes',
    ano: 2020,
    disponivel: true
  },
  {
    id: '2',
    placa: 'DEF-5678',
    modelo: 'Transit',
    marca: 'Ford',
    ano: 2021,
    disponivel: true
  }
];

const pacientesIniciais: Paciente[] = [
  {
    id: '1',
    nome: 'Ana Oliveira',
    endereco: 'Rua das Flores, 123',
    telefone: '(11) 77777-7777',
    cidade: 'São Paulo'
  },
  {
    id: '2',
    nome: 'Carlos Pereira',
    endereco: 'Av. Paulista, 456',
    telefone: '(11) 66666-6666',
    cidade: 'São Paulo'
  }
];

// Funções para gerenciar dados no localStorage
export const getData = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

export const setData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Funções específicas para cada entidade
export const getUsuarios = (): Usuario[] => {
  return getData('usuarios', usuariosIniciais);
};

export const setUsuarios = (usuarios: Usuario[]): void => {
  setData('usuarios', usuarios);
};

export const getVeiculos = (): Veiculo[] => {
  return getData('veiculos', veiculosIniciais);
};

export const setVeiculos = (veiculos: Veiculo[]): void => {
  setData('veiculos', veiculos);
};

export const getPacientes = (): Paciente[] => {
  return getData('pacientes', pacientesIniciais);
};

export const setPacientes = (pacientes: Paciente[]): void => {
  setData('pacientes', pacientes);
};

export const getViagens = (): Viagem[] => {
  return getData('viagens', []);
};

export const setViagens = (viagens: Viagem[]): void => {
  setData('viagens', viagens);
};

// Funções de autenticação
export const autenticarUsuario = (email: string, senha: string): Usuario | null => {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  return usuario || null;
};

export const getUsuarioLogado = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('usuarioLogado');
  return data ? JSON.parse(data) : null;
};

export const setUsuarioLogado = (usuario: Usuario | null): void => {
  if (typeof window === 'undefined') return;
  if (usuario) {
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  } else {
    localStorage.removeItem('usuarioLogado');
  }
};
