
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import CaseCard from './components/CaseCard';
import CaseDetailsModal from './components/CaseDetailsModal';
import { LegalCase, AppView, SearchMode, Lawyer } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States para Formulários
  const [formData, setFormData] = useState({
    processNumber: '',
    author: '',
    lawyerId: '',
    pdfData: '',
    pdfName: '',
    status: 'Ativo' as LegalCase['status']
  });

  const [lawyerForm, setLawyerForm] = useState({
    name: '',
    oab: ''
  });

  // States de Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('number');
  const [lawyerSearchTerm, setLawyerSearchTerm] = useState('');
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');

  // Carregamento Inicial
  useEffect(() => {
    setCases(db.getCases());
    setLawyers(db.getLawyers());
  }, []);

  // Iniciar Edição
  const startEditCase = (c: LegalCase) => {
    setEditingCase(c);
    setFormData({
      processNumber: c.processNumber,
      author: c.author,
      lawyerId: c.lawyerId,
      pdfData: c.pdfData || '',
      pdfName: c.pdfName || '',
      status: c.status
    });
    setSelectedCase(null);
    setView(AppView.EDIT_CASE);
  };

  // Handlers de Advogados
  const handleAddLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerForm.name) return;
    
    const newLawyer: Lawyer = {
      id: Math.random().toString(36).substr(2, 9),
      name: lawyerForm.name,
      oab: lawyerForm.oab
    };
    
    const updated = db.saveLawyer(newLawyer);
    setLawyers(updated);
    setLawyerForm({ name: '', oab: '' });
    alert('Profissional cadastrado!');
  };

  // Handlers de Processos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, pdfData: reader.result as string, pdfName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processNumber || !formData.author || !formData.lawyerId) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const lawyerObj = lawyers.find(l => l.id === formData.lawyerId);

    if (view === AppView.EDIT_CASE && editingCase) {
      const updatedCase: LegalCase = {
        ...editingCase,
        processNumber: formData.processNumber,
        author: formData.author,
        lawyerId: formData.lawyerId,
        lawyer: lawyerObj?.name || 'Não Identificado',
        status: formData.status,
        pdfData: formData.pdfData,
        pdfName: formData.pdfName
      };
      const updatedList = db.updateCase(updatedCase);
      setCases(updatedList);
      alert('Registro atualizado!');
    } else {
      const newCase: LegalCase = {
        id: Math.random().toString(36).substr(2, 9),
        processNumber: formData.processNumber,
        author: formData.author,
        lawyerId: formData.lawyerId,
        lawyer: lawyerObj?.name || 'Não Identificado',
        dateAdded: new Date().toISOString(),
        status: formData.status,
        pdfData: formData.pdfData,
        pdfName: formData.pdfName
      };
      const updatedList = db.saveCase(newCase);
      setCases(updatedList);
      alert('Novo processo registrado!');
    }

    setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
    setEditingCase(null);
    setView(AppView.HOME);
  };

  // Filtragens
  const filteredCases = useMemo(() => {
    if (!searchTerm) return cases;
    const term = searchTerm.toLowerCase();
    return cases.filter(c => {
      if (searchMode === 'number') return c.processNumber.toLowerCase().includes(term);
      if (searchMode === 'author') return c.author.toLowerCase().includes(term);
      if (searchMode === 'lawyer') return c.lawyer.toLowerCase().includes(term);
      return false;
    });
  }, [cases, searchTerm, searchMode]);

  const casesByLawyer = useMemo(() => {
    const groups: { [key: string]: LegalCase[] } = {};
    const filtered = lawyerSearchTerm ? cases.filter(c => c.lawyer.toLowerCase().includes(lawyerSearchTerm.toLowerCase())) : cases;
    filtered.forEach(c => {
      if (!groups[c.lawyer]) groups[c.lawyer] = [];
      groups[c.lawyer].push(c);
    });
    return groups;
  }, [cases, lawyerSearchTerm]);

  const casesByAuthor = useMemo(() => {
    const groups: { [key: string]: LegalCase[] } = {};
    const filtered = authorSearchTerm ? cases.filter(c => c.author.toLowerCase().includes(authorSearchTerm.toLowerCase())) : cases;
    filtered.forEach(c => {
      if (!groups[c.author]) groups[c.author] = [];
      groups[c.author].push(c);
    });
    return groups;
  }, [cases, authorSearchTerm]);

  // Views
  const renderHome = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-700">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total de Processos</p>
          <p className="text-4xl font-black text-slate-900">{cases.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Corpo Jurídico</p>
          <p className="text-4xl font-black text-slate-900">{lawyers.length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status Interno</p>
            <p className="text-xl font-bold">Painel Executivo</p>
          </div>
          <svg className="w-10 h-10 text-emerald-500 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button onClick={() => setView(AppView.SEARCH)} className="p-8 bg-slate-950 text-white rounded-3xl hover:bg-slate-900 transition-all text-left group shadow-lg">
          <div className="bg-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Buscar Registros</p>
          <p className="text-sm text-slate-500 mt-2">Localização instantânea</p>
        </button>
        <button onClick={() => setView(AppView.LAWYERS)} className="p-8 bg-white border border-slate-200 text-slate-900 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all text-left group">
          <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-700 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Por Advogado</p>
          <p className="text-sm text-slate-400 mt-2">Visão por profissional</p>
        </button>
        <button onClick={() => setView(AppView.AUTHORS)} className="p-8 bg-white border border-slate-200 text-slate-900 rounded-3xl hover:border-emerald-200 hover:shadow-xl transition-all text-left group">
          <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Por Autor</p>
          <p className="text-sm text-slate-400 mt-2">Visão por requerente</p>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center uppercase tracking-tight">
          <span className="w-2 h-8 bg-blue-700 rounded-full mr-4 shadow-sm"></span>
          Últimas Movimentações
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.slice(0, 6).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
          {cases.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="font-bold">Nenhum processo no registro.</p>
              <button onClick={() => setView(AppView.REGISTER)} className="text-blue-600 font-black text-xs mt-2 hover:underline tracking-widest uppercase">Começar Agora</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderForm = (isEdit: boolean = false) => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter uppercase">
          {isEdit ? 'Atualizar' : 'Novo'} <span className="text-blue-700">Processo</span>
        </h2>
        <form onSubmit={handleSaveCase} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Número do Processo</label>
              <input type="text" required placeholder="0000000-00.0000.0.00.0000" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium" value={formData.processNumber} onChange={e => setFormData({...formData, processNumber: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Autor / Requerente</label>
              <input type="text" required placeholder="Nome completo" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Advogado Responsável</label>
            <div className="flex space-x-2">
              <select 
                required
                className="flex-grow px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium appearance-none"
                value={formData.lawyerId}
                onChange={e => setFormData({...formData, lawyerId: e.target.value})}
              >
                <option value="">Selecione um profissional...</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} {l.oab ? `(OAB: ${l.oab})` : ''}</option>)}
              </select>
              <button type="button" onClick={() => setView(AppView.MANAGE_LAWYERS)} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg" title="Novo Advogado">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Estado do Processo</label>
              <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                <option value="Ativo">Ativo</option>
                <option value="Julgado">Julgado</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Documento PDF</label>
              <div className="relative group">
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-full px-5 py-3 border-2 border-dashed rounded-2xl text-center transition-all ${formData.pdfName ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-blue-400'}`}>
                  <span className="text-xs font-bold">{formData.pdfName || 'Clique para anexar arquivo'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <button 
              type="button" 
              onClick={() => setView(AppView.HOME)} 
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button type="submit" className={`flex-grow px-8 py-4 ${isEdit ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-700 hover:bg-blue-800'} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-900/20 transition-all active:scale-95`}>
              {isEdit ? 'Confirmar Alterações' : 'Registrar Processo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderManageLawyers = () => (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Corpo <span className="text-blue-700">Jurídico</span></h2>
        <form onSubmit={handleAddLawyer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome Completo</label>
            <input type="text" required placeholder="Dr. Nome Sobrenome" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all" value={lawyerForm.name} onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Registro OAB</label>
            <input type="text" placeholder="00000/UF" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all" value={lawyerForm.oab} onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-3 px-6 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg active:scale-95">Cadastrar</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Profissionais Registrados</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">{lawyers.length} TOTAL</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Advogado</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">OAB</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Processos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lawyers.map(l => (
                <tr key={l.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-800 group-hover:text-blue-700">{l.name}</td>
                  <td className="px-8 py-5 text-slate-500 font-mono text-sm">{l.oab || '---'}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black group-hover:bg-blue-700 transition-colors">
                      {cases.filter(c => c.lawyerId === l.id).length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-10">
      <div className="bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl">
        <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Pesquisa de <span className="text-emerald-500">Registros</span></h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={`Digite para filtrar por ${searchMode === 'number' ? 'número' : searchMode === 'author' ? 'autor' : 'advogado'}...`} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {['number', 'author', 'lawyer'].map(m => (
              <button key={m} onClick={() => setSearchMode(m as any)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${searchMode === m ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{m === 'number' ? 'Nº Processo' : m}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        {filteredCases.length === 0 && <div className="col-span-full py-24 text-center text-slate-400 font-bold italic opacity-40">Nenhum registro encontrado para estes critérios.</div>}
      </div>
    </div>
  );

  const renderLawyers = () => (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Filtrar por Advogado</h2>
        <input type="text" placeholder="Nome do profissional..." className="w-full px-6 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 font-medium" value={lawyerSearchTerm} onChange={e => setLawyerSearchTerm(e.target.value)} />
      </div>
      <div className="space-y-16">
        {Object.entries(casesByLawyer).map(([name, lawyerCases]) => {
          const typedLawyerCases = lawyerCases as LegalCase[];
          return (
            <div key={name} className="relative">
              <div className="flex items-center space-x-6 mb-10 border-b border-slate-100 pb-8">
                <div className="bg-blue-700 w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">{name.charAt(0)}</div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{name}</h3>
                  <p className="text-xs text-blue-700 font-black uppercase tracking-[0.2em] mt-1">{typedLawyerCases.length} REGISTROS VINCULADOS</p>
                </div>
              </div>
              {['Ativo', 'Julgado'].map(group => {
                const items = typedLawyerCases.filter(c => group === 'Ativo' ? (c.status === 'Ativo' || c.status === 'Suspenso') : (c.status === 'Julgado' || c.status === 'Arquivado'));
                return items.length > 0 && (
                  <div key={group} className="mb-12 last:mb-0">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className={`w-3 h-3 rounded-full ${group === 'Ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{group}s ({items.length})</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {items.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAuthors = () => (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Filtrar por Requerente</h2>
        <input type="text" placeholder="Nome do autor..." className="w-full px-6 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 font-medium" value={authorSearchTerm} onChange={e => setAuthorSearchTerm(e.target.value)} />
      </div>
      <div className="space-y-20">
        {Object.entries(casesByAuthor).map(([name, authorCases]) => {
          const typedAuthorCases = authorCases as LegalCase[];
          return (
            <div key={name} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
              <h3 className="text-3xl font-black text-slate-900 mb-10 border-b border-slate-100 pb-8 flex items-center uppercase tracking-tighter">
                <svg className="w-8 h-8 mr-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {typedAuthorCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.HOME: return renderHome();
      case AppView.REGISTER: return renderForm(false);
      case AppView.EDIT_CASE: return renderForm(true);
      case AppView.SEARCH: return renderSearch();
      case AppView.LAWYERS: return renderLawyers();
      case AppView.AUTHORS: return renderAuthors();
      case AppView.MANAGE_LAWYERS: return renderManageLawyers();
      default: return renderHome();
    }
  };

  return (
    <Layout currentView={view} setView={(v) => { setEditingCase(null); setView(v); }}>
      {renderContent()}
      <CaseDetailsModal 
        legalCase={selectedCase} 
        onClose={() => setSelectedCase(null)} 
        onEdit={startEditCase}
      />
    </Layout>
  );
};

export default App;
