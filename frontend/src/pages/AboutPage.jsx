import React from 'react';
import { Cpu, Database, Layout, Globe, ShieldCheck, Brain, FileText, Bell, Smartphone } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="space-y-3 text-center">
        <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl mb-1 animate-pulse">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Sobre o <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-black">AtmosView V5</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Uma plataforma full-stack industrial de inteligência climatológica, predições por Machine Learning, geração de relatórios oficiais e auditoria física de solo para o território brasileiro.
        </p>
      </div>

      {/* Main info card */}
      <div className="premium-card p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-indigo-400" />
          Proposta de Valor e Arquitetura Limpa
        </h3>
        <div className="text-xs text-slate-350 leading-relaxed space-y-3 font-medium">
          <p>
            O AtmosView foi concebido sob princípios de engenharia de software rigorosa, desacoplamento de serviços e responsabilidade única. A plataforma atua unificando e auditando dados climáticos de múltiplas fontes científicas globais e regionais.
          </p>
          <p>
            Na versão **V5**, o projeto atinge o nível de produto final completo para portfólio profissional, apresentando segurança por controle de sessão (autenticação JWT), geração de PDF de alta fidelidade diretamente no servidor, alertas ativos de ultrapassagem de limiares parametrizados pelo usuário e suporte a instalação móvel Progressive Web App (PWA).
          </p>
        </div>
      </div>

      {/* Stack Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Pilha Tecnológica & Engenharia (Tech Stack)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Frontend */}
          <div className="premium-card p-5 flex gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 h-fit border border-indigo-500/20">
              <Layout size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Frontend SPA & PWA</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                React, Vite e Tailwind CSS. Visualizações dinâmicas com Recharts e Leaflet. Configurado com Service Workers e Web App Manifest para instalação local autônoma e resiliência offline.
              </p>
            </div>
          </div>

          {/* Backend */}
          <div className="premium-card premium-card-teal p-5 flex gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl shrink-0 h-fit border border-teal-500/20">
              <Cpu size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">FastAPI Assíncrono</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Backend assíncrono não-bloqueante em Python. Consumo rápido de APIs climatológicas via HTTPX, validação estática de schemas com Pydantic e processamento de rotas em tempo de execução.
              </p>
            </div>
          </div>

          {/* PostgreSQL / SQLite */}
          <div className="premium-card premium-card-violet p-5 flex gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl shrink-0 h-fit border border-violet-500/20">
              <Database size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Banco de Dados & Autocura</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                PostgreSQL para persistência de históricos, alertas e favoritos via SQLAlchemy ORM. Inclui autocura transparente com fallback imediato para SQLite local auto-inicializável.
              </p>
            </div>
          </div>

          {/* Redis */}
          <div className="premium-card premium-card-rose p-5 flex gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 h-fit border border-rose-500/20">
              <Cpu size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Redis Cache Layer</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Redis integrado para cachear queries de geolocalização e respostas de dados consolidados, reduzindo o tráfego de requisições redundantes a provedores externos.
              </p>
            </div>
          </div>

          {/* Machine Learning */}
          <div className="premium-card premium-card-amber p-5 flex gap-4 sm:col-span-2">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 h-fit border border-amber-500/20">
              <Brain size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Modelos Preditivos RandomForest</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Treinamento sob demanda (Scikit-Learn) a partir de 2 anos de histórico climático local. Gera features sazonais e estima a probabilidade de chuva forte ou rajadas de ventos para as próximas 24 horas, apresentando relevância das features.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* V5 advanced features grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Novos Recursos da Versão V5</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="premium-card p-5 space-y-2">
            <FileText size={18} className="text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Relatórios PDF (ReportLab)</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Geração vetorial no servidor transmitida em buffer via StreamingResponse. Cobre Dashboard, Histórico, Comparação e IA.</p>
          </div>
          <div className="premium-card premium-card-rose p-5 space-y-2">
            <Bell size={18} className="text-rose-400" />
            <h4 className="text-xs font-bold text-white">Notificações Climáticas</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Comparação automática das consultas com limiares definidos pelo usuário no Perfil, disparando alertas de atenção na tela e registrando no banco.</p>
          </div>
          <div className="premium-card premium-card-sky p-5 space-y-2">
            <Smartphone size={18} className="text-sky-400" />
            <h4 className="text-xs font-bold text-white">PWA Instalável</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Experiência stand-alone para desktop e dispositivos móveis, com ícone de atalho dedicado e gerenciamento autônomo de cache offline.</p>
          </div>
        </div>
      </div>

      {/* ICR Logic details */}
      <div className="premium-card p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
          <Globe size={18} className="text-indigo-400" />
          Fórmulas e Métricas Científicas
        </h3>
        <div className="text-xs text-slate-350 space-y-3 leading-relaxed font-medium">
          <p>
            O AtmosView baseia sua confiabilidade em parâmetros físicos de cálculo geodésico e meteorológico:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px] pl-2">
            <li><strong className="text-rose-400">Fórmula de Haversine</strong>: Cálculo trigonométrico que encontra a menor distância esférica entre coordenadas terrestres, permitindo auditar dados apontando a estação física INMET mais próxima.</li>
            <li><strong className="text-amber-500">ICR (Índice de Risco Climático)</strong>: Algoritmo ponderado de 0 a 10 que analisa calor extremo (>32°C), secura crítica de ar (&lt;40%), volume pluviométrico instantâneo, vento de rajada e queda de pressão barométrica.</li>
            <li><strong className="text-emerald-400">QA/QC de Dados</strong>: Módulo de classificação automática das leituras em "Boa", "Parcial" ou "Fraca", computando falhas de comunicação, leituras nulas e outliers suspeitos.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
