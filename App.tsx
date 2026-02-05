
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import CaseCard from './components/CaseCard';
import CaseDetailsModal from './components/CaseDetailsModal';
import Login from './components/Login';
import { LegalCase, AppView, SearchMode, Lawyer } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('duarte_control_auth') === 'true';
  });
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
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
    if (isAuthenticated) {
      setCases(db.getCases());
      setLawyers(db.getLawyers());
    }
  }, [isAuthenticated]);

  // Auth Handlers
  const handleLogin = (user: string, pass: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('duarte_control_auth', 'true');
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair?")) {
      setIsAuthenticated(false);
      localStorage.removeItem('duarte_control_auth');
      setView(AppView.HOME);
    }
  };

  // Handlers de Advogados
  const handleSaveLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerForm.name) return;
    
    if (editingLawyer) {
      const updatedLawyer: Lawyer = {
        ...editingLawyer,
        name: lawyerForm.name,
        oab: lawyerForm.oab
      };
      
      const updatedLawyers = db.updateLawyer(updatedLawyer);
      setLawyers(updatedLawyers);

      // Atualiza o nome do advogado nos processos em memória
      const allCases = db.getCases();
      const updatedCases = allCases.map(c => {
        if (c.lawyerId === updatedLawyer.id) {
          return { ...c, lawyer: updatedLawyer.name };
        }
        return c;
      });
      // Salva de volta se houve alteração nos nomes
      if (JSON.stringify(allCases) !== JSON.stringify(updatedCases)) {
          localStorage.setItem('duarte_control_cases', JSON.stringify(updatedCases));
          setCases(updatedCases);
      }

      setEditingLawyer(null);
      alert('Cadastro atualizado!');
    } else {
      const newLawyer: Lawyer = {
        id: Math.random().toString(36).substr(2, 9),
        name: lawyerForm.name,
        oab: lawyerForm.oab
      };
      const updated = db.saveLawyer(newLawyer);
      setLawyers(updated);
      alert('Profissional cadastrado!');
    }
    setLawyerForm({ name: '', oab: '' });
  };

  const startEditLawyer = (l: Lawyer) => {
    setEditingLawyer(l);
    setLawyerForm({ name: l.name, oab: l.oab || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLawyer = (id: string) => {
    const linkedCases = cases.filter(c => c.lawyerId === id);
    const confirmMsg = linkedCases.length > 0 
      ? `ATENÇÃO: Este advogado possui ${linkedCases.length} processos vinculados. Deseja excluir mesmo assim?`
      : "Tem certeza que deseja remover este profissional?";

    if (window.confirm(confirmMsg)) {
      const updated = db.deleteLawyer(id);
      setLawyers(updated);
      if (editingLawyer?.id === id) {
        setEditingLawyer(null);
        setLawyerForm({ name: '', oab: '' });
      }
    }
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      alert('Processo registrado!');
    }

    setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
    setEditingCase(null);
    setView(AppView.HOME);
  };

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

  // Views Render
  const renderHome = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 border-l-4 border-l-emerald-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Processos Registrados</p>
          <p className="text-4xl font-black text-white">{cases.length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 border-l-4 border-l-slate-700">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Corpo Jurídico</p>
          <p className="text-4xl font-black text-white">{lawyers.length}</p>
        </div>
        <div className="bg-emerald-900/10 p-6 rounded-2xl shadow-xl border border-emerald-900/30 flex justify-between items-center group overflow-hidden relative">
          <div className="z-10">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Status Interno</p>
            <p className="text-xl font-bold text-emerald-100">Escritório Ativo</p>
          </div>
          <svg className="w-20 h-20 text-emerald-600 opacity-20 absolute -right-4 -bottom-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <button 
          onClick={() => { setSearchMode('number'); setView(AppView.SEARCH); }} 
          className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all text-left group shadow-lg border border-slate-800 hover:border-emerald-600/50"
        >
          <div className="bg-emerald-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Nº Processo</p>
          <p className="text-sm text-slate-500 mt-2 italic">Busca direta</p>
        </button>

        <button onClick={() => setView(AppView.SEARCH)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all text-left group shadow-lg border border-slate-800">
          <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Busca Geral</p>
          <p className="text-sm text-slate-500 mt-2">Todos os registros</p>
        </button>

        <button onClick={() => setView(AppView.LAWYERS)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all text-left group shadow-lg border border-slate-800">
          <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Advogados</p>
          <p className="text-sm text-slate-500 mt-2">Gestão por profissional</p>
        </button>

        <button onClick={() => setView(AppView.AUTHORS)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all text-left group shadow-lg border border-slate-800">
          <div className="bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="font-black text-xl uppercase tracking-tighter">Autores</p>
          <p className="text-sm text-slate-500 mt-2">Visão por requerente</p>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-8 flex items-center uppercase tracking-tight">
          <span className="w-2 h-8 bg-emerald-600 rounded-full mr-4 shadow-sm"></span>
          Últimas Atividades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.slice(0, 6).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        </div>
      </div>
    </div>
  );

  // Render method for Search View
  const renderSearch = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-grow relative w-full">
            <svg className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Buscar por ${searchMode === 'number' ? 'número' : searchMode === 'author' ? 'autor' : 'advogado'}...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
            />
          </div>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            {(['number', 'author', 'lawyer'] as SearchMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setSearchMode(mode)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === mode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {mode === 'number' ? 'Nº' : mode === 'author' ? 'Autor' : 'Advogado'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        {filteredCases.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render method for Lawyers Grouped View
  const renderLawyersView = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Visão por <span className="text-emerald-500">Profissional</span></h2>
        <input 
          type="text" 
          value={lawyerSearchTerm}
          onChange={e => setLawyerSearchTerm(e.target.value)}
          placeholder="Filtrar por nome do advogado..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
        />
      </div>

      {Object.entries(casesByLawyer).map(([lawyer, cases]) => (
        <div key={lawyer} className="space-y-6">
          <div className="flex items-center">
            <div className="bg-emerald-600/10 text-emerald-500 p-2 rounded-lg mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{lawyer} <span className="ml-3 text-slate-500 font-bold text-sm">({cases.length} Processos)</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
          </div>
        </div>
      ))}
    </div>
  );

  // Render method for Authors Grouped View
  const renderAuthorsView = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Visão por <span className="text-emerald-500">Autor</span></h2>
        <input 
          type="text" 
          value={authorSearchTerm}
          onChange={e => setAuthorSearchTerm(e.target.value)}
          placeholder="Filtrar por nome do autor..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
        />
      </div>

      {Object.entries(casesByAuthor).map(([author, cases]) => (
        <div key={author} className="space-y-6">
          <div className="flex items-center">
            <div className="bg-emerald-600/10 text-emerald-500 p-2 rounded-lg mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{author} <span className="ml-3 text-slate-500 font-bold text-sm">({cases.length} Processos)</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
          </div>
        </div>
      ))}
    </div>
  );

  // Render method for Case Registration Form
  const renderCaseForm = () => (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-10">
        <div className="w-2 h-8 bg-emerald-600 rounded-full mr-4"></div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
          {view === AppView.EDIT_CASE ? 'Editar' : 'Registrar'} <span className="text-emerald-500">Processo</span>
        </h2>
      </div>

      <form onSubmit={handleSaveCase} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nº do Processo</label>
            <input 
              type="text" 
              value={formData.processNumber}
              onChange={e => setFormData({...formData, processNumber: e.target.value})}
              placeholder="Ex: 0001234-56.2024.8.26.0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Autor / Requerente</label>
            <input 
              type="text" 
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
              placeholder="Nome Completo"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Advogado Responsável</label>
            <select 
              value={formData.lawyerId}
              onChange={e => setFormData({...formData, lawyerId: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold appearance-none"
            >
              <option value="">Selecione um profissional</option>
              {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} {l.oab ? `(OAB ${l.oab})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Status Atual</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as LegalCase['status']})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold appearance-none"
            >
              <option value="Ativo">Ativo</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Julgado">Julgado</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Documento (PDF)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
            <div className="bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="text-white font-bold">{formData.pdfName || 'Clique para anexar arquivo PDF'}</p>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Tamanho máximo: 10MB</p>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">
            {view === AppView.EDIT_CASE ? 'Salvar Alterações' : 'Finalizar Registro'}
          </button>
          <button type="button" onClick={() => setView(AppView.HOME)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  // Render method for Lawyer Management View
  const renderManageLawyers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500">
      <div className="lg:col-span-1">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24">
          <div className="flex items-center mb-8">
            <div className="w-2 h-6 bg-emerald-600 rounded-full mr-3"></div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              {editingLawyer ? 'Editar' : 'Novo'} <span className="text-emerald-500">Profissional</span>
            </h2>
          </div>

          <form onSubmit={handleSaveLawyer} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={lawyerForm.name}
                onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Inscrição OAB</label>
              <input 
                type="text" 
                value={lawyerForm.oab}
                onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})}
                placeholder="Ex: 12345/SP"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-bold"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest">
                {editingLawyer ? 'Atualizar' : 'Cadastrar'}
              </button>
              {editingLawyer && (
                <button 
                  type="button" 
                  onClick={() => { setEditingLawyer(null); setLawyerForm({name: '', oab: ''}); }}
                  className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all uppercase text-xs font-black tracking-widest"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center">
          Corpo <span className="text-emerald-500 ml-2">Jurídico</span>
          <span className="ml-4 px-3 py-1 bg-slate-900 rounded-lg text-xs text-slate-500 border border-slate-800">{lawyers.length}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lawyers.map(l => (
            <div key={l.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group hover:border-emerald-600/30 transition-all">
              <div>
                <p className="font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{l.name}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{l.oab || 'OAB não informada'}</p>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEditLawyer(l)}
                  className="p-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button 
                  onClick={() => handleDeleteLawyer(l.id)}
                  className="p-2 bg-slate-800 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper to determine which view to render
  const renderContent = () => {
    switch (view) {
      case AppView.HOME: return renderHome();
      case AppView.REGISTER:
      case AppView.EDIT_CASE: return renderCaseForm();
      case AppView.SEARCH: return renderSearch();
      case AppView.LAWYERS: return renderLawyersView();
      case AppView.AUTHORS: return renderAuthorsView();
      case AppView.MANAGE_LAWYERS: return renderManageLawyers();
      default: return renderHome();
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={view} setView={setView} onLogout={handleLogout}>
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