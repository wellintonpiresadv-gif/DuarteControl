
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setView(AppView.HOME)}
            >
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">DuarteControl</h1>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              <button 
                onClick={() => setView(AppView.HOME)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.HOME ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView(AppView.MANAGE_LAWYERS)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.MANAGE_LAWYERS ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                Advogados
              </button>
              <button 
                onClick={() => setView(AppView.SEARCH)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.SEARCH ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                Busca
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2 self-center"></div>
              <button 
                onClick={() => setView(AppView.REGISTER)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Novo Processo
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
          DuarteControl &bull; Gestão Jurídica de Alta Performance
        </div>
      </footer>
    </div>
  );
};

export default Layout;