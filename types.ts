
export interface Lawyer {
  id: string;
  name: string;
  oab?: string;
}

export interface LegalCase {
  id: string;
  processNumber: string;
  author: string;
  lawyerId: string; // Referência ao ID do advogado
  lawyer: string;   // Nome para exibição rápida
  dateAdded: string;
  status: 'Ativo' | 'Arquivado' | 'Suspenso' | 'Julgado';
  description?: string;
  pdfData?: string; // Base64 string
  pdfName?: string;
}

export type SearchMode = 'number' | 'author' | 'lawyer';

export enum AppView {
  HOME = 'home',
  REGISTER = 'register',
  EDIT_CASE = 'edit_case',
  SEARCH = 'search',
  LAWYERS = 'lawyers',
  AUTHORS = 'authors',
  MANAGE_LAWYERS = 'manage_lawyers'
}
