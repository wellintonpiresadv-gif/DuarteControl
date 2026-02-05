
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  // Carregamento de Dados (Cloud Sync)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedCases, fetchedLawyers] = await Promise.all([
        db.getCases(),
        db.getLawyers()
      ]);
      setCases(fetchedCases);
      setLawyers(fetchedLawyers);
    } catch (err) {
      console.error("Erro ao sincronizar com servidor:", err);
      alert("Erro na sincronização. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
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

  // Handlers de Advogados (Async)
  const handleSaveLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerForm.name) return;
    
    setIsLoading(true);
    try {
      if (editingLawyer) {
        const updatedLawyer: Lawyer = { ...editingLawyer, name: lawyerForm.name, oab: lawyerForm.oab };
        const updatedLawyers = await db.updateLawyer(updatedLawyer);
        setLawyers(updatedLawyers);
        
        // Sincronizar nomes nos processos
        const allCases = await db.getCases();
        const updatedCases = allCases.map(c => c.lawyerId === updatedLawyer.id ? { ...c, lawyer: updatedLawyer.name } : c);
        localStorage.setItem('duarte_control_cases', JSON.stringify(updatedCases));
        setCases(updatedCases);
        
        setEditingLawyer(null);
      } else {
        const newLawyer: Lawyer = {
          id: Math.random().toString(36).substr(2, 9),
          name: lawyerForm.name,
          oab: lawyerForm.oab
        };
        const updated = await db.saveLawyer(newLawyer);
        setLawyers(updated);
      }
      setLawyerForm({ name: '', oab: '' });
      alert("Profissional sincronizado na nuvem!");
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLawyer = async (id: string) => {
    if (cases.some(c => c.lawyerId === id)) {
      alert("Advogado possui processos ativos. Não pode ser removido.");
      return;
    }

    if (window.confirm("Remover profissional do servidor?")) {
      setIsLoading(true);
      const updated = await db.deleteLawyer(id);
      setLawyers(updated);
      setIsLoading(false);
    }
  };

  // Handlers de Casos (Async)
  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.processNumber || !formData.author || !formData.lawyerId) {
      alert('Campos obrigatórios ausentes.');
      return;
    }

    setIsLoading(true);
    try {
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
        const updatedList = await db.updateCase(updatedCase);
        setCases(updatedList);
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
        const updatedList = await db.saveCase(newCase);
        setCases(updatedList);
      }
      setView(AppView.HOME);
      alert("Processo salvo com sucesso em todas as máquinas!");
    } catch (err) {
      alert("Erro ao salvar processo.");
    } finally {
      setIsLoading(false);
      setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
      setEditingCase(null);
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

  // View Components
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-black uppercase tracking-widest text-xs">Sincronizando Cloud...</p>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-emerald-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Processos na Nuvem</p>
          <p className="text-4xl font-black text-white">{cases.length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-blue-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Equipe Sincronizada</p>
          <p className="text-4xl font-black text-white">{lawyers.length}</p>
        </div>
        <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-900/30">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Status Global</p>
          <p className="text-xl font-bold text-emerald-100 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Escritório Conectado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <button onClick={() => setView(AppView.SEARCH)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left">
          <p className="font-black text-lg uppercase tracking-tight">Buscar</p>
          <p className="text-xs text-slate-500 mt-1 uppercase">Acesso Global</p>
        </button>
        <button onClick={() => setView(AppView.MANAGE_LAWYERS)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left">
          <p className="font-black text-lg uppercase tracking-tight">Advogados</p>
          <p className="text-xs text-slate-500 mt-1 uppercase">Gerenciar Equipe</p>
        </button>
        <button onClick={() => setView(AppView.REGISTER)} className="p-8 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-500 transition-all text-left shadow-lg col-span-1 md:col-span-2">
          <p className="font-black text-lg uppercase tracking-tight">Novo Registro</p>
          <p className="text-xs text-emerald-100 mt-1 uppercase">Sincronizar em todas as máquinas</p>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Registros Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.slice(0, 6).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
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
            placeholder="Buscar termo no banco de dados..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
          />
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {(['number', 'author', 'lawyer'] as SearchMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setSearchMode(mode)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                {mode === 'number' ? 'Nº' : mode === 'author' ? 'Autor' : 'Advogado'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
      </div>
    </div>
  );

  const renderManageLawyers = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
          {editingLawyer ? 'Editar' : 'Cadastrar'} <span className="text-emerald-500">Profissional</span>
        </h2>
        <form onSubmit={handleSaveLawyer} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              type="text" 
              value={lawyerForm.name}
              onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})}
              placeholder="Nome Completo"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
            <input 
              type="text" 
              value={lawyerForm.oab}
              onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})}
              placeholder="Inscrição OAB"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest">
              Sincronizar Profissional
            </button>
            {editingLawyer && (
              <button type="button" onClick={() => { setEditingLawyer(null); setLawyerForm({name: '', oab: ''}); }} className="px-8 py-4 bg-slate-800 text-white font-black rounded-2xl">Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lawyers.map(l => (
          <div key={l.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group">
            <div>
              <p className="font-black text-white group-hover:text-emerald-400 transition-colors uppercase">{l.name}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{l.oab || 'OAB N/A'}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => { setEditingLawyer(l); setLawyerForm({name: l.name, oab: l.oab || ''}); }} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDeleteLawyer(l.id)} className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCaseForm = (isEdit: boolean) => (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10 animate-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
        {isEdit ? 'Editar' : 'Novo'} <span className="text-emerald-500">Processo na Nuvem</span>
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
            <option value="">Selecione o Advogado...</option>
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
        <div className="flex space-x-4">
          <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all uppercase tracking-widest shadow-xl">
            {isEdit ? 'Atualizar Cloud' : 'Registrar na Nuvem'}
          </button>
          <button type="button" onClick={() => setView(AppView.HOME)} className="px-8 py-4 bg-slate-800 text-white font-black rounded-2xl transition-all">Cancelar</button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.HOME: return renderHome();
      case AppView.SEARCH: return renderSearch();
      case AppView.MANAGE_LAWYERS: return renderManageLawyers();
      case AppView.REGISTER: return renderCaseForm(false);
      case AppView.EDIT_CASE: return renderCaseForm(true);
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
        onEdit={startEditCase}
      />
    </Layout>
  );
};

export default App;
