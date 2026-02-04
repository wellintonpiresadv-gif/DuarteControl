
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
      case 'Ativo': return 'bg-green-100 text-green-700 border-green-200';
      case 'Julgado': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Arquivado': return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'Suspenso': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Detalhes do Processo</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit?.(legalCase)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center text-sm font-bold"
              title="Editar Processo"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Número Identificador</p>
              <h3 className="text-3xl font-black text-slate-900">{legalCase.processNumber}</h3>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(legalCase.status)}`}>
              {legalCase.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Autor do Processo</p>
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">{legalCase.author}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Data de Registro</p>
                <div className="flex items-center space-x-3 text-slate-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{new Date(legalCase.dateAdded).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Advogado Responsável</p>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-slate-800">{legalCase.lawyer}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Documentos Anexos</p>
                {legalCase.pdfName ? (
                  <button 
                    onClick={handleViewPdf}
                    className="flex items-center space-x-3 p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors w-full group"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-sm truncate">{legalCase.pdfName}</span>
                    <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                ) : (
                  <span className="text-sm text-slate-400 italic">Nenhum anexo disponível</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Observações do Sistema
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Este processo está sob responsabilidade direta de {legalCase.lawyer}. 
              Certifique-se de manter os documentos atualizados conforme as movimentações processuais.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
