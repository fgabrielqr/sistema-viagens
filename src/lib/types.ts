export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'motorista' | 'admin';
  telefone?: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  disponivel: boolean;
}

export interface Paciente {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  cidade: string;
}

export interface Viagem {
  id: string;
  motoristaId: string;
  veiculoId: string;
  cidade: string;
  data: string;
  horario: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  pacientes: Paciente[];
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginForm {
  email: string;
  senha: string;
}

export interface NovaViagemForm {
  motoristaId: string;
  veiculoId: string;
  cidade: string;
  data: string;
  horario: string;
  pacientes: Paciente[];
  observacoes?: string;
}
