# AtmosView - V4 Evolução Científica e Comparação de Fontes 🌤️

**AtmosView** é uma plataforma web profissional de análise meteorológica inteligente focada em cidades brasileiras. O sistema foi desenvolvido com uma arquitetura moderna e de responsabilidade única, utilizando cache inteligente e persistência de dados para auditar consultas climáticas, avaliar o risco ecológico de regiões do Brasil, realizar análises históricas de tendências térmicas, executar predições automatizadas utilizando algoritmos de Inteligência Artificial e realizar cruzamento climatológico de alta precisão comparando dados de reanálise por satélite e modelos globais com medições reais obtidas em estações terrestres de solo brasileiras.

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em três camadas principais, seguindo os princípios de responsabilidade única e arquitetura limpa:

1. **Frontend SPA (React + Vite + Tailwind CSS):**
   - Roteamento nativo de **8 Páginas**: `Home`, `Dashboard` (tempo real), `Histórico` (tendências/comparações), `IA` (predições preditivas), `Comparação de Fontes` (cruzamento científico V4), `Estações` (localização da rede de solo), `Consultas` (histórico de consultas salvas) e `Sobre`.
   - **32 Componentes de UI** modulares e reutilizáveis, incluindo:
     - Componentes Científicos V4 (`SourceSelector`, `SourceComparisonTable`, `MultiSourceTemperatureChart`, `MultiSourceRainChart`, `DataAvailabilityCard`, `DivergenceAnalysisCard`).
     - Componentes de Inteligência Artificial (`PredictionCard`, `ModelStatusCard`, `MetricsTable`, `FeatureImportanceChart`).
     - Autocomplete de cidades brasileiras (`SearchCity`, `HistoricalSearch`).
     - Visores climáticos dinâmicos (`WeatherOverview`, `WeatherCard`, `ClimateSummary`).
     - Indicador circular e breakdown de risco (`RiskBadge`, `RiskExplanation`).
     - Gráficos comparativos e de séries do Recharts.
     - Integração de mapas Leaflet Dark (`WeatherMap`, `StationsPage` com polylines dinâmicas de distância).
     - Carregamento e erros (`LoadingState`, `ErrorState`).
   
2. **Backend (FastAPI + HTTPX):**
   - Endpoints REST assíncronos e não-bloqueantes.
   - **Abstração de Provedores Climáticos (`weather_providers`)**: Camada extensível contendo `OpenMeteoProvider`, `NasaPowerProvider`, `InmetProvider` e `MockProvider` para simulações e testes locais.
   - **Serviço de Qualidade de Dados (`data_quality_service.py`)**: Analisa integridade, lacunas de datas, completude percentual e outliers de dados climáticos para emitir um relatório de QA/QC avaliado em "Boa", "Parcial" ou "Fraca".
   - **Cálculo de Estação mais Próxima (Haversine)**: Compara coordenadas geográficas da busca urbana com a base de estações do INMET para calcular a distância em km da estação de solo mais próxima.
   - **Índice Climático de Risco (ICR)**: Classificação de 0 a 10 baseada em temperatura, umidade, vento, chuva e pressão.
   - **Modelagem Preditiva Supervisionada (V3)**: Pipeline composto por `dataset_builder.py`, `training_service.py` (treino de Random Forest) e `inference_service.py`.
   - **Regressão Linear Térmica**: Calcula o coeficiente angular (slope) de mínimos quadrados nas séries históricas para classificar tendências térmicas.
   
3. **Banco de Dados & Cache (PostgreSQL + Redis):**
   - **PostgreSQL**: Persiste buscas, séries diárias, comparações de períodos, auditorias de fontes, relatórios de qualidade e metadados de modelos de IA.
   - **Redis & Local DB Caching**: Caches de forecast (5 min), séries históricas (1h), geocoding (24h) e autocompletes resolvidos pelo cache do banco.
   - **Resiliência Nativa**: Em caso de ausência do PostgreSQL/Redis, o backend ativa automaticamente um banco local **SQLite** (`backend/atmosview.db`) e continua operando perfeitamente.

---

## 📂 Estrutura de Pastas

```
atmosview/
├── docker-compose.yml       # Orquestrador oficial de containers
├── .env                     # Variáveis de ambiente configuradas
├── README.md                # Documentação da V4
├── backend/                 # API FastAPI (Python)
│   ├── app/
│   │   ├── main.py          # Seeding de fontes/estações no startup e Auto-healing
│   │   ├── database.py      # SQLite Fallback Integrado
│   │   ├── models.py        # Tabelas PostgreSQL/SQLite atualizadas para V4
│   │   ├── schemas.py       # Schemas Pydantic atualizados para V4
│   │   ├── weather_providers/  # Abstração de Fontes Climáticas (V4)
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── open_meteo.py
│   │   │   ├── nasa_power.py
│   │   │   ├── inmet.py
│   │   │   └── mock.py
│   │   ├── services/
│   │   │   ├── data_quality_service.py  # Análise de consistência e completude
│   │   │   └── weather.py   # Seeding de estações, Haversine e Comparador Científico
│   │   └── routers/
│   │       └── weather.py   # Endpoints /stations/nearest e /weather/source-comparison
└── frontend/                # SPA React
    └── src/
        ├── App.jsx          # Roteamento e Menu Principal V4
        ├── services/
        │   └── api.js       # Endpoints integrados do backend
        ├── pages/
        │   ├── SourceComparisonPage.jsx # Cruzamento de dados de satélite e solo
        │   ├── StationsPage.jsx         # Mapa de estações terrestres e distâncias
        │   └── ... (outras páginas)
        └── components/
            └── Scientific/  # Componentes visuais para V4
                ├── SourceSelector.jsx
                ├── SourceComparisonTable.jsx
                ├── MultiSourceTemperatureChart.jsx
                ├── MultiSourceRainChart.jsx
                ├── DataAvailabilityCard.jsx
                └── DivergenceAnalysisCard.jsx
```

---

## 🔬 Fontes de Dados, Limitações e Metodologia Científica

### Fontes de Dados Utilizadas
1.  **Open-Meteo (Modelos Globais)**: Utiliza dados de modelos de previsão numérica e reanálise (como o ERA5 do ECMWF). Fornece dados imediatos para qualquer coordenada global.
2.  **NASA POWER (Satélite / Reanálise)**: Projeto da NASA voltado para dados climatológicos mundiais baseados em sensoriamento remoto por satélite e reanálise de modelos globais.
3.  **INMET (Rede Física de Solo)**: Instituto Nacional de Meteorologia do Brasil. Fornece dados reais medidos *in situ* por termômetros, pluviômetros e anemômetros instalados em estações de superfície.

### Limitações de Cada Fonte
-   **Open-Meteo**: Por ser um modelo numérico suavizado em grade, pode não detectar microclimas urbanos específicos ou efeitos locais de vales e montanhas.
-   **NASA POWER**: Resolução de grade relativamente grossa (~50km). Além disso, os dados possuem um tempo de consolidação natural de cerca de 4 a 5 dias, impossibilitando consultas em tempo real imediato.
-   **INMET**: Apresenta interrupções e lacunas de dados devido a instabilidades na rede de comunicação GSM/satélite das estações ou por sensores em manutenção física.

### Metodologia de Comparação e Importância Acadêmica
O sistema calcula a distância de **Haversine** entre as coordenadas da cidade buscada e todas as estações do INMET armazenadas no banco. A estação operante mais próxima é selecionada para consulta. 

Os dados diários são coletados para o período solicitado em todas as três fontes. A divergência percentual e absoluta é calculada tomando como referência a reanálise do Open-Meteo contra a medição física do INMET e da NASA.

Esta metodologia é de extrema importância para as **Ciências Atmosféricas** e **Engenharia Meteorológica**, pois permite avaliar a confiabilidade dos modelos de satélite em solo brasileiro (especialmente nas regiões tropicais, onde a modelagem de chuva apresenta alta complexidade).

---

## 🚀 Como Executar o Projeto

### Opção A: Docker Compose (Recomendado)
Certifique-se de que o Docker Desktop esteja instalado.
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

## 🧪 Como Testar Cada Rota e o Frontend (V4)

### Testes das Rotas do Backend (API)
Acesse a página do Swagger em `http://localhost:8000/docs` e execute os seguintes cenários:

1.  **GET `/api/stations/nearest`**:
    - Parâmetros: `lat=-23.5489`, `lon=-46.6388` (coordenadas de São Paulo).
    - Retorna a estação "SÃO PAULO - MIRANTE (A701)" com distância < 10 km.
2.  **GET `/api/weather/source-comparison`**:
    - Parâmetros: `city=Sao Paulo`, `start_date=2026-06-01`, `end_date=2026-06-12`.
    - Retorna o JSON estruturado comparando as três fontes com divergências e relatórios de controle de qualidade.

### Testes do Frontend (Interface)
1.  **Comparação de Fontes**: Navegue pelo menu superior até "Comparação de Fontes".
    - Escolha uma cidade (Ex: "São Paulo") e selecione um período de até 4 dias atrás.
    - O sistema carregará os dados e mostrará os cards de metadados, o resumo comparativo, os desvios de temperatura/chuva e os gráficos de linhas e barras do Recharts cruzando as fontes.
2.  **Estações**: No menu superior, clique em "Estações".
    - Digite uma cidade e veja a estação INMET física mais próxima desenhada no mapa Leaflet, conectada por uma linha pontilhada ao centro da cidade selecionada.
