import React from 'react';
import { Landmark, Compass, Brain, Cpu, BookOpen, Scale, ArrowRight } from 'lucide-react';

const MethodologyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Metodologia e Fundamentação Científica</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Entenda as fórmulas, os cruzamentos estatísticos e os modelos matemáticos que regem o AtmosView.
        </p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ICR (Indice de Risco Climatico) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl w-fit">
              <Scale size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Índice de Risco Climático (ICR)</h3>
            <p className="text-[11px] text-slate-350 leading-relaxed">
              O ICR pontua de 0 a 10 os riscos ambientais imediatos sofridos pela localidade com base em 5 eixos de vulnerabilidade atmosférica:
            </p>
            <ul className="text-[10px] text-slate-450 space-y-2 list-disc list-inside">
              <li><strong className="text-slate-300">Stress Térmico:</strong> Temperaturas superiores a 32°C adicionam pontuação de forma linear até atingir o limite crítico.</li>
              <li><strong className="text-slate-300">Desidratação do Ar:</strong> Umidades relativas inferiores a 40% indicam secura prejudicial à saúde respiratória.</li>
              <li><strong className="text-slate-300">Volume Pluviométrico:</strong> Avaliação de chuvas acumuladas acima de 30mm/dia ou intensidade horária severa.</li>
              <li><strong className="text-slate-300">Instabilidade de Vento:</strong> Rajadas com velocidades acima de 50km/h aumentam o risco de quedas de estruturas.</li>
              <li><strong className="text-slate-300">Ciclones/Baixa Pressão:</strong> Pressão superficial abaixo de 1008 hPa sinaliza instabilidade e convergência de ventos.</li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-900/60 mt-4 text-[10px] text-indigo-400 font-bold flex items-center gap-1.5">
            Pontuação Máxima: 10.0 (Crítico) <ArrowRight size={12} />
          </div>
        </div>

        {/* Haversine Formula */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit">
              <Compass size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Fórmula de Haversine</h3>
            <p className="text-[11px] text-slate-355 leading-relaxed">
              Utilizada para localizar as estações automáticas do INMET mais próximas de qualquer coordenada geográfica informada, desconsiderando a distorção da curvatura terrestre.
            </p>
            
            {/* Formula box */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl font-mono text-[9px] text-slate-400 space-y-2 leading-relaxed">
              <p className="text-center font-bold text-indigo-400">d = 2R · arcsin( √[ sin²(Δlat/2) + cos(lat₁)cos(lat₂)sin²(Δlon/2) ] )</p>
              <p className="text-slate-500">Onde:</p>
              <p>• R = raio médio da Terra (6371 km)</p>
              <p>• lat₁, lat₂ = latitudes em radianos</p>
              <p>• Δlat, Δlon = deltas em radianos</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-900/60 mt-4 text-[10px] text-indigo-400 font-bold flex items-center gap-1.5">
            Erro máximo estimado: &lt; 0.5% <ArrowRight size={12} />
          </div>
        </div>

        {/* Machine Learning (V3) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit">
            <Brain size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Predições com Machine Learning</h3>
          <p className="text-[11px] text-slate-350 leading-relaxed">
            O pipeline preditivo do AtmosView utiliza classificadores do tipo **Random Forest** (Florestas Aleatórias) treinados sob demanda para cada cidade.
          </p>
          <p className="text-[10px] text-slate-450 leading-relaxed">
            A partir de 2 anos de séries climatológicas brutas (mais de 730 registros diários), montamos um dataset contendo médias móveis, temperaturas do dia anterior, volume acumulado de chuva nas últimas 72 horas e fatores sazonais baseados na latitude e na época do ano. O algoritmo avalia a probabilidade matemática de chuva e ventania forte para o dia seguinte, exibindo a importância das variáveis mais determinantes no processo de classificação.
          </p>
        </div>

        {/* Scientific Weather Sources (V4) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl w-fit">
            <Landmark size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Integração de Fontes Científicas</h3>
          <p className="text-[11px] text-slate-350 leading-relaxed">
            O AtmosView compara modelos climáticos globais preditivos com registros históricos observados no solo brasileiro:
          </p>
          <div className="space-y-3 pt-2">
            <div className="text-[10px] text-slate-450">
              <strong className="text-slate-300">1. INMET (Instituto Nacional de Meteorologia):</strong>
              <p className="mt-0.5 pl-3 border-l border-slate-800">Fornece dados observados em tempo real de mais de 500 estações automáticas oficiais distribuídas pelo território brasileiro.</p>
            </div>
            <div className="text-[10px] text-slate-450">
              <strong className="text-slate-300">2. NASA POWER:</strong>
              <p className="mt-0.5 pl-3 border-l border-slate-800">Modelo global baseado em satélite e reanálise climática, ideal para regiões distantes de qualquer estação de solo física.</p>
            </div>
            <div className="text-[10px] text-slate-450">
              <strong className="text-slate-300">3. Open-Meteo:</strong>
              <p className="mt-0.5 pl-3 border-l border-slate-800">Serviço de alta resolução que combina modelos numéricos globais para previsões horárias e diárias de altíssima precisão.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer methodology note */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-850 text-center text-[10px] text-slate-500 max-w-2xl mx-auto">
        <p className="leading-relaxed">
          Esta metodologia segue boas práticas de engenharia de software e análise estatística de dados meteorológicos. Para previsões e alertas oficiais para salvaguarda de vidas humanas, consulte sempre o INMET e a Defesa Civil do seu estado.
        </p>
      </div>

    </div>
  );
};

export default MethodologyPage;
