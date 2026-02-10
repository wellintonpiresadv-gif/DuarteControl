
export interface Lawyer {
  id: string;
  name: string;
  oab?: string;
}

export interface LegalCase {
  id: string;
  processNumber: string;
  author: string;
  lawyerId: string;
  lawyer: string;
  dateAdded: string;
  status: 'Ativo' | 'Arquivado' | 'Suspenso' | 'Julgado';
  description?: string;
  pdfData?: string;
  pdfName?: string;
}

export type DeadlineType = 'Audiência' | 'Manifestação' | 'Edital' | 'Geral';

export type ManifestationSubType = 
  | 'Contestação' 
  | 'Réplica/Impugnação' 
  | 'Recurso (Apelação)' 
  | 'Agravo de Instrumento' 
  | 'Embargos' 
  | 'Alegações Finais' 
  | 'Manifestação Geral';

export interface Deadline {
  id: string;
  title: string;
  date: string;
  caseId?: string;
  processNumber?: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  type: DeadlineType;
  subType?: ManifestationSubType;
  completed: boolean;
}

export type SearchMode = 'number' | 'author' | 'lawyer';

export enum AppView {
  HOME = 'home',
  REGISTER = 'register',
  EDIT_CASE = 'edit_case',
  SEARCH = 'search',
  LAWYERS = 'lawyers',
  AUTHORS = 'authors',
  MANAGE_LAWYERS = 'manage_lawyers',
  DEADLINES = 'deadlines'
}
