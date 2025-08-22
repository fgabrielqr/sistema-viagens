'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Car, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getUsuarioLogado, getViagensPorMotorista, updateViagem } from '@/lib/database';
import { Viagem } from '@/lib/types';

export default function MotoristaPage() {
  const router = useRouter();
  const [viagens, setViagensState] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const usuario = getUsuarioLogado();
    
    // Verificar se o usuário está logado e é motorista
    if (!usuario) {
      router.push('/');
      return;
    }

    if (usuario.tipo !== 'motorista') {
      router.push('/admin');
      return;
    }

    // Carregar viagens do motorista
    const carregarViagens = async () => {
      try {
        console.log('Usuário logado:', usuario);
        console.log('ID do motorista:', usuario.id);
        
        const viagensMotorista = await getViagensPorMotorista(usuario.id);
        setViagensState(viagensMotorista);
      } catch (error) {
        console.error('Erro ao carregar viagens:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarViagens();
  }, [isClient, router]);

  const atualizarStatusViagem = async (viagemId: string, novoStatus: Viagem['status']) => {
    try {
      await updateViagem(viagemId, { 
        status: novoStatus, 
        atualizadoEm: new Date().toISOString() 
      });
      
      // Recarregar viagens do motorista
      const usuario = getUsuarioLogado();
      if (usuario) {
        const viagensMotorista = await getViagensPorMotorista(usuario.id);
        setViagensState(viagensMotorista);
      }
    } catch (error) {
      console.error('Erro ao atualizar status da viagem:', error);
      alert('Erro ao atualizar status da viagem. Tente novamente.');
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

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Painel do Motorista" />
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
      <Navbar title="Painel do Motorista" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Viagens</h1>
          <p className="mt-2 text-gray-600">
            Gerencie suas viagens e acompanhe o status de cada uma
          </p>
        </div>

        {/* Viagens */}
        {viagens.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma viagem encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não tem viagens agendadas.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {viagens.map((viagem) => (
              <div key={viagem.id} className="bg-white rounded-lg shadow-sm border p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Viagem para {viagem.cidade}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viagem.status)}`}>
                      {getStatusText(viagem.status)}
                    </span>
                  </div>
                </div>

                {/* Detalhes da Viagem */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatarData(viagem.data)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{viagem.horario}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{viagem.cidade}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{viagem.pacientes.length} paciente(s)</span>
                  </div>
                </div>

                {/* Lista de Pacientes */}
                {viagem.pacientes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Pacientes:</h4>
                    <div className="space-y-2">
                      {viagem.pacientes.map((paciente) => (
                        <div key={paciente.id} className="text-sm text-gray-600">
                          <div className="font-medium">{paciente.nome}</div>
                          <div className="text-xs text-gray-500">{paciente.endereco}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {viagem.observacoes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Observações:</h4>
                    <p className="text-sm text-gray-600">{viagem.observacoes}</p>
                  </div>
                )}

                {/* Ações */}
                {viagem.status === 'agendada' && (
                  <div className="mt-4 pt-4 border-t flex space-x-2">
                    <button
                      onClick={() => atualizarStatusViagem(viagem.id, 'em_andamento')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Iniciar
                    </button>
                    <button
                      onClick={() => atualizarStatusViagem(viagem.id, 'cancelada')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </div>
                )}

                {viagem.status === 'em_andamento' && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => atualizarStatusViagem(viagem.id, 'concluida')}
                      className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir Viagem
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
