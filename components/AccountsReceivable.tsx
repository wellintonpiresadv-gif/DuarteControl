
import React from 'react';
import { Payment } from '../types';

interface AccountsReceivableProps {
  payments: Payment[];
  onViewAll: () => void;
}

const AccountsReceivable: React.FC<AccountsReceivableProps> = ({ payments, onViewAll }) => {
  const pendingPayments = payments.filter(p => p.status !== 'Pago');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const overduePayments = pendingPayments.filter(p => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(p.dueDate) < today;
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Contas a Receber</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Resumo financeiro pendente</p>
        </div>
        <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
          <span className="text-emerald-500 font-black text-lg">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
        {pendingPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tudo em dia!</p>
          </div>
        ) : (
          pendingPayments.slice(0, 5).map(p => {
            const isOverdue = new Date(p.dueDate) < new Date();
            return (
              <div key={p.id} className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[150px]">{p.clientName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Vence em: {new Date(p.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {isOverdue ? 'Atrasado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {pendingPayments.length > 5 && (
          <p className="text-center text-slate-600 text-[9px] font-black uppercase tracking-widest py-2">
            + {pendingPayments.length - 5} outros lançamentos
          </p>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-700/50"
      >
        VER FINANCEIRO COMPLETO
      </button>
    </div>
  );
};

export default AccountsReceivable;
