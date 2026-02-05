
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

      // Atualiza o nome do advogado nos processos
      const allCases = db.getCases();
      const updatedCases = allCases.map(c => {
        if (c.lawyerId === updatedLawyer.id) {
          return { ...c, lawyer: updatedLawyer.name };
        }
        return c;
      });
      
      localStorage.setItem('duarte_control_cases', JSON.stringify(updatedCases));
      setCases(updatedCases);

      setEditingLawyer(null);
      alert('Cadastro de advogado atualizado!');
    } else {
      const newLawyer: Lawyer = {
        id: Math.random().toString(36).substr(2, 9),
        name: lawyerForm.name,
        oab: lawyerForm.oab
      };
      const updated = db.saveLawyer(newLawyer);
      setLawyers(updated);
      alert('Novo advogado cadastrado!');
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
    if (linkedCases.length > 0) {
      alert(`Não é possível excluir: este advogado possui ${linkedCases.length} processos vinculados.`);
      return;
    }

    if (window.confirm("Deseja remover este profissional?")) {
      const updated = db.deleteLawyer(id);
      setLawyers(updated);
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
      alert('Processo atualizado com sucesso!');
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
      alert('Processo registrado com sucesso!');
    }

    setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
    setEditingCase(null);
    setView(AppView.HOME);
  };

  // Memoized Data
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

  // Sub-renders
  const renderHomeView = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-emerald-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Processos</p>
          <p className="text-4xl font-black text-white">{cases.length}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-blue-600">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Advogados</p>
          <p className="text-4xl font-black text-white">{lawyers.length}</p>
        </div>
        <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-900/30">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Sistema</p>
          <p className="text-xl font-bold text-emerald-100">Status Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <button onClick={() => { setSearchMode('number'); setView(AppView.SEARCH); }} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left">
          <p className="font-black text-lg uppercase tracking-tight">Buscar Nº</p>
          <p className="text-xs text-slate-500 mt-1 uppercase">Acesso Rápido</p>
        </button>
        <button onClick={() => setView(AppView.LAWYERS)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left">
          <p className="font-black text-lg uppercase tracking-tight">Equipe</p>
          <p className="text-xs text-slate-500 mt-1 uppercase">Listagem Geral</p>
        </button>
        <button onClick={() => setView(AppView.AUTHORS)} className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 border border-slate-800 transition-all text-left">
          <p className="font-black text-lg uppercase tracking-tight">Clientes</p>
          <p className="text-xs text-slate-500 mt-1 uppercase">Lista de Autores</p>
        </button>
        <button onClick={() => setView(AppView.REGISTER)} className="p-8 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-500 transition-all text-left shadow-lg">
          <p className="font-black text-lg uppercase tracking-tight">Cadastrar</p>
          <p className="text-xs text-emerald-100 mt-1 uppercase">Novo Processo</p>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.slice(0, 6).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        </div>
      </div>
    </div>
  );

  const renderSearchView = () => (
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

  const renderLawyersView = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Processos por <span className="text-emerald-500">Advogado</span></h2>
        <input 
          type="text" 
          value={lawyerSearchTerm}
          onChange={e => setLawyerSearchTerm(e.target.value)}
          placeholder="Filtrar advogado..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
        />
      </div>
      {Object.entries(casesByLawyer).map(([lawyer, lawyerCases]) => (
        <div key={lawyer} className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight border-l-4 border-emerald-600 pl-4">{lawyer} <span className="ml-2 text-slate-500 text-sm">({lawyerCases.length})</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lawyerCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAuthorsView = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Processos por <span className="text-emerald-500">Autor</span></h2>
        <input 
          type="text" 
          value={authorSearchTerm}
          onChange={e => setAuthorSearchTerm(e.target.value)}
          placeholder="Filtrar autor..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
        />
      </div>
      {Object.entries(casesByAuthor).map(([author, authorCases]) => (
        <div key={author} className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight border-l-4 border-blue-600 pl-4">{author} <span className="ml-2 text-slate-500 text-sm">({authorCases.length})</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCaseFormView = (isEdit: boolean) => (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10 animate-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
        {isEdit ? 'Editar' : 'Registrar'} <span className="text-emerald-500">Processo</span>
      </h2>
      <form onSubmit={handleSaveCase} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nº do Processo</label>
            <input 
              type="text" 
              value={formData.processNumber}
              onChange={e => setFormData({...formData, processNumber: e.target.value})}
              placeholder="0000000-00.0000.0.00.0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Autor / Requerente</label>
            <input 
              type="text" 
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
              placeholder="Nome Completo"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Advogado</label>
            <select 
              value={formData.lawyerId}
              onChange={e => setFormData({...formData, lawyerId: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold appearance-none"
            >
              <option value="">Selecione...</option>
              {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Status</label>
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
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Documento (PDF)</label>
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
            <p className="text-white font-bold">{formData.pdfName || 'Anexar PDF'}</p>
          </div>
        </div>
        <div className="flex space-x-4 pt-6">
          <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">Salvar</button>
          <button type="button" onClick={() => setView(AppView.HOME)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest">Cancelar</button>
        </div>
      </form>
    </div>
  );

  // Implementação da view de gerenciamento de advogados (faltava no original)
  const renderManageLawyersView = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 p-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-10">
          {editingLawyer ? 'Editar' : 'Cadastrar'} <span className="text-emerald-500">Advogado</span>
        </h2>
        <form onSubmit={handleSaveLawyer} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nome do Profissional</label>
              <input 
                type="text" 
                value={lawyerForm.name}
                onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})}
                placeholder="Ex: Dra. Ana Costa"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">OAB / Registro</label>
              <input 
                type="text" 
                value={lawyerForm.oab}
                onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})}
                placeholder="00000/UF"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none font-bold"
              />
            </div>
          </div>
          <div className="flex space-x-4 pt-6">
            <button type="submit" className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">
              {editingLawyer ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            </button>
            {editingLawyer && (
              <button type="button" onClick={() => { setEditingLawyer(null); setLawyerForm({name: '', oab: ''}); }} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest">Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-800">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Equipe Jurídica Atual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5">OAB</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {lawyers.map(l => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5 text-white font-bold">{l.name}</td>
                  <td className="px-8 py-5 text-slate-400 font-bold">{l.oab || 'N/A'}</td>
                  <td className="px-8 py-5 text-right space-x-4">
                    <button onClick={() => startEditLawyer(l)} className="text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest">Editar</button>
                    <button onClick={() => handleDeleteLawyer(l.id)} className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-widest">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Consolidação das views com os nomes corretos
  const renderAppContent = () => {
    switch (view) {
      case AppView.HOME: return renderHomeView();
      case AppView.REGISTER: return renderCaseFormView(false);
      case AppView.EDIT_CASE: return renderCaseFormView(true);
      case AppView.SEARCH: return renderSearchView();
      case AppView.LAWYERS: return renderLawyersView();
      case AppView.AUTHORS: return renderAuthorsView();
      case AppView.MANAGE_LAWYERS: return renderManageLawyersView();
      default: return renderHomeView();
    }
  };

  // Verificação de autenticação para renderizar a tela de login se necessário
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={view} setView={setView} onLogout={handleLogout}>
      {renderAppContent()}
      <CaseDetailsModal 
        legalCase={selectedCase} 
        onClose={() => setSelectedCase(null)} 
        onEdit={startEditCase}
      />
    </Layout>
  );
};

export default App;
