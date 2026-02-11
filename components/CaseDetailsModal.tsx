
import React, { useState } from 'react';
import { LegalCase, Deadline, DeadlineType, ManifestationSubType } from '../types';

interface CaseDetailsModalProps {
  legalCase: LegalCase | null;
  onClose: () => void;
  onEdit?: (c: LegalCase) => void;
  onDeleteCase?: (id: string) => Promise<void>;
  onAddDeadline?: (e?: React.FormEvent, data?: any) => Promise<void>;
  onEditDeadline?: (d: Deadline) => void;
  allDeadlines: Deadline[];
  onDeleteDeadline: (id: string) => Promise<void>;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ 
  legalCase, 
  onClose, 
  onEdit, 
  onDeleteCase,
  onAddDeadline,
  onEditDeadline,
  allDeadlines,
  onDeleteDeadline 
}) => {
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    date: '',
    type: 'Manifestação' as DeadlineType,
    subType: 'Manifestação Geral' as ManifestationSubType,
    priority: 'Média' as Deadline['priority']
  });

  if (!legalCase) return null;

  const caseDeadlines = allDeadlines.filter(d => d.caseId === legalCase.id);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddDeadline) {
      await onAddDeadline(undefined, { ...newDeadline, caseId: legalCase.id });
      setShowAddDeadline(false);
      setNewDeadline({ title: '', date: '', type: 'Manifestação', subType: 'Manifestação Geral', priority: 'Média' });
    }
  };

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-950 px-8 py-6 flex justify-between items-center text-white border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-2 h-6 bg-emerald-600 rounded-full mr-4"></div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Gestão do <span className="text-emerald-500">Processo</span></h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onEdit?.(legalCase)}
              className="px-4 py-2 bg-slate-800 hover:bg-emerald-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-300"
            >
              Editar Base
            </button>
            <button 
              onClick={() => onDeleteCase?.(legalCase.id)}
              className="px-4 py-2 bg-red-900/20 hover:bg-red-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white border border-red-900/30"
            >
              Excluir
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-10 max-h-[80vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Protocolo</p>
              <h3 className="text-4xl font-black text-white tracking-tighter leading-none">#{legalCase.processNumber}</h3>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autor</span>
                <span className="text-white font-bold">{legalCase.author}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Advogado</span>
                <span className="text-white font-bold">{legalCase.lawyer}</span>
              </div>
              {legalCase.pdfName && (
                <button onClick={handleViewPdf} className="w-full py-3 bg-emerald-900/20 text-emerald-500 border border-emerald-900/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900/40 transition-all">
                  Ver PDF em Anexo
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Prazos Vinculados</h4>
                <button 
                  onClick={() => setShowAddDeadline(!showAddDeadline)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              {showAddDeadline && (
                <form onSubmit={handleAdd} className="p-5 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
                  <input 
                    type="text" 
                    value={newDeadline.title}
                    onChange={e => setNewDeadline({...newDeadline, title: e.target.value})}
                    placeholder="Título do Prazo"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      value={newDeadline.date}
                      onChange={e => setNewDeadline({...newDeadline, date: e.target.value})}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-emerald-500"
                    />
                    <select 
                      value={newDeadline.type}
                      onChange={e => setNewDeadline({...newDeadline, type: e.target.value as DeadlineType})}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none"
                    >
                      <option value="Manifestação">Manifestação</option>
                      <option value="Audiência">Audiência</option>
                      <option value="Edital">Edital</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>
                  {newDeadline.type === 'Manifestação' && (
                    <select 
                      value={newDeadline.subType}
                      onChange={e => setNewDeadline({...newDeadline, subType: e.target.value as ManifestationSubType})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none"
                    >
                      <option value="Contestação">Contestação</option>
                      <option value="Réplica/Impugnação">Impugnação/Réplica</option>
                      <option value="Recurso (Apelação)">Recurso</option>
                      <option value="Agravo de Instrumento">Agravo</option>
                      <option value="Embargos">Embargos</option>
                      <option value="Alegações Finais">Alegações Finais</option>
                      <option value="Manifestação Geral">Geral</option>
                    </select>
                  )}
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all">Salvar Prazo</button>
                </form>
              )}

              <div className="space-y-3">
                {caseDeadlines.map(d => (
                  <div key={d.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center group">
                    <div className="flex-grow">
                      <p className={`text-xs font-bold ${d.completed ? 'text-slate-600 line-through' : 'text-white'}`}>{d.title}</p>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                        {new Date(d.date).toLocaleDateString()} &bull; {d.type} {d.subType ? `(${d.subType})` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => onEditDeadline?.(d)} className="text-slate-500 hover:text-emerald-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => { if(window.confirm("Excluir este prazo?")) onDeleteDeadline(d.id); }} className="text-slate-600 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {caseDeadlines.length === 0 && <p className="text-center text-[10px] text-slate-600 uppercase font-black tracking-widest py-4">Sem prazos vinculados.</p>}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-[2rem] p-8 border border-slate-800">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Cloud Analysis & Alerts</h4>
             <div className="space-y-6">
                <div className="p-5 bg-emerald-900/10 border border-emerald-900/20 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Resumo de Atividade</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    Este processo está com o status "{legalCase.status}". Verificamos {caseDeadlines.filter(d => !d.completed).length} prazos pendentes no momento.
                  </p>
                </div>
                {caseDeadlines.some(d => !d.completed && (new Date(d.date).getTime() - new Date().getTime()) < 432000000) && (
                   <div className="p-5 bg-red-900/20 border border-red-900/30 rounded-2xl animate-pulse">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">ALERTA DE SEGURANÇA</p>
                      <p className="text-xs text-red-200 leading-relaxed font-bold">
                        Existem prazos com vencimento em menos de 5 dias vinculados a este processo. Ação imediata é recomendada.
                      </p>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div className="bg-slate-950 px-10 py-6 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-10 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl">
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
