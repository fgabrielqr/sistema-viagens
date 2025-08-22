import { Usuario, Veiculo, Paciente, Viagem } from './types';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Dados iniciais para demonstração
const usuariosIniciais: Usuario[] = [
  {
    id: 'admin',
    nome: 'Damir Silva',
    email: 'admin@exemplo.com',
    senha: 'admin123',
    tipo: 'admin'
  }
];

// Função para garantir que o usuário admin existe
export const garantirAdminExiste = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !db) return;
    
    const usuarios = await getUsuarios();
    const adminExiste = usuarios.find(u => u.email === 'admin@exemplo.com');
    
    if (!adminExiste) {
      await addUsuario({
        nome: 'Damir Silva',
        email: 'admin@exemplo.com',
        senha: 'admin123',
        tipo: 'admin'
      });
      console.log('Usuário admin criado automaticamente');
    }
  } catch (error) {
    console.error('Erro ao verificar/criar admin:', error);
  }
};

const veiculosIniciais: Veiculo[] = [];

const pacientesIniciais: Paciente[] = [];

// Funções para gerenciar dados no Firebase Firestore
export const getData = async <T extends Record<string, any>>(collectionName: string, defaultValue: T[]): Promise<T[]> => {
  // Verificar se estamos no lado do cliente e se o Firebase está disponível
  if (typeof window === 'undefined' || !db) {
    return defaultValue;
  }

  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      data.push({ id: doc.id, ...docData } as unknown as T);
    });
    
    // Se não há dados, inicializar com dados padrão
    if (data.length === 0 && defaultValue.length > 0) {
      await initializeCollection(collectionName, defaultValue);
      return defaultValue;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${collectionName}:`, error as Error);
    return defaultValue;
  }
};

export const setData = async <T extends Record<string, any>>(collectionName: string, data: T[]): Promise<void> => {
  // Verificar se estamos no lado do cliente e se o Firebase está disponível
  if (typeof window === 'undefined' || !db) {
    return;
  }

  try {
    // Limpar coleção existente
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Adicionar novos dados
    const addPromises = data.map(item => addDoc(collection(db, collectionName), item));
    await Promise.all(addPromises);
  } catch (error) {
    console.error(`Erro ao salvar dados em ${collectionName}:`, error as Error);
  }
};

// Função para inicializar uma coleção com dados padrão
const initializeCollection = async <T extends Record<string, any>>(collectionName: string, data: T[]): Promise<void> => {
  // Verificar se estamos no lado do cliente e se o Firebase está disponível
  if (typeof window === 'undefined' || !db) {
    return;
  }

  try {
    const addPromises = data.map(item => addDoc(collection(db, collectionName), item));
    await Promise.all(addPromises);
  } catch (error) {
    console.error(`Erro ao inicializar coleção ${collectionName}:`, error as Error);
  }
};

// Funções específicas para cada entidade
export const getUsuarios = async (): Promise<Usuario[]> => {
  return await getData('usuarios', usuariosIniciais);
};

export const setUsuarios = async (usuarios: Usuario[]): Promise<void> => {
  await setData('usuarios', usuarios);
};

export const getVeiculos = async (): Promise<Veiculo[]> => {
  return await getData('veiculos', veiculosIniciais);
};

export const setVeiculos = async (veiculos: Veiculo[]): Promise<void> => {
  await setData('veiculos', veiculos);
};

export const getPacientes = async (): Promise<Paciente[]> => {
  return await getData('pacientes', pacientesIniciais);
};

export const setPacientes = async (pacientes: Paciente[]): Promise<void> => {
  await setData('pacientes', pacientes);
};

export const getViagens = async (): Promise<Viagem[]> => {
  return await getData('viagens', []);
};

export const setViagens = async (viagens: Viagem[]): Promise<void> => {
  await setData('viagens', viagens);
};

// Funções de CRUD individuais
export const addUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<string> => {
  // Verificar se estamos no lado do cliente e se o Firebase está disponível
  if (typeof window === 'undefined' || !db) {
    throw new Error('Firebase não disponível');
  }

  try {
    const docRef = await addDoc(collection(db, 'usuarios'), usuario);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error as Error);
    throw error;
  }
};

export const updateUsuario = async (id: string, usuario: Partial<Usuario>): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await updateDoc(docRef, usuario);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error as Error);
    throw error;
  }
};

export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

export const addVeiculo = async (veiculo: Omit<Veiculo, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'veiculos'), veiculo);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar veículo:', error);
    throw error;
  }
};

export const updateVeiculo = async (id: string, veiculo: Partial<Veiculo>): Promise<void> => {
  try {
    const docRef = doc(db, 'veiculos', id);
    await updateDoc(docRef, veiculo);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    throw error;
  }
};

export const deleteVeiculo = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'veiculos', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    throw error;
  }
};

export const addPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'pacientes'), paciente);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar paciente:', error);
    throw error;
  }
};

export const updatePaciente = async (id: string, paciente: Partial<Paciente>): Promise<void> => {
  try {
    const docRef = doc(db, 'pacientes', id);
    await updateDoc(docRef, paciente);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    throw error;
  }
};

export const deletePaciente = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'pacientes', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    throw error;
  }
};

export const addViagem = async (viagem: Omit<Viagem, 'id'>): Promise<string> => {
  try {
    console.log('Adicionando viagem:', viagem);
    console.log('motoristaId da viagem:', viagem.motoristaId);
    
    const docRef = await addDoc(collection(db, 'viagens'), viagem);
    console.log('Viagem criada com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar viagem:', error);
    throw error;
  }
};

export const updateViagem = async (id: string, viagem: Partial<Viagem>): Promise<void> => {
  try {
    const docRef = doc(db, 'viagens', id);
    await updateDoc(docRef, viagem);
  } catch (error) {
    console.error('Erro ao atualizar viagem:', error);
    throw error;
  }
};

export const deleteViagem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'viagens', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar viagem:', error);
    throw error;
  }
};

// Funções de autenticação
export const autenticarUsuario = async (email: string, senha: string): Promise<Usuario | null> => {
  try {
    const usuarios = await getUsuarios();
    let usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    // Se não encontrou o usuário, verificar se é o admin padrão
    if (!usuario && email === 'admin@exemplo.com' && senha === 'admin123') {
      // Criar usuário admin se não existir
      const adminExiste = usuarios.find(u => u.email === 'admin@exemplo.com');
      if (!adminExiste) {
        const adminId = await addUsuario({
          nome: 'Damir Silva',
          email: 'admin@exemplo.com',
          senha: 'admin123',
          tipo: 'admin'
        });
        usuario = {
          id: adminId,
          nome: 'Damir Silva',
          email: 'admin@exemplo.com',
          senha: 'admin123',
          tipo: 'admin'
        };
      } else {
        // Se o admin existe mas a senha não confere, retornar null
        return null;
      }
    }
    
    return usuario || null;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
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

// Funções de busca específicas
export const getViagensPorMotorista = async (motoristaId: string): Promise<Viagem[]> => {
  try {
    console.log('Buscando viagens para motoristaId:', motoristaId);
    
    // Primeiro, tentar com ordenação (quando o índice estiver pronto)
    try {
      const q = query(
        collection(db, 'viagens'),
        where('motoristaId', '==', motoristaId),
        orderBy('criadoEm', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const viagens: Viagem[] = [];
      querySnapshot.forEach((doc) => {
        const viagem = { id: doc.id, ...doc.data() } as Viagem;
        console.log('Viagem encontrada:', viagem);
        viagens.push(viagem);
      });
      
      console.log(`Total de viagens encontradas para motorista ${motoristaId}:`, viagens.length);
      return viagens;
    } catch (indexError) {
      console.log('Índice não criado ainda, buscando sem ordenação...');
      
      // Fallback: buscar sem ordenação
      const q = query(
        collection(db, 'viagens'),
        where('motoristaId', '==', motoristaId)
      );
      const querySnapshot = await getDocs(q);
      const viagens: Viagem[] = [];
      querySnapshot.forEach((doc) => {
        const viagem = { id: doc.id, ...doc.data() } as Viagem;
        console.log('Viagem encontrada:', viagem);
        viagens.push(viagem);
      });
      
      // Ordenar no cliente
      viagens.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      
      console.log(`Total de viagens encontradas para motorista ${motoristaId}:`, viagens.length);
      return viagens;
    }
  } catch (error) {
    console.error('Erro ao buscar viagens do motorista:', error);
    return [];
  }
};

export const getVeiculosDisponiveis = async (): Promise<Veiculo[]> => {
  try {
    const q = query(
      collection(db, 'veiculos'),
      where('disponivel', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const veiculos: Veiculo[] = [];
    querySnapshot.forEach((doc) => {
      veiculos.push({ id: doc.id, ...doc.data() } as Veiculo);
    });
    return veiculos;
  } catch (error) {
    console.error('Erro ao buscar veículos disponíveis:', error);
    return [];
  }
};
