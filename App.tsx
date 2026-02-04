
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

  // Carregamento Inicial do Banco de Dados Local
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
    alert('Advogado salvo no banco de dados!');
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
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const lawyerObj = lawyers.find(l => l.id === formData.lawyerId);

    if (view === AppView.EDIT_CASE && editingCase) {
      // Modo Edição
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
      // Modo Criação
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
      alert('Processo arquivado no banco de dados!');
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Banco de Processos</p>
          <p className="text-3xl font-black text-slate-900">{cases.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Profissionais</p>
          <p className="text-3xl font-black text-slate-900">{lawyers.length}</p>
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-xl shadow-md text-white flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase mb-1">Status do Banco</p>
            <p className="text-xl font-bold flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Dados Sincronizados Localmente
            </p>
          </div>
          <button onClick={() => setView(AppView.MANAGE_LAWYERS)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold transition-colors">
            Configurações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setView(AppView.SEARCH)} className="p-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all text-left group">
          <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="font-bold text-lg">Buscar no Banco</p>
          <p className="text-sm text-blue-100">Busca dinâmica de registros</p>
        </button>
        <button onClick={() => setView(AppView.LAWYERS)} className="p-6 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 transition-all text-left group">
          <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="font-bold text-lg">Por Advogado</p>
          <p className="text-sm text-slate-400">Agrupamento profissional</p>
        </button>
        <button onClick={() => setView(AppView.AUTHORS)} className="p-6 bg-emerald-700 text-white rounded-2xl hover:bg-emerald-800 transition-all text-left group">
          <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="font-bold text-lg">Por Autor</p>
          <p className="text-sm text-emerald-100">Agrupamento por cliente</p>
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="w-8 h-1 bg-blue-600 rounded-full mr-3"></span>
          Últimos Registros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.slice(0, 6).map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        </div>
      </div>
    </div>
  );

  const renderForm = (isEdit: boolean = false) => (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {isEdit ? 'Editar Processo Registrado' : 'Novo Registro de Processo'}
      </h2>
      <form onSubmit={handleSaveCase} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Número do Processo</label>
          <input type="text" required placeholder="0000000-00.0000.0.00.0000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.processNumber} onChange={e => setFormData({...formData, processNumber: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Autor do Processo</label>
          <input type="text" required placeholder="Nome do autor" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Advogado Responsável</label>
          <select 
            required
            className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.lawyerId}
            onChange={e => setFormData({...formData, lawyerId: e.target.value})}
          >
            <option value="">Selecione do banco...</option>
            {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} {l.oab ? `- OAB: ${l.oab}` : ''}</option>)}
          </select>
          <button type="button" onClick={() => setView(AppView.MANAGE_LAWYERS)} className="text-blue-600 text-xs mt-2 font-bold hover:underline">+ Cadastrar novo profissional</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Status Atual</label>
            <select className="w-full px-4 py-2 border rounded-lg bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
              <option value="Ativo">Ativo</option>
              <option value="Julgado">Julgado</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {formData.pdfName ? `Documento: ${formData.pdfName}` : 'Anexar Documento'}
            </label>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {formData.pdfName && (
              <button 
                type="button" 
                onClick={() => setFormData({...formData, pdfData: '', pdfName: ''})}
                className="text-xs text-red-500 mt-1 hover:underline"
              >
                Remover anexo
              </button>
            )}
          </div>
        </div>
        <div className="pt-6 flex space-x-4">
          <button 
            type="button" 
            onClick={() => {
              setEditingCase(null);
              setFormData({ processNumber: '', author: '', lawyerId: '', pdfData: '', pdfName: '', status: 'Ativo' });
              setView(AppView.HOME);
            }} 
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className={`flex-1 py-3 px-4 ${isEdit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-bold shadow-lg transition-colors`}>
            {isEdit ? 'Salvar Alterações' : 'Salvar no Banco'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageLawyers = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Gestão de Advogados</h2>
        <form onSubmit={handleAddLawyer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
            <input type="text" required placeholder="Ex: Dr. Fulano" className="w-full px-4 py-2 border rounded-lg" value={lawyerForm.name} onChange={e => setLawyerForm({...lawyerForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OAB</label>
            <input type="text" placeholder="00000/UF" className="w-full px-4 py-2 border rounded-lg" value={lawyerForm.oab} onChange={e => setLawyerForm({...lawyerForm, oab: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Registrar no Banco</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Profissionais Cadastrados</h3>
          <button 
            onClick={() => { if(confirm('Deseja realmente limpar TODO o banco de dados?')) db.clearAll() }}
            className="text-xs text-red-500 font-bold hover:underline"
          >
            Limpar Banco de Dados
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Advogado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">OAB</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Processos Ativos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lawyers.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{l.name}</td>
                <td className="px-6 py-4 text-slate-500">{l.oab || '---'}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                    {cases.filter(c => c.lawyerId === l.id).length}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-8">
      <div className="bg-slate-900 p-8 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-6">Busca Avançada no Banco</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input type="text" placeholder={`Filtrar registros por ${searchMode === 'number' ? 'número' : searchMode === 'author' ? 'autor' : 'advogado'}...`} className="w-full px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {['number', 'author', 'lawyer'].map(m => (
              <button key={m} onClick={() => setSearchMode(m as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${searchMode === m ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{m === 'number' ? 'PROCESSO' : m.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
        {filteredCases.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 italic">Nenhum registro encontrado no banco de dados.</div>}
      </div>
    </div>
  );

  const renderLawyers = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Filtrar por Advogado</h2>
        <input type="text" placeholder="Localizar advogado no banco..." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={lawyerSearchTerm} onChange={e => setLawyerSearchTerm(e.target.value)} />
      </div>
      <div className="space-y-12">
        {Object.entries(casesByLawyer).map(([name, lawyerCases]) => (
          <div key={name} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-4 mb-8 border-b border-slate-100 pb-6">
              <div className="bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">{name.charAt(0)}</div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
                <p className="text-sm text-slate-400 font-medium">{lawyerCases.length} Processos Totais</p>
              </div>
            </div>
            {['Ativo', 'Julgado'].map(group => {
              const items = lawyerCases.filter(c => group === 'Ativo' ? (c.status === 'Ativo' || c.status === 'Suspenso') : (c.status === 'Julgado' || c.status === 'Arquivado'));
              return items.length > 0 && (
                <div key={group} className="mb-10 last:mb-0">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${group === 'Ativo' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    {group}s ({items.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {Object.keys(casesByLawyer).length === 0 && <div className="text-center py-12 text-slate-400 italic">Nenhum profissional encontrado.</div>}
      </div>
    </div>
  );

  const renderAuthors = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Filtrar por Autor</h2>
        <input type="text" placeholder="Localizar autor no banco..." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={authorSearchTerm} onChange={e => setAuthorSearchTerm(e.target.value)} />
      </div>
      <div className="space-y-12">
        {Object.entries(casesByAuthor).map(([name, authorCases]) => (
          <div key={name} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorCases.map(c => <CaseCard key={c.id} legalCase={c} onClick={setSelectedCase} />)}
            </div>
          </div>
        ))}
        {Object.keys(casesByAuthor).length === 0 && <div className="text-center py-12 text-slate-400 italic">Nenhum requerente encontrado.</div>}
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
