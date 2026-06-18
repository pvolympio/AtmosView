import { Cpu, Database, Layout, Globe, ShieldCheck, Brain } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-white">Sobre o AtmosView V3</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Uma plataforma full-stack de inteligência climatológica, predições por Inteligência Artificial e monitoramento de ameaças climáticas para o território brasileiro.
        </p>
      </div>

      {/* Main info card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-400" />
          Proposta e Arquitetura
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          O AtmosView foi concebido sob princípios de engenharia limpa e responsabilidade bem delimitada. Ele consolida informações climáticas reais obtidas em milissegundos das APIs do **Open-Meteo**, convertendo códigos brutos em insights práticos para tomada de decisão e segurança civil.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          É um excelente exemplo de integração full-stack moderna, ideal para portfólios profissionais, defesas acadêmicas e passível de ampliação como Trabalho de Conclusão de Curso (TCC).
        </p>
      </div>

      {/* Stack Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pilha Tecnológica (Tech Stack)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Frontend */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 h-fit">
              <Layout size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Frontend SPA</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                React, Vite, Tailwind CSS, Recharts (visualização gráfica das tendências climáticas) e Leaflet/React Leaflet (mapeamento geoespacial).
              </p>
            </div>
          </div>

          {/* Backend */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl shrink-0 h-fit">
              <Cpu size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Backend Assíncrono</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Python, FastAPI, Uvicorn, HTTPX (chamadas rápidas e não-bloqueantes para a Open-Meteo) e validação robusta com Pydantic.
              </p>
            </div>
          </div>

          {/* PostgreSQL */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl shrink-0 h-fit">
              <Database size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">PostgreSQL (Auditoria)</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Persistência definitiva dos históricos de consulta por meio do SQLAlchemy, contendo dados climáticos e a resposta bruta (JSONB).
              </p>
            </div>
          </div>

          {/* Redis */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 h-fit">
              <Cpu size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Redis Cache</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Caching temporário das respostas para evitar sobrecarga de chamadas repetidas sobre as mesmas coordenadas.
              </p>
            </div>
          </div>

          {/* Machine Learning */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex gap-4 sm:col-span-2">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 h-fit">
              <Brain size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Inteligência Artificial & Machine Learning</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Treinamento sob demanda de classificadores Random Forest (via Scikit-learn e Joblib) sobre 2 anos de séries históricas reais para estimar chuva, tempestades e risco para o dia seguinte com análise de relevância de variáveis.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ICR Logic details */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe size={18} className="text-indigo-400" />
          Metodologia do Índice de Risco Climático
        </h3>
        <div className="text-xs text-slate-350 space-y-2 leading-relaxed">
          <p>
            O algoritmo analisa 5 variáveis atmosféricas críticas para classificar as ameaças locais de 0 a 10:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pl-2">
            <li><span className="text-rose-400 font-semibold">Calor Extremo:</span> pontua para temperaturas acima de 32°C.</li>
            <li><span className="text-sky-400 font-semibold">Umidade Relativa Baixa:</span> pontua quando o ar fica seco (abaixo de 40%).</li>
            <li><span className="text-indigo-400 font-semibold">Chuva Forte:</span> avalia volumes intensos na hora ou previsões diárias severas.</li>
            <li><span className="text-teal-400 font-semibold">Rajadas de Vento:</span> alerta sobre perigos físicos associados a ventos velozes.</li>
            <li><span className="text-violet-400 font-semibold">Baixa Pressão Atmosférica:</span> detecta sistemas ciclônicos e instabilidade atmosférica repentina.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
