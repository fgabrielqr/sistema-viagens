'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, MapPin, Users, Car, Edit, Trash2, Eye, ChevronLeft, ChevronRight, User, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getUsuarioLogado, getViagens, getUsuarios, getVeiculos, getPacientes, addViagem, deleteViagem, updateUsuario, deleteUsuario, updateVeiculo, deleteVeiculo, updatePaciente, deletePaciente } from '@/lib/database';
import { Viagem, Usuario, Veiculo, Paciente, NovaViagemForm } from '@/lib/types';
import { formatarTelefone, validarTelefone } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const [viagens, setViagensState] = useState<Viagem[]>([]);
  const [usuarios, setUsuariosState] = useState<Usuario[]>([]);
  const [veiculos, setVeiculosState] = useState<Veiculo[]>([]);
  const [pacientes, setPacientesState] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<Viagem | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viagensPerPage] = useState(5);
  
  // Estados para modais de gerenciamento
  const [showMotoristas, setShowMotoristas] = useState(false);
  const [showVeiculos, setShowVeiculos] = useState(false);
  const [showPacientes, setShowPacientes] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'motorista' | 'veiculo' | 'paciente', data: any } | null>(null);
  
  const [formData, setFormData] = useState<NovaViagemForm>({
    motoristaId: '',
    veiculoId: '',
    cidade: '',
    data: '',
    horario: '',
    pacientes: [],
    observacoes: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const usuario = getUsuarioLogado();
    
    // Verificar se o usuário está logado e é admin
    if (!usuario) {
      router.push('/');
      return;
    }

    if (usuario.tipo !== 'admin') {
      router.push('/motorista');
      return;
    }

    // Carregar dados
    const carregarDados = async () => {
      try {
        const [viagens, usuarios, veiculos, pacientes] = await Promise.all([
          getViagens(),
          getUsuarios(),
          getVeiculos(),
          getPacientes()
        ]);
        
        setViagensState(viagens);
        setUsuariosState(usuarios.filter(u => u.tipo === 'motorista'));
        setVeiculosState(veiculos);
        setPacientesState(pacientes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [isClient, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaViagem: Omit<Viagem, 'id'> = {
      ...formData,
      status: 'agendada',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    try {
      await addViagem(novaViagem);
      
      // Recarregar viagens
      const viagensAtualizadas = await getViagens();
      setViagensState(viagensAtualizadas);
      
      // Resetar para a primeira página
      setCurrentPage(1);
      
      // Limpar formulário
      setFormData({
        motoristaId: '',
        veiculoId: '',
        cidade: '',
        data: '',
        horario: '',
        pacientes: [],
        observacoes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      alert('Erro ao criar viagem. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePacienteChange = (pacienteId: string, checked: boolean) => {
    if (checked) {
      const paciente = pacientes.find(p => p.id === pacienteId);
      if (paciente) {
        setFormData({
          ...formData,
          pacientes: [...formData.pacientes, paciente]
        });
      }
    } else {
      setFormData({
        ...formData,
        pacientes: formData.pacientes.filter(p => p.id !== pacienteId)
      });
    }
  };

  const deletarViagem = async (viagemId: string) => {
    if (confirm('Tem certeza que deseja deletar esta viagem?')) {
      try {
        await deleteViagem(viagemId);
        
        // Recarregar viagens
        const viagensAtualizadas = await getViagens();
        setViagensState(viagensAtualizadas);
        
        // Ajustar página atual se necessário
        const newTotalPages = Math.ceil(viagensAtualizadas.length / viagensPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error('Erro ao deletar viagem:', error);
        alert('Erro ao deletar viagem. Tente novamente.');
      }
    }
  };

  const getStatusColor = (status: Viagem['status']) => {
    switch (status) {
      case 'agendada':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Viagem['status']) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getMotoristaNome = (motoristaId: string) => {
    return usuarios.find(u => u.id === motoristaId)?.nome || 'N/A';
  };

  const getVeiculoInfo = (veiculoId: string) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})` : 'N/A';
  };

  // Calcular viagens para a página atual
  const indexOfLastViagem = currentPage * viagensPerPage;
  const indexOfFirstViagem = indexOfLastViagem - viagensPerPage;
  const currentViagens = viagens.slice(indexOfFirstViagem, indexOfLastViagem);
  const totalPages = Math.ceil(viagens.length / viagensPerPage);

  // Função para mudar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Função para ir para a próxima página
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Função para ir para a página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Funções para gerenciar motoristas
  const handleEditMotorista = (motorista: Usuario) => {
    setEditingItem({ type: 'motorista', data: motorista });
  };

  const handleDeleteMotorista = async (motoristaId: string) => {
    if (confirm('Tem certeza que deseja deletar este motorista?')) {
      try {
        await deleteUsuario(motoristaId);
        const usuariosAtualizados = await getUsuarios();
        setUsuariosState(usuariosAtualizados.filter(u => u.tipo === 'motorista'));
      } catch (error) {
        console.error('Erro ao deletar motorista:', error);
        alert('Erro ao deletar motorista. Tente novamente.');
      }
    }
  };

  const handleSaveMotorista = async (motoristaData: Usuario) => {
    try {
      await updateUsuario(motoristaData.id, motoristaData);
      const usuariosAtualizados = await getUsuarios();
      setUsuariosState(usuariosAtualizados.filter(u => u.tipo === 'motorista'));
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error);
      alert('Erro ao atualizar motorista. Tente novamente.');
    }
  };

  // Funções para gerenciar veículos
  const handleEditVeiculo = (veiculo: Veiculo) => {
    setEditingItem({ type: 'veiculo', data: veiculo });
  };

  const handleDeleteVeiculo = async (veiculoId: string) => {
    if (confirm('Tem certeza que deseja deletar este veículo?')) {
      try {
        await deleteVeiculo(veiculoId);
        const veiculosAtualizados = await getVeiculos();
        setVeiculosState(veiculosAtualizados);
      } catch (error) {
        console.error('Erro ao deletar veículo:', error);
        alert('Erro ao deletar veículo. Tente novamente.');
      }
    }
  };

  const handleSaveVeiculo = async (veiculoData: Veiculo) => {
    try {
      await updateVeiculo(veiculoData.id, veiculoData);
      const veiculosAtualizados = await getVeiculos();
      setVeiculosState(veiculosAtualizados);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      alert('Erro ao atualizar veículo. Tente novamente.');
    }
  };

  // Funções para gerenciar pacientes
  const handleEditPaciente = (paciente: Paciente) => {
    setEditingItem({ type: 'paciente', data: paciente });
  };

  const handleDeletePaciente = async (pacienteId: string) => {
    if (confirm('Tem certeza que deseja deletar este paciente?')) {
      try {
        await deletePaciente(pacienteId);
        const pacientesAtualizados = await getPacientes();
        setPacientesState(pacientesAtualizados);
      } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        alert('Erro ao deletar paciente. Tente novamente.');
      }
    }
  };

  const handleSavePaciente = async (pacienteData: Paciente) => {
    try {
      await updatePaciente(pacienteData.id, pacienteData);
      const pacientesAtualizados = await getPacientes();
      setPacientesState(pacientesAtualizados);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      alert('Erro ao atualizar paciente. Tente novamente.');
    }
  };

  // Função para aplicar máscara de telefone (usando a função do utils)
  const aplicarMascaraTelefone = (valor: string) => {
    return formatarTelefone(valor);
  };

  // Função para formatar telefone para exibição
  const formatarTelefoneExibicao = (telefone: string | undefined) => {
    if (!telefone) return '';
    return formatarTelefone(telefone as string);
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Painel Administrativo" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Painel Administrativo" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="mt-2 text-gray-600">
              Gerencie viagens, motoristas, veículos e pacientes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </button>
        </div>

        {/* Seção de Gerenciamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Motoristas */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Motoristas</h3>
                  <p className="text-sm text-gray-600">{usuarios.length} cadastrados</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowMotoristas(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Motoristas
              </button>
              <button
                onClick={() => router.push('/admin/cadastrar-motorista')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Motorista
              </button>
            </div>
          </div>

          {/* Card Veículos */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Veículos</h3>
                  <p className="text-sm text-gray-600">{veiculos.length} na frota</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowVeiculos(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Veículos
              </button>
              <button
                onClick={() => router.push('/admin/cadastrar-veiculo')}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Veículo
              </button>
            </div>
          </div>

          {/* Card Pacientes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pacientes</h3>
                  <p className="text-sm text-gray-600">{pacientes.length} cadastrados</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowPacientes(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Pacientes
              </button>
              <button
                onClick={() => router.push('/admin/cadastrar-paciente')}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Viagens */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Viagens</h2>
              <p className="text-sm text-gray-600">
                Crie e gerencie todas as viagens dos motoristas
              </p>
            </div>
          </div>

          {/* Modal de Nova Viagem */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                <div className="p-6 overflow-y-auto flex-1">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Nova Viagem</h2>
                  
                  <form id="nova-viagem-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Motorista */}
                    <div>
                                             <label className="block text-sm font-medium text-gray-900 mb-1">
                         Motorista
                       </label>
                       <select
                         name="motoristaId"
                         value={formData.motoristaId}
                         onChange={handleInputChange}
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 modal-select"
                       >
                        <option value="">Selecione um motorista</option>
                        {usuarios.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Veículo */}
                    <div>
                                             <label className="block text-sm font-medium text-gray-900 mb-1">
                         Veículo
                       </label>
                       <select
                         name="veiculoId"
                         value={formData.veiculoId}
                         onChange={handleInputChange}
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 modal-select"
                       >
                        <option value="">Selecione um veículo</option>
                        {veiculos.filter(v => v.disponivel).map((veiculo) => (
                          <option key={veiculo.id} value={veiculo.id}>
                            {veiculo.marca} {veiculo.modelo} ({veiculo.placa})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cidade */}
                    <div>
                                             <label className="block text-sm font-medium text-gray-900 mb-1">
                         Cidade
                       </label>
                       <input
                         type="text"
                         name="cidade"
                         value={formData.cidade}
                         onChange={handleInputChange}
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                         placeholder="Digite a cidade"
                       />
                    </div>

                    {/* Data e Horário */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                           Data
                         </label>
                         <input
                           type="date"
                           name="data"
                           value={formData.data}
                           onChange={handleInputChange}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                         />
                      </div>
                      <div>
                                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                           Horário
                         </label>
                         <input
                           type="time"
                           name="horario"
                           value={formData.horario}
                           onChange={handleInputChange}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                         />
                      </div>
                    </div>

                    {/* Pacientes */}
                    <div>
                                             <label className="block text-sm font-medium text-gray-900 mb-2">
                         Pacientes
                       </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                        {pacientes.map((paciente) => (
                          <label key={paciente.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.pacientes.some(p => p.id === paciente.id)}
                              onChange={(e) => handlePacienteChange(paciente.id, e.target.checked)}
                              className="mr-2"
                            />
                                                         <span className="text-sm text-gray-900">
                               {paciente.nome} - {paciente.endereco}
                             </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                                             <label className="block text-sm font-medium text-gray-900 mb-1">
                         Observações
                       </label>
                       <textarea
                         name="observacoes"
                         value={formData.observacoes}
                         onChange={handleInputChange}
                         rows={3}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                         placeholder="Observações adicionais..."
                       />
                    </div>

                  </form>
                </div>
                
                {/* Botões fixos na parte inferior */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      form="nova-viagem-form"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Criar Viagem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Viagens */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Todas as Viagens</h3>
              <p className="text-sm text-gray-600 mt-1">
                Mostrando {indexOfFirstViagem + 1}-{Math.min(indexOfLastViagem, viagens.length)} de {viagens.length} viagens
              </p>
            </div>
            
            {viagens.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma viagem encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Crie uma nova viagem para começar.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detalhes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motorista
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Veículo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentViagens.map((viagem) => (
                        <tr key={viagem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {viagem.cidade}
                              </div>
                              <div className="text-gray-500 space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatarData(viagem.data)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {viagem.horario}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {viagem.pacientes.length} paciente(s)
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getMotoristaNome(viagem.motoristaId)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getVeiculoInfo(viagem.veiculoId)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viagem.status)}`}>
                              {getStatusText(viagem.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2">
                            <button
                              onClick={() => setSelectedViagem(viagem)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletarViagem(viagem.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Botão Anterior */}
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </button>

                        {/* Números das páginas */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        {/* Botão Próximo */}
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Detalhes da Viagem */}
        {selectedViagem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Detalhes da Viagem</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Informações Gerais</h3>
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <div><strong>Cidade:</strong> {selectedViagem.cidade}</div>
                      <div><strong>Data:</strong> {formatarData(selectedViagem.data)}</div>
                      <div><strong>Horário:</strong> {selectedViagem.horario}</div>
                      <div><strong>Motorista:</strong> {getMotoristaNome(selectedViagem.motoristaId)}</div>
                      <div><strong>Veículo:</strong> {getVeiculoInfo(selectedViagem.veiculoId)}</div>
                      <div><strong>Status:</strong> {getStatusText(selectedViagem.status)}</div>
                    </div>
                  </div>

                  {selectedViagem.pacientes.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900">Pacientes</h3>
                      <div className="mt-2 space-y-2">
                        {selectedViagem.pacientes.map((paciente) => (
                          <div key={paciente.id} className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                            <div className="font-medium">{paciente.nome}</div>
                            <div>{paciente.endereco}</div>
                            <div>{paciente.telefone}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedViagem.observacoes && (
                    <div>
                      <h3 className="font-medium text-gray-900">Observações</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedViagem.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setSelectedViagem(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Motoristas */}
        {showMotoristas && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Motoristas Cadastrados</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {usuarios.length} motorista{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 max-h-96">
                {usuarios.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-800">Nenhum motorista encontrado</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Cadastre um motorista para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usuarios.map((motorista) => (
                      <div key={motorista.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{motorista.nome}</h3>
                            <p className="text-sm text-gray-600">{motorista.email}</p>
                            <p className="text-sm text-gray-600">{formatarTelefoneExibicao(motorista.telefone)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditMotorista(motorista)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMotorista(motorista.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMotoristas(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Veículos */}
        {showVeiculos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Veículos Cadastrados</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''} cadastrado{veiculos.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 max-h-96">
                {veiculos.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="mx-auto h-12 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-800">Nenhum veículo encontrado</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Cadastre um veículo para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {veiculos.map((veiculo) => (
                      <div key={veiculo.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{veiculo.marca} {veiculo.modelo}</h3>
                            <p className="text-sm text-gray-600">Placa: {veiculo.placa}</p>
                            <p className="text-sm text-gray-600">Ano: {veiculo.ano}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              veiculo.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {veiculo.disponivel ? 'Disponível' : 'Indisponível'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditVeiculo(veiculo)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVeiculo(veiculo.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVeiculos(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pacientes */}
        {showPacientes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Pacientes Cadastrados</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} cadastrado{pacientes.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 max-h-96">
                {pacientes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-800">Nenhum paciente encontrado</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Cadastre um paciente para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pacientes.map((paciente) => (
                      <div key={paciente.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{paciente.nome}</h3>
                            <p className="text-sm text-gray-600">{paciente.endereco}</p>
                            <p className="text-sm text-gray-600">{formatarTelefoneExibicao(paciente.telefone)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPaciente(paciente)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaciente(paciente.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPacientes(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Editar {editingItem.type === 'motorista' ? 'Motorista' : editingItem.type === 'veiculo' ? 'Veículo' : 'Paciente'}
                </h2>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedData = { ...editingItem.data };
                  
                  if (editingItem.type === 'motorista') {
                    updatedData.nome = formData.get('nome') as string;
                    updatedData.email = formData.get('email') as string;
                    updatedData.telefone = formData.get('telefone') as string;
                    handleSaveMotorista(updatedData);
                  } else if (editingItem.type === 'veiculo') {
                    updatedData.marca = formData.get('marca') as string;
                    updatedData.modelo = formData.get('modelo') as string;
                    updatedData.placa = formData.get('placa') as string;
                    updatedData.ano = formData.get('ano') as string;
                    updatedData.disponivel = formData.get('disponivel') === 'true';
                    handleSaveVeiculo(updatedData);
                  } else if (editingItem.type === 'paciente') {
                    updatedData.nome = formData.get('nome') as string;
                    updatedData.endereco = formData.get('endereco') as string;
                    updatedData.telefone = formData.get('telefone') as string;
                    handleSavePaciente(updatedData);
                  }
                }} className="space-y-4">
                  
                  {editingItem.type === 'motorista' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Nome</label>
                        <input
                          type="text"
                          name="nome"
                          defaultValue={editingItem.data.nome}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={editingItem.data.email}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Telefone</label>
                        <input
                          type="text"
                          name="telefone"
                          defaultValue={formatarTelefoneExibicao(editingItem.data.telefone)}
                          required
                          placeholder="(11) 99999-9999"
                          onChange={(e) => {
                            const valor = e.target.value;
                            const mascara = aplicarMascaraTelefone(valor);
                            e.target.value = mascara;
                          }}
                          onBlur={(e) => {
                            const telefone = e.target.value;
                            if (telefone && !validarTelefone(telefone)) {
                              alert('Por favor, insira um número de telefone válido com DDD (ex: (11) 99999-9999)');
                              e.target.focus();
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Formato: (DDD) 99999-9999</p>
                      </div>
                    </>
                  )}

                  {editingItem.type === 'veiculo' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Marca</label>
                        <input
                          type="text"
                          name="marca"
                          defaultValue={editingItem.data.marca}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Modelo</label>
                        <input
                          type="text"
                          name="modelo"
                          defaultValue={editingItem.data.modelo}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Placa</label>
                        <input
                          type="text"
                          name="placa"
                          defaultValue={editingItem.data.placa}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Ano</label>
                        <input
                          type="text"
                          name="ano"
                          defaultValue={editingItem.data.ano}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Disponível</label>
                        <select
                          name="disponivel"
                          defaultValue={editingItem.data.disponivel.toString()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                    </>
                  )}

                  {editingItem.type === 'paciente' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Nome</label>
                        <input
                          type="text"
                          name="nome"
                          defaultValue={editingItem.data.nome}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Endereço</label>
                        <input
                          type="text"
                          name="endereco"
                          defaultValue={editingItem.data.endereco}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Telefone</label>
                        <input
                          type="text"
                          name="telefone"
                          defaultValue={formatarTelefoneExibicao(editingItem.data.telefone)}
                          required
                          placeholder="(11) 99999-9999"
                          onChange={(e) => {
                            const valor = e.target.value;
                            const mascara = aplicarMascaraTelefone(valor);
                            e.target.value = mascara;
                          }}
                          onBlur={(e) => {
                            const telefone = e.target.value;
                            if (telefone && !validarTelefone(telefone)) {
                              alert('Por favor, insira um número de telefone válido com DDD (ex: (11) 99999-9999)');
                              e.target.focus();
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Formato: (DDD) 99999-9999</p>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
