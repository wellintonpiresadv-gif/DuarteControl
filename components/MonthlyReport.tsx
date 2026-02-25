
import React, { useState, useMemo } from 'react';
import { LegalCase } from '../types';

interface MonthlyReportProps {
  cases: LegalCase[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ cases }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const yearsArray = [];
    for (let i = currentYear; i >= startYear; i--) {
      yearsArray.push(i);
    }
    return yearsArray;
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const date = new Date(c.dateAdded);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [cases, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              Relatório <span className="text-emerald-500">Mensal de Processos</span>
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
              Consolidado de registros por período
            </p>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Mês</label>
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white focus:border-emerald-500 outline-none font-bold appearance-none min-w-[160px]"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Ano</label>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white focus:border-emerald-500 outline-none font-bold appearance-none min-w-[120px]"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button 
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden print:shadow-none print:border-none print:bg-white">
        <div className="p-10">
          <div className="hidden print:block mb-8 border-b-2 border-slate-200 pb-4">
            <h1 className="text-2xl font-black uppercase text-slate-900">DuarteControl - Relatório de Processos</h1>
            <p className="text-slate-600 font-bold uppercase text-sm">{months[selectedMonth]} de {selectedYear}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-200">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Data de Registro</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Nº do Processo</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Autor</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Advogado</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length > 0 ? (
                  filteredCases.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()).map(c => (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors print:border-slate-100 print:hover:bg-transparent">
                      <td className="py-4 px-4 text-xs font-bold text-slate-300 print:text-slate-900">
                        {new Date(c.dateAdded).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-4 text-xs font-black text-white uppercase print:text-slate-900">
                        {c.processNumber}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-300 print:text-slate-900">
                        {c.author}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-300 print:text-slate-900">
                        {c.lawyer}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          c.status === 'Ativo' ? 'bg-emerald-900/30 text-emerald-500' :
                          c.status === 'Julgado' ? 'bg-blue-900/30 text-blue-500' :
                          'bg-slate-800 text-slate-500'
                        } print:border print:border-slate-200 print:bg-transparent print:text-slate-700`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-600 text-xs font-black uppercase tracking-widest">Nenhum processo registrado neste período</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-between items-center print:mt-12">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Total de registros: {filteredCases.length}
            </p>
            <p className="hidden print:block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Gerado em: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:text-slate-900 { color: #0f172a !important; }
          .print\\:text-slate-700 { color: #334155 !important; }
          .print\\:border-slate-200 { border-color: #e2e8f0 !important; }
          .print\\:border-slate-100 { border-color: #f1f5f9 !important; }
        }
      `}} />
    </div>
  );
};

export default MonthlyReport;
