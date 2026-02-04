
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("DuarteControl: Iniciando aplicação...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Erro Crítico: Elemento #root não encontrado no DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("DuarteControl: Renderização concluída com sucesso.");
  } catch (err) {
    console.error("Erro durante a renderização do React:", err);
  }
}
