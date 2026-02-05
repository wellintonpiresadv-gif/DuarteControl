import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: string, pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciais atualizadas conforme solicitação do usuário
    // Usuário: admin / Senha: 123450
    if (username === 'admin' && password === '123450') {
      onLogin(username, password);
    } else {
      setError('Credenciais inválidas. Tente admin / 123450');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-600/10 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo ao DuarteControl</h1>
          <p className="text-slate-400 mt-2">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-slate-500"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 mt-2"
          >
            Acessar Sistema
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-slate-500 uppercase tracking-widest">
          DuarteControl &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default Login;