
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md text-white shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => setView(AppView.HOME)}
            >
              <div className="bg-emerald-600 p-2 rounded-lg mr-3 shadow-lg group-hover:bg-emerald-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Duarte<span className="text-emerald-500">Control</span></h1>
                <div className="flex items-center mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5"></span>
                  <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">Cloud Database Active</span>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => setView(AppView.HOME)}
                className={`px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${currentView === AppView.HOME ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView(AppView.MANAGE_LAWYERS)}
                className={`px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${currentView === AppView.MANAGE_LAWYERS ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                Advogados
              </button>
              <button 
                onClick={() => setView(AppView.SEARCH)}
                className={`px-3 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${currentView === AppView.SEARCH ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                Busca
              </button>
              <div className="w-px h-6 bg-slate-800 mx-2 self-center"></div>
              <button 
                onClick={() => setView(AppView.REGISTER)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                NOVO PROCESSO
              </button>
              <button 
                onClick={onLogout}
                className="ml-4 p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Sair do Sistema"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              DuarteControl &bull; Centralizado na Nuvem Vercel
            </p>
            <div className="h-1 w-20 bg-emerald-900/30 mx-auto rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
