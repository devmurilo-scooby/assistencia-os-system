// src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Monitorar estado de autenticação do Firebase em tempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair: ", error);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        Carregando sistema...
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de login
  if (!user) {
    return <Login />;
  }

  // Se estiver logado, exibe o Dashboard com opção de Sair no topo
  return (
    <div className="relative">
      {/* Botão de Logout Flutuante / Discreto no topo direito */}
      <div className="absolute top-6 right-6 md:right-8 z-40">
        <button
          onClick={handleLogout}
          className="bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-lg"
        >
          <span>🚪</span> Sair da Conta
        </button>
      </div>

      <Dashboard />
    </div>
  );
}