import React, { useState } from 'react';
import { weatherApi } from '../services/api';
import { Lock, Mail, User, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, initialTab = 'login' }) => {
  const [tab, setTab] = useState(initialTab); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const data = await weatherApi.login(email, password);
        // data has access_token, token_type, user
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccessMsg('Autenticação realizada com sucesso!');
        setTimeout(() => {
          onLoginSuccess(data.user, data.access_token);
        }, 1000);
      } else {
        await weatherApi.register(email, password, fullName);
        setSuccessMsg('Cadastro criado com sucesso! Faça login para continuar.');
        setTab('login');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Erro ao processar solicitação. Verifique sua conexão.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-2 mb-8 relative">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 mb-2">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">AtmosView</h2>
          <p className="text-xs text-slate-400">
            {tab === 'login' ? 'Entre na sua conta para acessar recursos V5' : 'Crie sua conta para monitoramento e alertas'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Errors & Success */}
        {error && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2 items-start text-xs text-rose-300 font-medium">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start text-xs text-emerald-300 font-medium animate-fade-in">
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Nome Completo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Endereço de E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Senha de Acesso</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              tab === 'login' ? 'Entrar' : 'Registrar Conta'
            )}
          </button>
        </form>

        {/* Info seeding note */}
        {tab === 'login' && (
          <div className="mt-6 pt-5 border-t border-slate-900/60 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              Demonstração rápida? Use o usuário semeado padrão:<br/>
              <span className="text-indigo-400 font-bold">admin@atmosview.com</span> com a senha <span className="text-indigo-400 font-bold">admin123</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
