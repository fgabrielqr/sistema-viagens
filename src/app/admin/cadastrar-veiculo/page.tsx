'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ArrowLeft, Save, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getUsuarioLogado, getVeiculos, setVeiculos } from '@/lib/database';
import { Veiculo } from '@/lib/types';

export default function CadastrarVeiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    disponivel: true
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
    if (!formData.placa || !formData.modelo || !formData.marca || !formData.ano) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    const anoAtual = new Date().getFullYear();
    const anoVeiculo = parseInt(formData.ano);
    if (anoVeiculo < 1900 || anoVeiculo > anoAtual + 1) {
      setError('Ano do veículo inválido');
      setLoading(false);
      return;
    }

    try {
      const veiculos = getVeiculos();
      
      // Verificar se a placa já existe
      const placaExiste = veiculos.find(v => v.placa.toUpperCase() === formData.placa.toUpperCase());
      if (placaExiste) {
        setError('Esta placa já está cadastrada');
        setLoading(false);
        return;
      }

      // Criar novo veículo
      const novoVeiculo: Veiculo = {
        id: Date.now().toString(),
        placa: formData.placa.toUpperCase(),
        modelo: formData.modelo,
        marca: formData.marca,
        ano: anoVeiculo,
        disponivel: formData.disponivel
      };

      // Adicionar à lista de veículos
      const novaListaVeiculos = [...veiculos, novoVeiculo];
      setVeiculos(novaListaVeiculos);

      setSuccess('Veículo cadastrado com sucesso!');
      
      // Limpar formulário
      setFormData({
        placa: '',
        modelo: '',
        marca: '',
        ano: '',
        disponivel: true
      });

    } catch (err) {
      setError('Erro ao cadastrar veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // Mostrar loading até estar no cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Cadastrar Veículo" />
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
      <Navbar title="Cadastrar Veículo" />
      
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
            <Truck className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Cadastrar Novo Veículo</h1>
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
              <label htmlFor="placa" className="block text-sm font-medium text-gray-900 mb-1">
                Placa *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleInputChange}
                required
                maxLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-gray-900"
                placeholder="ABC-1234"
              />
            </div>

            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-gray-900 mb-1">
                Marca *
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Ex: Mercedes, Ford, Volkswagen"
              />
            </div>

            <div>
              <label htmlFor="modelo" className="block text-sm font-medium text-gray-900 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Ex: Sprinter, Transit, Kombi"
              />
            </div>

            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-900 mb-1">
                Ano *
              </label>
              <input
                type="number"
                id="ano"
                name="ano"
                value={formData.ano}
                onChange={handleInputChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="2023"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponivel"
                name="disponivel"
                checked={formData.disponivel}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
                Veículo disponível para uso
              </label>
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
                    Cadastrar Veículo
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
