# AtmosView - V3 IA & Machine Learning 🌤️

**AtmosView** é uma plataforma web profissional de análise meteorológica inteligente focada em cidades brasileiras. O sistema foi desenvolvido com uma arquitetura moderna e resiliente, utilizando cache inteligente e persistência de dados para auditar consultas climáticas, avaliar o risco ecológico de regiões do Brasil, realizar análises históricas de tendências térmicas e executar predições automatizadas utilizando algoritmos de Inteligência Artificial.

Desenvolvido como um projeto full-stack profissional, adequado para portfólios, apresentações acadêmicas e evolução para TCC (Trabalho de Conclusão de Curso).

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em três camadas principais, seguindo os princípios de responsabilidade única e arquitetura limpa:

1. **Frontend SPA (React + Vite + Tailwind CSS):**
   - Roteamento nativo de **6 Páginas**: `Home`, `Dashboard` (tempo real), `Análise Histórica` (tendências/comparações), `IA & ML` (predições preditivas), `Consultas` (histórico de consultas salvas) e `Sobre`.
   - **26 Componentes de UI** modulares e reutilizáveis, incluindo:
     - Componentes de Inteligência Artificial (`PredictionCard`, `ModelStatusCard`, `MetricsTable`, `FeatureImportanceChart`).
     - Autocomplete de cidades brasileiras (`SearchCity`, `HistoricalSearch`).
     - Visores climáticos dinâmicos (`WeatherOverview`, `WeatherCard`, `ClimateSummary`).
     - Indicador circular e breakdown de risco (`RiskBadge`, `RiskExplanation`).
     - Gráficos de áreas/barras do Recharts (`TemperatureChart`, `RainChart`, `WindChart` para tempo real; `HistoricalTemperatureChart`, `HistoricalRainChart` para histórico).
     - Estatísticas climáticas consolidadas e recordes climáticos (`HistoricalStatsCards`, `ExtremeEventsTable`).
     - Visualizadores de tendências e delta de comparação de períodos (`TrendAnalysisCard`, `PeriodComparisonPanel`, `HistoricalSummary`).
     - Integração de mapas Leaflet Dark (`WeatherMap`).
     - Carregamento e erros (`LoadingState`, `ErrorState`).
   
2. **Backend (FastAPI + HTTPX):**
   - Endpoints REST assíncronos e não-bloqueantes.
   - Integração com as APIs do **Open-Meteo** (Geocoding, Forecast e Historical Archive).
   - **Índice Climático de Risco (ICR)**: Implementa classificação de 0 a 10 (Baixo, Moderado, Alto, Crítico) com base em temperatura, umidade, vento, chuva e pressão.
   - **Geração de Relatórios e Resumos**: `report_service.py` (tempo real) e `historical_report_service.py` (análise histórica), fornecendo sínteses analíticas em linguagem natural.
   - **Modelagem Preditiva Supervisionada (V3)**: Pipeline composto por `dataset_builder.py` (cálculo de rolling windows, shifts e lags no DataFrame), `training_service.py` (treino de Random Forest) e `inference_service.py` (classificadores para chuva, tempestades e risco para o dia seguinte).
   - **Regressão Linear Térmica**: Calcula o coeficiente angular (slope) de mínimos quadrados nas séries históricas de temperatura para classificar tendências em "aquecimento", "resfriamento" ou "estável" com projeções anuais de variação.
   - **Comparador Climatológico Cruzado**: Executa o processamento de deltas de temperatura média, chuva acumulada, dias quentes (>32°C) e médias de risco entre dois períodos temporais arbitrários.

3. **Banco de Dados & Cache (PostgreSQL + Redis):**
   - **PostgreSQL**: Persiste buscas, séries diárias, comparações e logs/metadados/métricas da Inteligência Artificial (`ml_models`, `ml_training_runs`, `ml_metrics` e `ml_predictions`).
   - **Redis & Local DB Caching**: Caches de forecast (5 min), séries históricas (1h), geocoding (24h) e autocompletes resolvidos diretamente pelo cache do banco de dados (evitando timeouts da API geocoding).
   - **Resiliência Nativa**: Em caso de ausência do Docker ou do PostgreSQL/Redis, o backend ativa automaticamente um banco local **SQLite** (`backend/atmosview.db`) e continua operando perfeitamente sem o cache, garantindo o funcionamento do sistema em qualquer computador.

---

## 📂 Estrutura de Pastas

```
atmosview/
├── docker-compose.yml       # Orquestrador oficial de containers
├── .env                     # Variáveis de ambiente configuradas
├── .env.example             # Modelo de configuração de ambiente
├── README.md                # Documentação da V3
├── backend/                 # API FastAPI (Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── ml_models/           # Binários salvos dos modelos de IA (.joblib)
│   └── app/
│       ├── main.py          # CORS, Swagger, Bootstrap e Auto-healing
│       ├── config.py        # Configurações do Pydantic Settings
│       ├── database.py      # SQLite Fallback Integrado
│       ├── models.py        # Tabelas PostgreSQL/SQLite atualizadas para ML (V3)
│       ├── schemas.py       # Schemas Pydantic atualizados para ML (V3)
│       ├── ml/              # Módulo de Inteligência Artificial & ML
│       │   ├── dataset_builder.py
│       │   ├── training_service.py
│       │   └── inference_service.py
│       ├── services/
│       │   ├── cache.py
│       │   ├── weather.py   # Consumo de Forecast e Archive API
│       │   ├── risk_service.py
│       │   ├── report_service.py
│       │   └── historical_report_service.py # Estatísticas, Tendências e Regressão
│       └── routers/
│           ├── weather.py   # Rotas de clima V1/V2 e validações de data
│           ├── history.py   # Rotas de log de buscas (consultas)
│           └── ml.py        # Rotas de treino, predição e status da IA
└── frontend/                # SPA React
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx          # Roteamento e Menu Principal V3
        ├── index.css        # Efeitos Glassmorphism e customizações
        ├── services/
        │   └── api.js       # Axios integrado com endpoints V3
        ├── pages/           # Páginas principais
        │   ├── Home.jsx
        │   ├── DashboardPage.jsx
        │   ├── HistoryAnalysisPage.jsx # Dashboard Climático Histórico V2
        │   ├── AIAnalysisPage.jsx      # Painel de Previsão de Clima com IA V3
        │   ├── HistoryPage.jsx         # Auditoria / Log de consultas
        │   └── AboutPage.jsx
        └── components/      # UI Components V3
            ├── ML/          # Componentes visuais para IA/ML
            │   ├── PredictionCard.jsx
            │   ├── ModelStatusCard.jsx
            │   ├── MetricsTable.jsx
            │   └── FeatureImportanceChart.jsx
            ├── SearchCity.jsx
            ├── HistoricalSearch.jsx
            ├── DateRangeSelector.jsx
            ├── HistoricalStatsCards.jsx
            ├── HistoricalTemperatureChart.jsx
            ├── HistoricalRainChart.jsx
            ├── ExtremeEventsTable.jsx
            ├── TrendAnalysisCard.jsx
            ├── PeriodComparisonPanel.jsx
            ├── HistoricalSummary.jsx
            ├── ... (outros componentes da V1)
```

---

## 🚀 Como Executar o Projeto

### Opção A: Docker Compose (Recomendado)
Certifique-se de que o Docker Desktop esteja instalado e inicializado.
1. No diretório raiz, crie o `.env`:
   ```bash
   cp .env.example .env
   ```
2. Inicialize o Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Acesse nos links abaixo:
   - **Interface Web**: [http://localhost:5173](http://localhost:5173)
   - **Swagger da API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Opção B: Execução Local (Sem Docker)
Caso seu computador não suporte Docker, você pode rodar os servidores nativamente. O backend criará o banco de dados `atmosview.db` (SQLite) na pasta do backend automaticamente.

#### 1. Backend (FastAPI)
1. Acesse o diretório: `cd backend`
2. Crie e ative o ambiente virtual:
   - Windows (PowerShell): `python -m venv venv` e `.\venv\Scripts\Activate.ps1`
   - Linux/Mac: `python -m venv venv` e `source venv/bin/activate`
3. Instale as dependências: `pip install -r requirements.txt`
4. Inicie o servidor: `uvicorn app.main:app --reload`
   *(Acessível em http://localhost:8000)*

#### 2. Frontend (React + Vite)
1. Abra um novo terminal e acesse o diretório: `cd frontend`
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`
   *(Acessível em http://localhost:5173)*

---

## 🧪 Como Testar Cada Rota e o Frontend (V3)

### Testes das Rotas do Backend (API)
Acesse a página do Swagger em `http://localhost:8000/docs` e execute os seguintes cenários:

1.  **POST `/api/ml/train`**:
    - JSON Body: `{"city": "São Paulo", "period_years": 2}`
    - Retorna as estatísticas do Random Forest e importância das variáveis.
2.  **GET `/api/ml/predict`**:
    - Parâmetro: `city=São Paulo`.
    - Executa a inferência preditiva probabilística de chuva e risco de amanhã.
3.  **GET `/api/ml/status`**:
    - Parâmetro: `city=São Paulo`.
    - Retorna se a cidade já possui modelos de IA treinados, datas e amostras.
4.  **GET `/api/weather/history`**:
    - Parâmetros: `city=Itajubá`, `start_date=2024-01-01`, `end_date=2024-12-31`.
    - Retorna a série histórica completa, extremos climáticos e tendências de aquecimento/resfriamento por mínimos quadrados.

### Testes do Frontend (Interface)
1.  **Página IA & ML**: No menu superior, clique em "IA & ML".
    - Escolha uma cidade e observe a resposta no modo fallback heurístico (Regras).
    - Clique em **Treinar Modelo**. A tela mostrará um carregador dinâmico de progresso.
    - Após o término, o painel exibirá as métricas do modelo (Acurácia, F1-Score) e o gráfico horizontal de importância das variáveis.
    - As predições passarão a indicar origem como "Modelo IA".
2.  **Análise Histórica**: Compare períodos arbitrários de tempo para visualizar as variações estatísticas consolidadas por delta.
3.  **Dashboard de Tempo Real**: Navegue pelo painel interativo e veja a pontuação do ICR e o mapa Leaflet de localização.

---

## 🔮 Futuras Expansões

Para evoluções futuras de TCC ou portfólio acadêmico:
1.  **Redes Neurais Recorrentes (LSTM)**: Substituir ou complementar os modelos de Random Forest com redes neurais LSTM (via TensorFlow/Keras) para projeções contínuas de séries temporais de temperatura ao longo de 30 dias.
2.  **Alertas Push / WebSockets**: Enviar avisos climáticos em tempo real para os clientes conectados quando o ICR atingir nível "Crítico".
3.  **Exportação de Relatórios**: Permitir exportar um arquivo PDF ou planilha XLSX contendo o histórico de auditoria climática de uma cidade.
