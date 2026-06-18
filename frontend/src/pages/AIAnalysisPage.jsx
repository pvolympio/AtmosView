import React, { useState, useEffect } from 'react';
import { Brain, CloudRain, AlertTriangle, Activity, Sparkles, HelpCircle } from 'lucide-react';
import { weatherApi } from '../services/api';
import SearchCity from '../components/SearchCity';
import PredictionCard from '../components/ML/PredictionCard';
import MetricsTable from '../components/ML/MetricsTable';
import FeatureImportanceChart from '../components/ML/FeatureImportanceChart';
import ModelStatusCard from '../components/ML/ModelStatusCard';

const AIAnalysisPage = () => {
  const [cityName, setCityName] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-clear toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load predictions and ML status for the city
  const loadCityData = async (city) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both predict and status in parallel
      const [predData, statusData] = await Promise.all([
        weatherApi.getPredictions(city),
        weatherApi.getMLStatus(city)
      ]);
      
      setPredictions(predData);
      setMlStatus(statusData);
      setCityName(statusData.city_name);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as análises de Inteligência Artificial para esta cidade.");
    } finally {
      setLoading(false);
    }
  };

  // Triggers the model training request
  const handleTrainModels = async () => {
    if (!cityName) return;
    setIsTraining(true);
    setToast({
      type: "info",
      message: `Iniciando treinamento dos modelos para ${cityName}. Isso pode levar até 1 minuto...`
    });
    
    try {
      const res = await weatherApi.trainModels(cityName, 2);
      setToast({
        type: "success",
        message: `Treinamento finalizado com sucesso! Modelos atualizados com ${res.samples_used} amostras.`
      });
      // Reload updated data
      await loadCityData(cityName);
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: "Falha durante o treinamento. A API externa pode estar instável ou sem dados suficientes."
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleSelectCity = (cityQuery) => {
    loadCityData(cityQuery);
  };

  // Build the feature importances object structured as expected by FeatureImportanceChart
  const getImportancesResults = () => {
    const results = {};
    if (mlStatus && mlStatus.models) {
      mlStatus.models.forEach(m => {
        results[m.model_type] = {
          importances: m.importances || []
        };
      });
    }
    return results;
  };

  const rainPred = predictions?.predictions.find(p => p.prediction_type === 'rain');
  const heavyPred = predictions?.predictions.find(p => p.prediction_type === 'heavy_rain');
  const riskPred = predictions?.predictions.find(p => p.prediction_type === 'risk');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all duration-300 text-xs font-bold ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/20"
            : toast.type === "error"
            ? "bg-red-950/90 text-red-400 border-red-500/20"
            : "bg-indigo-950/90 text-indigo-400 border-indigo-500/20 animate-pulse"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-950 to-slate-950 border border-slate-900/80 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-br from-indigo-600/10 to-transparent blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Brain size={12} />
            Análise Preditiva e Machine Learning
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Meteorologia Inteligente com IA
          </h2>
          
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            Explore modelos preditivos de chuva, precipitações severas e nível de risco climático para amanhã.
            Treine algoritmos de Random Forest baseados em séries históricas personalizadas de cada município brasileiro.
          </p>
        </div>
      </div>

      {/* Interactive Search Section */}
      <div className="flex flex-col items-center gap-4 py-2">
        <h3 className="text-slate-300 font-bold text-xs text-center uppercase tracking-widest">
          Selecione a cidade para análise preditiva
        </h3>
        <SearchCity onSelectCity={handleSelectCity} />
      </div>

      {/* Main Analysis Display */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold animate-pulse">Compilando dados de contexto e rodando inferências preditivas...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-red-500/15 bg-red-950/5 text-center max-w-xl mx-auto space-y-4">
          <AlertTriangle className="text-red-400 mx-auto" size={32} />
          <p className="text-red-200 text-sm font-bold">{error}</p>
        </div>
      ) : predictions ? (
        <div className="space-y-8">
          
          {/* Main Top Grid: 3 Predictions + 1 Model Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PredictionCard
              title="Previsão de Chuva (Amanhã)"
              predictionLabel={rainPred?.label || 'Não'}
              probability={rainPred?.probability}
              source={rainPred?.source || 'rule-based'}
              icon={CloudRain}
              iconColor="text-sky-400"
            />
            
            <PredictionCard
              title="Risco de Tempestade / Chuva Forte"
              predictionLabel={heavyPred?.label || 'Não'}
              probability={heavyPred?.probability}
              source={heavyPred?.source || 'rule-based'}
              icon={AlertTriangle}
              iconColor="text-rose-400"
            />
            
            <PredictionCard
              title="Classificação de Risco ICR (Amanhã)"
              predictionLabel={riskPred?.label || 'Baixo'}
              probability={riskPred?.probability}
              source={riskPred?.source || 'rule-based'}
              icon={Activity}
              iconColor="text-amber-500"
            />

            <ModelStatusCard
              cityName={cityName}
              hasTrainedModels={mlStatus?.has_trained_models}
              lastTrainedAt={mlStatus?.models?.[0]?.trained_at}
              samplesCount={mlStatus?.models?.[0]?.samples_count}
              trainingRunsCount={mlStatus?.training_runs || 0}
              onTrain={handleTrainModels}
              isTraining={isTraining}
            />
          </div>

          {/* Heuristics Warning Banner if no model trained */}
          {!mlStatus?.has_trained_models && (
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/15 bg-amber-950/5 flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300">Modo Heurístico Ativo</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Não encontramos modelos de inteligência artificial treinados para a cidade de **{cityName}**. 
                  As previsões mostradas acima estão utilizando o algoritmo de fallback heurístico (baseado em regras de clima atual). 
                  Para maior precisão e ativar o aprendizado supervisionado, clique em **Treinar Modelo** acima para treinar uma Random Forest com dados reais dos últimos 2 anos.
                </p>
              </div>
            </div>
          )}

          {/* Model Metrics & feature importance details */}
          {mlStatus?.has_trained_models && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Feature Importance Recharts (7 cols) */}
              <div className="lg:col-span-7">
                <FeatureImportanceChart results={getImportancesResults()} />
              </div>
              
              {/* Metrics Table (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <MetricsTable models={mlStatus.models} />
              </div>
              
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-10 rounded-3xl border border-slate-900 text-center max-w-xl mx-auto space-y-4">
          <Brain className="text-slate-700 mx-auto animate-float" size={40} />
          <p className="text-slate-400 text-xs font-semibold">Busque uma cidade acima para visualizar previsões baseadas em Machine Learning.</p>
        </div>
      )}

      {/* General Instructions Accordion-like Info section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-900 space-y-4">
        <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
          <HelpCircle size={14} className="text-indigo-400" />
          Como funciona a previsão por Machine Learning?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-slate-400 leading-relaxed font-medium">
          <div className="space-y-2">
            <h5 className="font-bold text-slate-300">1. Dataset Histórico</h5>
            <p>O AtmosView consulta séries históricas da Open-Meteo contendo medições diárias reais. A partir disso, calcula variáveis derivadas como médias móveis de umidade, chuva dos dias anteriores e estações sazonais.</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-300">2. Algoritmo Random Forest</h5>
            <p>O algoritmo RandomForestClassifier constrói dezenas de árvores de decisão. Para cada dia do histórico, analisa as condições atuais para prever as condições atmosféricas e de risco do dia seguinte.</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-300">3. Avaliação e Métricas</h5>
            <p>Os modelos são divididos em 80% treino e 20% teste. O sistema calcula a taxa de acerto (acurácia e F1-score) com dados que o modelo nunca viu antes, validando a confiabilidade das previsões futuras.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AIAnalysisPage;
