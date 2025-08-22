'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Save, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getUsuarioLogado, getPacientes, addPaciente } from '@/lib/database';
import { Paciente } from '@/lib/types';
import { formatarTelefone, validarTelefone } from '@/lib/utils';

export default function CadastrarPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    cidade: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar se estamos no cliente
  if (typeof window !== 'undefined' && !isClient) {
    setIsClient(true);
  }

  // Verificar se o usuário está logado e é admin (apenas no cliente)
  if (isClient) {
    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'admin') {
      router.push('/');
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validações
    if (!formData.nome || !formData.endereco || !formData.telefone || !formData.cidade) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    // Validar telefone
    if (!validarTelefone(formData.telefone)) {
      setError('Telefone inválido');
      setLoading(false);
      return;
    }

    try {
      const pacientes = await getPacientes();
      
      // Verificar se já existe um paciente com o mesmo nome e telefone
      const pacienteExiste = pacientes.find(p => 
        p.nome.toLowerCase() === formData.nome.toLowerCase() && 
        p.telefone === formData.telefone
      );
      
      if (pacienteExiste) {
        setError('Já existe um paciente cadastrado com este nome e telefone');
        setLoading(false);
        return;
      }

      // Criar novo paciente
      const novoPaciente = {
        nome: formData.nome,
        endereco: formData.endereco,
        telefone: formData.telefone,
        cidade: formData.cidade
      };

      // Adicionar à lista de pacientes
      await addPaciente(novoPaciente);

      setSuccess('Paciente cadastrado com sucesso!');
      
      // Limpar formulário
      setFormData({
        nome: '',
        endereco: '',
        telefone: '',
        cidade: ''
      });

    } catch (err) {
      setError('Erro ao cadastrar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      // Aplicar formatação apenas para telefone
      setFormData({
        ...formData,
        [name]: formatarTelefone(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Mostrar loading até estar no cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Cadastrar Paciente" />
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
      <Navbar title="Cadastrar Paciente" />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <Heart className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Cadastrar Novo Paciente</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Digite o nome completo do paciente"
              />
            </div>

            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-900 mb-1">
                Endereço Completo *
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Rua, número, bairro, complemento"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-900 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Digite a cidade"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Paciente
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
