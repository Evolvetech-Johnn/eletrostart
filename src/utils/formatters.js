// Utilitários para formatação e máscaras de input

// Formata CEP: 00000-000
export const formatCEP = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
};

// Formata Telefone: (00) 0000-0000 ou (00) 00000-0000
export const formatPhone = (value) => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned.length > 0 ? `(${cleaned}` : '';
  }
  if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  // Celular com 9 dígitos
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

// Formata CPF: 000.000.000-00
export const formatCPF = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

// Formata CNPJ: 00.000.000/0000-00
export const formatCNPJ = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

// Busca endereço pelo CEP usando a API ViaCEP
export const fetchAddressByCEP = async (cep) => {
  const cleanedCEP = cep.replace(/\D/g, '');
  
  if (cleanedCEP.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return {
      endereco: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      complemento: data.complemento || ''
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

// Valida CEP
export const isValidCEP = (cep) => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

// Valida Telefone (10 ou 11 dígitos)
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Valida Email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
