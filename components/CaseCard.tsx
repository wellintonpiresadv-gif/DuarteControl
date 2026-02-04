
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
    e.stopPropagation();
    setLoading(true);
    const text = await getLegalInsight(legalCase);
    setInsight(text || "Sem informações adicionais.");
    setLoading(false);
  };

  const getStatusColor = (status: LegalCase['status']) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-800 text-white';
      case 'Julgado': return 'bg-slate-900 text-white';
      case 'Arquivado': return 'bg-slate-200 text-slate-700';
      case 'Suspenso': return 'bg-amber-600 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div 
      onClick={() => onClick?.(legalCase)}
      className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:border-emerald-800/30 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="p-7 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-3 py-1 text-[9px] font-black rounded-full bg-slate-100 text-slate-700 uppercase mb-3 tracking-widest">
              Processo Judicial
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-none group-hover:text-emerald-900 transition-colors tracking-tight">
              #{legalCase.processNumber}
            </h3>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1.5 text-[10px] rounded-lg font-black uppercase tracking-tighter shadow-sm ${getStatusColor(legalCase.status)}`}>
              {legalCase.status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-sm text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-lg mr-3 group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Autor</p>
              <p className="font-bold text-slate-800">{legalCase.author}</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-lg mr-3 group-hover:bg-emerald-50 group-hover:text-emerald-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Advogado</p>
              <p className="font-bold text-slate-800">{legalCase.lawyer}</p>
            </div>
          </div>
        </div>

        {insight && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] text-emerald-900 leading-relaxed italic animate-in slide-in-from-top-2">
            <span className="font-black uppercase tracking-widest mr-2 text-[9px] not-italic">Insight IA:</span> {insight}
          </div>
        )}
      </div>

      <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
        <span className="uppercase tracking-widest">REGISTRADO EM {new Date(legalCase.dateAdded).toLocaleDateString()}</span>
        <button 
          onClick={handleGetInsight}
          disabled={loading}
          className="text-emerald-800 font-black hover:underline uppercase tracking-widest"
        >
          {loading ? 'Analisando...' : 'IA INSIGHT'}
        </button>
      </div>
    </div>
  );
};

export default CaseCard;
