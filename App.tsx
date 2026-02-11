
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import CaseCard from './components/CaseCard';
import CaseDetailsModal from './components/CaseDetailsModal';
import Login from './components/Login';
import { LegalCase, AppView, SearchMode, Lawyer, Deadline, DeadlineType, ManifestationSubType } from './types';
import { db } from './services/db';

// Componente para sobreposição de carregamento
const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-emerald-500 font-black uppercase tracking-widest text-[10px]">Sincronizando Cloud...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('duarte_control_auth') === 'true';
  });
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  
  const [formData, setFormData] = useState({
    processNumber: '',
    author: '',
    lawyerId: '',
    pdfData: '',
    pdfName: '',
    status: 'Ativo' as LegalCase['status']
  });

  const [lawyerForm, setLawyerForm] = useState({ name: '', oab: '' });

  const [deadlineForm, setDeadlineForm] = useState({
    title: '',
    date: '',
    caseId: '',
    priority: 'Média' as Deadline['priority'],
    type: 'Manifestação' as DeadlineType,
    subType: 'Manifestação Geral' as ManifestationSubType
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('number');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedCases, fetchedLawyers, fetchedDeadlines] = await Promise.all([
        db.getCases(),
        db.getLawyers(),
        db.getDeadlines()
      ]);
      setCases(fetchedCases);
      setLawyers(fetchedLawyers);
      setDeadlines(fetchedDeadlines);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

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

  const isNearDeadline = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(dateStr);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  };

  const handleSaveDeadline = async (e?: React.FormEvent, customForm?: any) => {
    e?.preventDefault();
    const data = customForm || deadlineForm;
    if (!data.title || !data.date) return;

    setIsLoading(true);
    try {
      const selectedCaseObj = cases.find(c => c.id === data.caseId);
      
      if (editingDeadline) {
        const updatedDeadline: Deadline = {
          ...editingDeadline,
          title: data.title,
          date: data.date,
          caseId: data.caseId,
          processNumber: selectedCaseObj?.processNumber,
          priority: data.priority,
          type: data.type,
          subType: data.type === 'Manifestação' ? data.subType : undefined,
        };
        const updated = await db.updateDeadline(updatedDeadline);
        setDeadlines(updated);
        setEditingDeadline(null);
      } else {
        const newDeadline: Deadline = {
          id: Math.random().toString(36).substr(2, 9),
          title: data.title,
          date: data.date,
          caseId: data.caseId,
          processNumber: selectedCaseObj?.processNumber,
          priority: data.priority,
          type: data.type,
          subType: data.type === 'Manifestação' ? data.subType : undefined,
          completed: false
        };
        const updated = await db.saveDeadline(newDeadline);
        setDeadlines(updated);
      }

      setDeadlineForm({ 
        title: '', date: '', caseId: '', 
        priority: 'Média', type: 'Manifestação', 
        subType: 'Manifestação Geral' 
      });
      if (!customForm) alert("Prazo sincronizado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar o prazo.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditDeadline = (d: Deadline) => {
    const password = window.prompt("Digite a senha de segurança para editar este prazo:");
    if (password === '123450') {
      setEditingDeadline(d);
      setDeadlineForm({
        title: d.title,
        date: d.date,
        caseId: d.caseId || '',
        priority: d.priority,
        type: d.type,
        subType: d.subType || 'Manifestação Geral'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (password !== null) {
      alert("Senha incorreta. Acesso negado.");
    }
  };

  const handleDeleteCase = async (id: string) => {
    const password = window.prompt("ATENÇÃO: Você está prestes a EXCLUIR DEFINITIVAMENTE este processo. Digite a senha para confirmar:");
    if (password === '123450') {
      setIsLoading(true);
      try {
        const updatedCases = await db.deleteCase(id);
        setCases(updatedCases);
        setSelectedCase(null);
        alert("Processo removido permanentemente da Cloud.");
      } catch (err) {
        alert("Erro ao remover processo.");
      } finally {
        setIsLoading(false);
      }
    } else if (password !== null) {
      alert("Senha incorreta. Operação de exclusão cancelada.");
    }
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processNumber || !formData.author || !formData.lawyerId) return;
    setIsLoading(true);
    try {
      const selectedLawyer = lawyers.find(l => l.id === formData.lawyerId);
      const lawyerName = selectedLawyer ? selectedLawyer.name : 'Desconhecido';
      if (editingCase) {
        const updated = await db.updateCase({ ...editingCase, ...formData, lawyer: lawyerName });
        setCases(updated);
        setEditingCase(null);
      } else {
        const newCase: LegalCase = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          lawyer: lawyerName,
          dateAdded: new Date().toISOString()
        };
        const updated = await db.saveCase(newCase);
        setCases(updated);
      }
      setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
      setView(AppView.HOME);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeadlines = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
          {editingDeadline ? 'Editar' : 'Novo'} <span className="text-emerald-500">Prazo / Agenda</span>
        </h2>
        <form onSubmit={handleSaveDeadline} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              type="text" 
              value={deadlineForm.title}
              onChange={e => setDeadlineForm({...deadlineForm, title: e.target.value})}
              placeholder="Título (ex: Contestação, Audiência)"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
            <input 
              type="date" 
              value={deadlineForm.date}
              onChange={e => setDeadlineForm({...deadlineForm, date: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <select 
              value={deadlineForm.type}
              onChange={e => setDeadlineForm({...deadlineForm, type: e.target.value as DeadlineType})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
            >
              <option value="Manifestação">Prazo para Manifestar</option>
              <option value="Audiência">Audiência</option>
              <option value="Edital">Edital / Publicação</option>
              <option value="Geral">Compromisso Geral</option>
            </select>
            
            {deadlineForm.type === 'Manifestação' && (
              <select 
                value={deadlineForm.subType}
                onChange={e => setDeadlineForm({...deadlineForm, subType: e.target.value as ManifestationSubType})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
              >
                <option value="Contestação">Contestação</option>
                <option value="Réplica/Impugnação">Impugnação / Réplica</option>
                <option value="Recurso (Apelação)">Recurso (Apelação)</option>
                <option value="Agravo de Instrumento">Agravo de Instrumento</option>
                <option value="Embargos">Embargos</option>
                <option value="Alegações Finais">Alegações Finais</option>
                <option value="Manifestação Geral">Manifestação Geral</option>
              </select>
            )}

            <select 
              value={deadlineForm.priority}
              onChange={e => setDeadlineForm({...deadlineForm, priority: e.target.value as Deadline['priority']})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
            >
              <option value="Baixa">Prioridade Baixa</option>
              <option value="Média">Prioridade Média</option>
              <option value="Alta">Prioridade Alta</option>
            </select>
          </div>
          <select 
            value={deadlineForm.caseId}
            onChange={e => setDeadlineForm({...deadlineForm, caseId: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
          >
            <option value="">Vincular Processo (Opcional)...</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.processNumber} - {c.author}</option>)}
          </select>
          <div className="flex gap-4">
            <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-xl">
              {editingDeadline ? 'Atualizar Prazo' : 'Sincronizar Prazo'}
            </button>
            {editingDeadline && (
              <button 
                type="button" 
                onClick={() => { setEditingDeadline(null); setDeadlineForm({ title: '', date: '', caseId: '', priority: 'Média', type: 'Manifestação', subType: 'Manifestação Geral' }); }}
                className="px-8 py-4 bg-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-white uppercase tracking-tight border-l-4 border-emerald-600 pl-4">Agenda Jurídica Unificada</h3>
        <div className="grid grid-cols-1 gap-4">
          {deadlines.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => {
            const near = !d.completed && isNearDeadline(d.date);
            return (
              <div key={d.id} className={`p-6 rounded-3xl border ${d.completed ? 'bg-slate-950 border-slate-900 opacity-60' : 'bg-slate-900 border-slate-800'} flex items-center transition-all group ${near ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}>
                <button 
                  onClick={() => db.updateDeadline({...d, completed: !d.completed}).then(list => setDeadlines(list))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mr-6 transition-all ${d.completed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-emerald-900/50'}`}
                >
                  {d.completed ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg> : <div className="w-4 h-4 border-2 border-slate-600 rounded-full"></div>}
                </button>
                <div className="flex-grow">
                  <div className="flex items-center space-x-3">
                    <p className={`font-black uppercase tracking-tight ${d.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{d.title}</p>
                    {near && <span className="bg-red-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">URGENTE - {Math.ceil((new Date(d.date).getTime() - new Date().getTime()) / (1000*3600*24))} dias</span>}
                  </div>
                  <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest mt-1">
                    <span className="text-emerald-500">{new Date(d.date).toLocaleDateString()}</span>
                    <span className="text-slate-500">{d.type} {d.subType ? `> ${d.subType}` : ''}</span>
                    {d.processNumber && <span className="text-blue-500">#{d.processNumber}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${d.priority === 'Alta' ? 'bg-red-900/30 text-red-400' : d.priority === 'Média' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    {d.priority}
                  </span>
                  <button onClick={() => startEditDeadline(d)} className="p-2 text-slate-500 hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => { if(window.confirm("Remover este prazo?")) db.deleteDeadline(d.id).then(list => setDeadlines(list)) }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Buscar por ${searchMode === 'number' ? 'número' : searchMode === 'author' ? 'autor' : 'advogado'}...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
          />
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button 
              onClick={() => setSearchMode('number')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'number' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Nº Processo
            </button>
            <button 
              onClick={() => setSearchMode('author')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'author' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Autor
            </button>
            <button 
              onClick={() => setSearchMode('lawyer')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'lawyer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Advogado
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cases.filter(c => {
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          if (searchMode === 'number') return c.processNumber.toLowerCase().includes(term);
          if (searchMode === 'author') return c.author.toLowerCase().includes(term);
          if (searchMode === 'lawyer') return c.lawyer.toLowerCase().includes(term);
          return false;
        }).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-emerald-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Processos Ativos</p>
          <p className="text-4xl font-black text-white">{cases.length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-red-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Urgências (5 dias)</p>
          <p className="text-4xl font-black text-white">{deadlines.filter(d => !d.completed && isNearDeadline(d.date)).length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-blue-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Agenda Pendente</p>
          <p className="text-4xl font-black text-white">{deadlines.filter(d => !d.completed).length}</p>
        </div>
        <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-900/30">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Sincronização</p>
          <p className="text-xl font-bold text-emerald-100 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Escritório Nuvem
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
             <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Prazos Críticos
          </h2>
          <div className="space-y-4">
            {deadlines.filter(d => !d.completed).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map(d => {
               const near = isNearDeadline(d.date);
               return (
                <div key={d.id} className={`bg-slate-900 p-5 rounded-2xl border ${near ? 'border-red-600/50 shadow-[0_0_10px_rgba(220,38,38,0.1)]' : 'border-slate-800'} flex justify-between items-center group`}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-bold">{d.title}</p>
                      {near && <span className="bg-red-600 text-[7px] font-black text-white px-1.5 py-0.5 rounded-full uppercase">Crítico</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      {new Date(d.date).toLocaleDateString()} &bull; {d.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${d.priority === 'Alta' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      {d.priority}
                    </span>
                    <button onClick={() => startEditDeadline(d)} className="text-slate-500 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setView(AppView.SEARCH)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left group">
            <p className="font-black text-lg uppercase tracking-tight group-hover:text-emerald-400">Busca Global</p>
            <p className="text-xs text-slate-500 mt-1 uppercase text-[9px]">Acesso ao Banco Sincronizado</p>
          </button>
          <button onClick={() => setView(AppView.DEADLINES)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left group">
            <p className="font-black text-lg uppercase tracking-tight group-hover:text-emerald-400">Agenda</p>
            <p className="text-xs text-slate-500 mt-1 uppercase text-[9px]">Prazos e Audiências Ativas</p>
          </button>
          <button onClick={() => setView(AppView.REGISTER)} className="p-8 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-500 transition-all text-left shadow-lg col-span-2 group">
            <p className="font-black text-lg uppercase tracking-tight">Novo Registro Judicial</p>
            <p className="text-xs text-emerald-100 mt-1 uppercase text-[9px]">Cadastrar Processo na Cloud</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.HOME: return renderHome();
      case AppView.SEARCH: return renderSearch();
      case AppView.DEADLINES: return renderDeadlines();
      case AppView.REGISTER: 
      case AppView.EDIT_CASE: return (
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10 animate-in slide-in-from-bottom-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
            {editingCase ? 'Editar' : 'Novo'} <span className="text-emerald-500">Registro Cloud</span>
          </h2>
          <form onSubmit={handleSaveCase} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                type="text" 
                value={formData.processNumber}
                onChange={e => setFormData({...formData, processNumber: e.target.value})}
                placeholder="Número do Processo"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
              />
              <input 
                type="text" 
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                placeholder="Nome do Autor"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <select 
                value={formData.lawyerId}
                onChange={e => setFormData({...formData, lawyerId: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
              >
                <option value="">Advogado Responsável...</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as LegalCase['status']})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Julgado">Julgado</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-grow py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl">
                {editingCase ? 'Atualizar Processo' : 'Sincronizar no Servidor'}
              </button>
              {editingCase && (
                 <button type="button" onClick={() => { setEditingCase(null); setView(AppView.HOME); }} className="px-8 bg-slate-800 text-white font-black rounded-2xl uppercase tracking-widest">Cancelar</button>
              )}
            </div>
          </form>
        </div>
      );
      case AppView.MANAGE_LAWYERS: return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">Equipe de <span className="text-emerald-500">Advogados</span></h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if(!lawyerForm.name) return;
              setIsLoading(true);
              const updated = await db.saveLawyer({ id: Math.random().toString(36).substr(2, 9), ...lawyerForm });
              setLawyers(updated);
              setLawyerForm({name: '', oab: ''});
              setIsLoading(false);
            }} className="flex gap-4">
              <input type="text" placeholder="Nome Completo" value={lawyerForm.name} onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})} className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none font-bold focus:border-emerald-500" />
              <input type="text" placeholder="OAB" value={lawyerForm.oab} onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})} className="w-40 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none font-bold focus:border-emerald-500" />
              <button type="submit" className="px-10 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px] hover:bg-emerald-500 transition-all">Adicionar</button>
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lawyers.map(l => (
              <div key={l.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group">
                <div>
                  <p className="font-black text-white group-hover:text-emerald-400 uppercase transition-colors">{l.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{l.oab || 'OAB N/A'}</p>
                </div>
                <button onClick={async () => {
                   if(window.confirm("Remover profissional do escritório?")) {
                     setIsLoading(true);
                     const updated = await db.deleteLawyer(l.id);
                     setLawyers(updated);
                     setIsLoading(false);
                   }
                }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      default: return renderHome();
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <Layout currentView={view} setView={setView} onLogout={handleLogout}>
      {isLoading && <LoadingOverlay />}
      {renderContent()}
      <CaseDetailsModal 
        legalCase={selectedCase} 
        onClose={() => setSelectedCase(null)} 
        onEdit={(c) => { setEditingCase(c); setFormData({ processNumber: c.processNumber, author: c.author, lawyerId: c.lawyerId, pdfData: c.pdfData || '', pdfName: c.pdfName || '', status: c.status }); setSelectedCase(null); setView(AppView.EDIT_CASE); }}
        onDeleteCase={handleDeleteCase}
        onAddDeadline={handleSaveDeadline}
        onEditDeadline={startEditDeadline}
        allDeadlines={deadlines}
        onDeleteDeadline={async (id) => setDeadlines(await db.deleteDeadline(id))}
      />
    </Layout>
  );
};

export default App;
