'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, MapPin, Users, Car, Edit, Trash2, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getUsuarioLogado, getViagens, getUsuarios, getVeiculos, getPacientes, setViagens } from '@/lib/database';
import { Viagem, Usuario, Veiculo, Paciente, NovaViagemForm } from '@/lib/types';

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
    setViagensState(getViagens());
    setUsuariosState(getUsuarios().filter(u => u.tipo === 'motorista'));
    setVeiculosState(getVeiculos());
    setPacientesState(getPacientes());
    setLoading(false);
  }, [isClient, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaViagem: Viagem = {
      id: Date.now().toString(),
      ...formData,
      status: 'agendada',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    const todasViagens = getViagens();
    const viagensAtualizadas = [...todasViagens, novaViagem];
    setViagens(viagensAtualizadas);
    setViagensState(viagensAtualizadas);
    
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

  const deletarViagem = (viagemId: string) => {
    if (confirm('Tem certeza que deseja deletar esta viagem?')) {
      const todasViagens = getViagens();
      const viagensAtualizadas = todasViagens.filter(v => v.id !== viagemId);
      setViagens(viagensAtualizadas);
      setViagensState(viagensAtualizadas);
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
            <button
              onClick={() => router.push('/admin/cadastrar-motorista')}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Motorista
            </button>
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
            <button
              onClick={() => router.push('/admin/cadastrar-veiculo')}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Veículo
            </button>
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
            <button
              onClick={() => router.push('/admin/cadastrar-paciente')}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Paciente
            </button>
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
                  <h2 className="text-xl font-semibold mb-4">Nova Viagem</h2>
                  
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
                    {viagens.map((viagem) => (
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
      </div>
    </div>
  );
}
