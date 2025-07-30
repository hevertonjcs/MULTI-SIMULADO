import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value) => {
  let num;
  if (typeof value === 'string') {
    num = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  } else if (typeof value === 'number') {
    num = value;
  } else {
    return 'R$ 0,00'; 
  }
  
  if (isNaN(num)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const parseCurrency = (value) => {
  if (typeof value !== 'string' || value.trim() === '') return 0;
  const cleanedValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};