
import React, { useState } from 'react';
import { Payment, LegalCase } from '../types';
import { db } from '../services/db';

interface PaymentControlProps {
  payments: Payment[];
  cases: LegalCase[];
  onUpdate: () => void;
  setIsLoading: (loading: boolean) => void;
}

const PaymentControl: React.FC<PaymentControlProps> = ({ payments, cases, onUpdate, setIsLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    caseId: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'Pendente' as Payment['status']
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId || !formData.amount || !formData.dueDate) return;

    const selectedCase = cases.find(c => c.id === formData.caseId);
    if (!selectedCase) return;

    setIsLoading(true);
    try {
      if (editingPayment) {
        await db.updatePayment({
          ...editingPayment,
          caseId: formData.caseId,
          clientName: selectedCase.author,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          description: formData.description,
          status: formData.status
        });
      } else {
        await db.savePayment({
          id: Math.random().toString(36).substr(2, 9),
          caseId: formData.caseId,
          clientName: selectedCase.author,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          description: formData.description,
          status: formData.status
        });
      }
      onUpdate();
      setShowForm(false);
      setEditingPayment(null);
      setFormData({ caseId: '', amount: '', dueDate: '', description: '', status: 'Pendente' });
    } catch (err) {
      alert("Erro ao salvar pagamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: Payment) => {
    setEditingPayment(p);
    setFormData({
      caseId: p.caseId,
      amount: p.amount.toString(),
      dueDate: p.dueDate,
      description: p.description || '',
      status: p.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir este registro de pagamento?")) return;
    setIsLoading(true);
    try {
      await db.deletePayment(id);
      onUpdate();
    } catch (err) {
      alert("Erro ao excluir.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group payments by client
  const groupedPayments = payments.reduce((acc, p) => {
    if (!acc[p.clientName]) acc[p.clientName] = [];
    acc[p.clientName].push(p);
    return acc;
  }, {} as Record<string, Payment[]>);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Controle Financeiro</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de pagamentos por cliente</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingPayment(null);
            setFormData({ caseId: '', amount: '', dueDate: '', description: '', status: 'Pendente' });
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          {showForm ? 'CANCELAR' : 'NOVO LANÇAMENTO'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Processo / Cliente</label>
              <select 
                value={formData.caseId}
                onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                required
              >
                <option value="">Selecione um processo</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.processNumber} - {c.author}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor (R$)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Vencimento</label>
              <input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Payment['status']})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição / Observações</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none h-24 resize-none"
                placeholder="Detalhes do pagamento..."
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95"
            >
              {editingPayment ? 'ATUALIZAR LANÇAMENTO' : 'CONFIRMAR LANÇAMENTO'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {Object.keys(groupedPayments).length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-20 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhum pagamento registrado</p>
          </div>
        ) : (
          (Object.entries(groupedPayments) as [string, Payment[]][]).map(([client, clientPayments]) => (
            <div key={client} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{client}</h3>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Total: R$ {clientPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/50">
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {clientPayments.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-xs font-medium text-slate-300">
                          {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {p.description || 'Sem descrição'}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-white">
                          R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                            p.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400' :
                            p.status === 'Atrasado' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentControl;
