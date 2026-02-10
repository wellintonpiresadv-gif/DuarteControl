
import { LegalCase, Lawyer, Deadline } from '../types';

const CASES_KEY = 'duarte_control_cases';
const LAWYERS_KEY = 'duarte_control_lawyers';
const DEADLINES_KEY = 'duarte_control_deadlines';

// Simulação de latência de rede para preparar a UI para um banco real
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const db = {
  // Processos (Cases)
  getCases: async (): Promise<LegalCase[]> => {
    await delay(400); // Simula busca no servidor Vercel
    const data = localStorage.getItem(CASES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCase: async (newCase: LegalCase): Promise<LegalCase[]> => {
    await delay(600); // Simula salvamento no banco de dados
    const cases = await db.getCases();
    const updated = [newCase, ...cases];
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    return updated;
  },

  updateCase: async (updatedCase: LegalCase): Promise<LegalCase[]> => {
    await delay(600);
    const cases = await db.getCases();
    const index = cases.findIndex(c => c.id === updatedCase.id);
    if (index !== -1) {
      cases[index] = updatedCase;
      localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    }
    return cases;
  },

  deleteCase: async (id: string): Promise<LegalCase[]> => {
    await delay(500);
    const cases = await db.getCases();
    const updated = cases.filter(c => c.id !== id);
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    return updated;
  },

  // Advogados (Lawyers)
  getLawyers: async (): Promise<Lawyer[]> => {
    await delay(300);
    const data = localStorage.getItem(LAWYERS_KEY);
    if (!data) {
      const initial = [
        { id: 'l1', name: 'Dra. Ana Costa', oab: '12345/SP' },
        { id: 'l2', name: 'Dr. Roberto Santos', oab: '67890/RJ' }
      ];
      await db.saveLawyerList(initial);
      return initial;
    }
    return JSON.parse(data);
  },

  saveLawyer: async (lawyer: Lawyer): Promise<Lawyer[]> => {
    await delay(500);
    const lawyers = await db.getLawyers();
    const updated = [...lawyers, lawyer];
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(updated));
    return updated;
  },

  updateLawyer: async (updatedLawyer: Lawyer): Promise<Lawyer[]> => {
    await delay(500);
    const lawyers = await db.getLawyers();
    const index = lawyers.findIndex(l => l.id === updatedLawyer.id);
    if (index !== -1) {
      lawyers[index] = updatedLawyer;
      localStorage.setItem(LAWYERS_KEY, JSON.stringify(lawyers));
    }
    return lawyers;
  },

  deleteLawyer: async (id: string): Promise<Lawyer[]> => {
    await delay(500);
    const lawyers = await db.getLawyers();
    const updated = lawyers.filter(l => l.id !== id);
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(updated));
    return updated;
  },

  saveLawyerList: async (lawyers: Lawyer[]): Promise<void> => {
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(lawyers));
  },

  // Prazos (Deadlines)
  getDeadlines: async (): Promise<Deadline[]> => {
    await delay(400);
    const data = localStorage.getItem(DEADLINES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDeadline: async (deadline: Deadline): Promise<Deadline[]> => {
    await delay(500);
    const deadlines = await db.getDeadlines();
    const updated = [deadline, ...deadlines];
    localStorage.setItem(DEADLINES_KEY, JSON.stringify(updated));
    return updated;
  },

  updateDeadline: async (updatedDeadline: Deadline): Promise<Deadline[]> => {
    await delay(500);
    const deadlines = await db.getDeadlines();
    const index = deadlines.findIndex(d => d.id === updatedDeadline.id);
    if (index !== -1) {
      deadlines[index] = updatedDeadline;
      localStorage.setItem(DEADLINES_KEY, JSON.stringify(deadlines));
    }
    return deadlines;
  },

  deleteDeadline: async (id: string): Promise<Deadline[]> => {
    await delay(400);
    const deadlines = await db.getDeadlines();
    const updated = deadlines.filter(d => d.id !== id);
    localStorage.setItem(DEADLINES_KEY, JSON.stringify(updated));
    return updated;
  }
};
