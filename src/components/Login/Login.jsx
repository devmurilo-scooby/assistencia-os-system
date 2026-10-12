// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
      console.error("Erro no login: ", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErro('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/invalid-email') {
        setErro('Formato de e-mail inválido.');
      } else {
        setErro('Erro ao fazer login. Verifique sua conexão.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErro('Digite seu e-mail para redefinir a senha.');
      return;
    }

    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSucesso('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      console.error("Erro na redefinição de senha: ", err);
      if (err.code === 'auth/user-not-found') {
        setErro('Nenhuma conta encontrada com este e-mail.');
      } else {
        setErro('Erro ao enviar e-mail de redefinição.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        {/* Cabeçalho do Card */}
        <div className="login-header">
          <div className="login-icon-box">🛠️</div>
          <h1 className="login-title">Assistência Técnica</h1>
          <p className="login-subtitle">
            {modoEsqueciSenha ? 'Recuperação de Acesso' : 'Painel do Técnico de Serviço'}
          </p>
        </div>

        {/* Mensagens de Alerta */}
        {erro && <div className="login-alert-error">{erro}</div>}
        {sucesso && <div className="login-alert-success">{sucesso}</div>}

        {/* Formulário de Esqueci a Senha */}
        {modoEsqueciSenha ? (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-2">
            <div className="login-form-group">
              <label className="login-label mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@assistencia.com"
                className="login-input"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="login-btn-primary"
            >
              {carregando ? 'Enviando...' : 'Enviar E-mail de Redefinição'}
            </button>

            <button
              type="button"
              onClick={() => { setModoEsqueciSenha(false); setErro(''); setSucesso(''); }}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer text-center mt-3 underline"
            >
              ← Voltar para o Login
            </button>
          </form>
        ) : (
          /* Formulário de Login */
          <form onSubmit={handleLogin} className="flex flex-col gap-2">
            <div className="login-form-group">
              <label className="login-label mb-1">E-mail de Acesso</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tecnico@assistencia.com"
                className="login-input"
              />
            </div>

            <div className="login-form-group">
              <div className="login-senha-header">
                <label className="login-label">Senha</label>
                <button
                  type="button"
                  onClick={() => { setModoEsqueciSenha(true); setErro(''); setSucesso(''); }}
                  className="forgot-password-link"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="login-input-wrapper">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="login-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="toggle-password-btn"
                  title={mostrarSenha ? 'Ocultar Senha' : 'Exibir Senha'}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="login-btn-primary"
            >
              {carregando ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}