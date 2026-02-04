
import { LegalCase, Lawyer } from '../types';

const CASES_KEY = 'duarte_control_cases';
const LAWYERS_KEY = 'duarte_control_lawyers';

export const db = {
  // Processos
  getCases: (): LegalCase[] => {
    const data = localStorage.getItem(CASES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCase: (newCase: LegalCase) => {
    const cases = db.getCases();
    const updated = [newCase, ...cases];
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    return updated;
  },

  updateCase: (updatedCase: LegalCase) => {
    const cases = db.getCases();
    const index = cases.findIndex(c => c.id === updatedCase.id);
    if (index !== -1) {
      cases[index] = updatedCase;
      localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    }
    return cases;
  },

  deleteCase: (id: string) => {
    const cases = db.getCases();
    const updated = cases.filter(c => c.id !== id);
    localStorage.setItem(CASES_KEY, JSON.stringify(updated));
    return updated;
  },

  // Advogados
  getLawyers: (): Lawyer[] => {
    const data = localStorage.getItem(LAWYERS_KEY);
    if (!data) {
      const initial = [
        { id: 'l1', name: 'Dra. Ana Costa', oab: '12345/SP' },
        { id: 'l2', name: 'Dr. Roberto Santos', oab: '67890/RJ' }
      ];
      db.saveLawyerList(initial);
      return initial;
    }
    return JSON.parse(data);
  },

  saveLawyer: (lawyer: Lawyer) => {
    const lawyers = db.getLawyers();
    const updated = [...lawyers, lawyer];
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(updated));
    return updated;
  },

  updateLawyer: (updatedLawyer: Lawyer) => {
    const lawyers = db.getLawyers();
    const index = lawyers.findIndex(l => l.id === updatedLawyer.id);
    if (index !== -1) {
      lawyers[index] = updatedLawyer;
      localStorage.setItem(LAWYERS_KEY, JSON.stringify(lawyers));
    }
    return lawyers;
  },

  deleteLawyer: (id: string) => {
    const lawyers = db.getLawyers();
    const updated = lawyers.filter(l => l.id !== id);
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(updated));
    return updated;
  },

  saveLawyerList: (lawyers: Lawyer[]) => {
    localStorage.setItem(LAWYERS_KEY, JSON.stringify(lawyers));
  }
};
