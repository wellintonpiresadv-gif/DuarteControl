
import React, { useState } from 'react';
import { LegalCase } from '../types';
import { getLegalInsight } from '../services/geminiService';

interface CaseCardProps {
  legalCase: LegalCase;
  onClick?: (c: LegalCase) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ legalCase, onClick }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetInsight = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede o clique no card de abrir a modal
    setLoading(true);
    const text = await getLegalInsight(legalCase);
    setInsight(text || "Sem informações adicionais.");
    setLoading(false);
  };

  const getStatusColor = (status: LegalCase['status']) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-700';
      case 'Julgado': return 'bg-amber-100 text-amber-700';
      case 'Arquivado': return 'bg-slate-200 text-slate-700';
      case 'Suspenso': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div 
      onClick={() => onClick?.(legalCase)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-600 uppercase mb-2">
              Processo Judicial
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              #{legalCase.processNumber}
            </h3>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(legalCase.status)}`}>
              {legalCase.status}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-slate-600">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-slate-700 mr-1">Autor:</span> {legalCase.author}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium text-slate-700 mr-1">Advogado:</span> {legalCase.lawyer}
          </div>
        </div>

        {insight && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 italic">
            <strong>IA:</strong> {insight}
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Criado em {new Date(legalCase.dateAdded).toLocaleDateString()}</span>
        <button 
          onClick={handleGetInsight}
          disabled={loading}
          className="text-blue-600 font-bold hover:underline"
        >
          {loading ? '...' : 'Insight IA'}
        </button>
      </div>
    </div>
  );
};

export default CaseCard;
