
import React from 'react';
import { LegalCase } from '../types';

interface CaseDetailsModalProps {
  legalCase: LegalCase | null;
  onClose: () => void;
  onEdit?: (c: LegalCase) => void;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ legalCase, onClose, onEdit }) => {
  if (!legalCase) return null;

  const handleViewPdf = () => {
    if (legalCase.pdfData) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${legalCase.pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    }
  };

  const getStatusColor = (status: LegalCase['status']) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20';
      case 'Julgado': return 'bg-slate-900 text-white';
      case 'Arquivado': return 'bg-slate-200 text-slate-700';
      case 'Suspenso': return 'bg-amber-500 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-slate-950 px-8 py-6 flex justify-between items-center text-white border-b border-white/5">
          <div className="flex items-center">
            <div className="w-2 h-6 bg-blue-700 rounded-full mr-4"></div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Detalhes do <span className="text-emerald-500">Processo</span></h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onEdit?.(legalCase)}
              className="px-4 py-2 bg-white/10 hover:bg-blue-700 rounded-xl transition-all flex items-center text-[10px] font-black uppercase tracking-widest"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10">
            <div className="mb-4 md:mb-0">
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.3em] mb-2">Identificador Único</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{legalCase.processNumber}</h3>
            </div>
            <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusColor(legalCase.status)}`}>
              {legalCase.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Requerente</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xl font-black text-slate-800 tracking-tight">{legalCase.author}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data de Entrada</p>
                <div className="flex items-center space-x-4 text-slate-600">
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-bold">{new Date(legalCase.dateAdded).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Responsável Técnico</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xl font-black text-slate-800 tracking-tight">{legalCase.lawyer}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Documentação</p>
                {legalCase.pdfName ? (
                  <button 
                    onClick={handleViewPdf}
                    className="flex items-center space-x-4 p-4 bg-blue-700 text-white rounded-2xl hover:bg-blue-800 transition-all w-full group shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-black text-xs uppercase tracking-widest truncate">{legalCase.pdfName}</span>
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-bold text-center italic">
                    Sem anexos registrados
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
            <h4 className="text-[10px] font-black text-slate-900 mb-4 flex items-center uppercase tracking-[0.2em]">
              <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Notas de Arquivamento
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Este registro está consolidado sob a responsabilidade de {legalCase.lawyer}. 
              Qualquer alteração nos dados do processo deve ser validada e registrada imediatamente para manutenção da integridade institucional.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
