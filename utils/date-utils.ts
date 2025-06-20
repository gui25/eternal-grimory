/**
 * Utilitários para formatação de datas em formato brasileiro
 */

// Formato data para exibição brasileira (25/10/2025)
export function formatDateBR(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formato data para input HTML (YYYY-MM-DD)
export function formatDateForInput(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
}

// Converte data do input (YYYY-MM-DD) para formato brasileiro de exibição
export function inputDateToBR(inputDate: string): string {
  if (!inputDate) return '';
  
  const [year, month, day] = inputDate.split('-');
  return `${day}/${month}/${year}`;
}

// Converte data brasileira (DD/MM/YYYY) para formato do input (YYYY-MM-DD)
export function brDateToInput(brDate: string): string {
  if (!brDate) return '';
  
  const [day, month, year] = brDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Formata data para o frontmatter MDX em formato brasileiro legível
export function formatDateForMDX(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Converte uma data em formato brasileiro legível para Date object
export function parseBRDate(brDate: string): Date | null {
  if (!brDate) return null;
  
  // Formato "3 de Março, 2025"
  const months: Record<string, string> = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
  };
  
  // Tenta formato "3 de março de 2025" primeiro
  const matchWithDe = brDate.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/i);
  if (matchWithDe) {
    const [, day, monthName, year] = matchWithDe;
    const month = months[monthName.toLowerCase()];
    if (month) {
      return new Date(`${year}-${month}-${day.padStart(2, '0')}`);
    }
  }
  
  // Formato "3 de Março, 2025" como fallback
  const match = brDate.match(/(\d+)\s+de\s+(\w+),?\s+(\d+)/i);
  if (match) {
    const [, day, monthName, year] = match;
    const month = months[monthName.toLowerCase()];
    if (month) {
      return new Date(`${year}-${month}-${day.padStart(2, '0')}`);
    }
  }
  
  // Formato DD/MM/YYYY
  const dateMatch = brDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  
  return null;
} 