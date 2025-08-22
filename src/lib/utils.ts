import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar telefone brasileiro
export function formatarTelefone(value: string): string {
  // Remove tudo que não é dígito
  const numeros = value.replace(/\D/g, '');
  
  // Aplica a máscara (00) 00000-0000
  if (numeros.length <= 2) {
    return `(${numeros}`;
  } else if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  } else if (numeros.length <= 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  } else {
    // Limita a 11 dígitos (DDD + 9 dígitos)
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  }
}

// Função para remover formatação do telefone
export function removerFormatacaoTelefone(value: string): string {
  return value.replace(/\D/g, '');
}

// Função para validar telefone brasileiro
export function validarTelefone(telefone: string): boolean {
  const numeros = removerFormatacaoTelefone(telefone);
  // Telefone deve ter entre 10 e 11 dígitos (DDD + 8 ou 9 dígitos)
  return numeros.length >= 10 && numeros.length <= 11;
}

// Função para formatar telefone existente (para dados já salvos)
export function formatarTelefoneExistente(telefone: string): string {
  // Se já está formatado, retorna como está
  if (telefone.includes('(') && telefone.includes(')')) {
    return telefone;
  }
  
  // Se não está formatado, aplica a formatação
  return formatarTelefone(telefone);
}
