# AtmosView - V5 Produto Final, Autenticação, Relatórios PDF e PWA 🌤️

**AtmosView** é uma plataforma web profissional de análise meteorológica inteligente focada em cidades brasileiras. O sistema foi desenvolvido com uma arquitetura moderna e de responsabilidade única, utilizando cache inteligente e persistência de dados para auditar consultas climáticas, avaliar o risco ecológico de regiões do Brasil, realizar análises históricas de tendências térmicas, executar predições automatizadas utilizando algoritmos de Inteligência Artificial, realizar cruzamento de dados científicos e exportar relatórios customizados com controle de alertas em tempo real.

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em três camadas principais, seguindo os princípios de responsabilidade única e arquitetura limpa:

1. **Frontend SPA (React + Vite + Tailwind CSS + PWA):**
   - Roteamento nativo de **11 Páginas**: `Home`, `Dashboard` (tempo real), `Histórico` (tendências/comparações), `IA` (predições), `Comparação de Fontes`, `Estações`, `Consultas` (histórico de consultas salvas), `Login` (V5 auth), `Perfil` (configurações/alertas V5), `Relatórios` (geração PDF V5) e `Sobre`.
   - **PWA Instalável**: Configurado com Manifest, Service Worker e ícone vetorial (`icon.svg`) para suporte offline e caching inteligente de assets estáticos.
   - **Sistema de Alertas Ativos**: No momento de qualquer consulta meteorológica, o frontend compara os dados recebidos com as preferências de alertas do usuário e exibe banners imediatos de atenção na tela, persistindo-os na base de dados.
   
2. **Backend (FastAPI + HTTPX + SQLAlchemy + ReportLab):**
   - Endpoints REST assíncronos e não-bloqueantes.
   - **Autenticação JWT Local**: Proteção de rotas com token Bearer, criptografia de senhas usando `pbkdf2_sha256` para portabilidade robusta e auto-seeding de usuário administrador padrão.
   - **Gerador de Relatórios em PDF (`pdf_service.py`)**: Utiliza `ReportLab` para desenhar PDFs formatados sob demanda (tabelas de métricas estruturadas, recomendações de ICR, tendências angulares e previsões de IA) transmitidos via `StreamingResponse`.
   - **Abstração de Provedores Climáticos (`weather_providers`)**: Camada extensível contendo `OpenMeteoProvider`, `NasaPowerProvider`, `InmetProvider` e `MockProvider`.

3. **Banco de Dados & Cache (PostgreSQL + Redis + SQLite Fallback):**
   - **PostgreSQL**: Persiste buscas, séries diárias, comparações, relatórios de qualidade, usuários, cidades favoritas e alertas climáticos.
   - **Resiliência e Auto-Healing**: Em caso de ausência do PostgreSQL/Redis, o backend ativa automaticamente um banco local **SQLite** (`backend/atmosview.db`), cria e atualiza as tabelas em tempo de execução e continua operando de forma transparente.

---

## 📂 Estrutura de Pastas

```
atmosview/
├── docker-compose.yml       # Orquestrador oficial de containers
├── .env                     # Variáveis de ambiente configuradas
├── README.md                # Documentação da V5
├── backend/                 # API FastAPI (Python)
│   ├── app/
│   │   ├── main.py          # Seeding de fontes, estações e admin no startup
│   │   ├── database.py      # SQLite Fallback Integrado
│   │   ├── models.py        # Tabelas PostgreSQL/SQLite atualizadas para V5 (User, UserFavorite, WeatherAlert)
│   │   ├── schemas.py       # Schemas Pydantic atualizados para V5
│   │   ├── services/
│   │   │   ├── auth_service.py # Lógica de login, criptografia pbkdf2 e validação JWT
│   │   │   ├── pdf_service.py  # Serviço ReportLab de montagem do PDF
│   │   │   └── weather.py
│   │   └── routers/
│   │       ├── auth.py      # Rotas de cadastro, login, perfil, favoritos e alertas
│   │       ├── reports.py   # Rota de geração de relatório PDF
│   │       └── weather.py
│   └── tests/
│       └── test_app.py      # Suíte de testes automatizados do backend
└── frontend/                # SPA React
    ├── public/
    │   ├── manifest.json    # Metadados do PWA
    │   └── sw.js            # Service Worker de caching e offline
    └── src/
        ├── App.jsx          # Roteamento, menu principal e alertas ativos V5
        ├── services/
        │   └── api.js       # Axios com interceptor de tokens JWT
        ├── pages/
        │   ├── LoginPage.jsx   # Portal de login e cadastro
        │   ├── ProfilePage.jsx # Sliders de alertas e gerenciamento de favoritos
        │   ├── ReportsPage.jsx # Geração e download ágil de PDFs climáticos
        │   ├── MethodologyPage.jsx # Detalhamento das fórmulas (Haversine/ICR)
        │   └── ...
```

---

## 🔬 Fontes de Dados, Limitações e Metodologia Científica

-   **ICR (Índice de Risco Climático)**: Algoritmo que pontua o perigo regional de 0 a 10 avaliando Calores Extremos, Securas de Ar, Volumes Pluviométricos, Rajadas de Vento e Sistemas Ciclônicos.
-   **Fórmula de Haversine**: Equação trigonométrica para calcular a distância esférica entre coordenadas terrestres e encontrar a estação INMET física de solo mais próxima da consulta urbana.
-   **NASA POWER & Open-Meteo**: Fontes globais de dados e reanálise meteorológica que completam medições em tempo real e fornecem cobertura em regiões descobertas por estações.

---

## 🚀 Como Executar o Projeto

### Opção A: Docker Compose (Recomendado)
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

### Opção B: Execução Local
1. **Backend**:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   $env:PYTHONPATH="."; python -m uvicorn app.main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🧪 Como Testar e Validar

### Testes Automatizados (Backend)
No diretório `backend`, você pode rodar os testes utilizando pytest (com banco de dados SQLite em memória isolado):
```bash
$env:PYTHONPATH="backend"; python -m pytest backend/tests
```

### Credenciais Padrão de Demonstração
Para validar a autenticação V5 imediatamente, utilize o usuário administrador pré-semeado:
- **E-mail**: `admin@atmosview.com`
- **Senha**: `admin123`

### Validação do PWA
Abra a aplicação no navegador (Google Chrome ou Edge) e repare no ícone de "Instalar" (computador ou celular com seta para baixo) na barra de endereços, permitindo rodar a aplicação em janela própria com atalho no desktop.

### Testes do Frontend (Interface)
1.  **Comparação de Fontes**: Navegue pelo menu superior até "Comparação de Fontes".
    - Escolha uma cidade (Ex: "São Paulo") e selecione um período de até 4 dias atrás.
    - O sistema carregará os dados e mostrará os cards de metadados, o resumo comparativo, os desvios de temperatura/chuva e os gráficos de linhas e barras do Recharts cruzando as fontes.
2.  **Estações**: No menu superior, clique em "Estações".
    - Digite uma cidade e veja a estação INMET física mais próxima desenhada no mapa Leaflet, conectada por uma linha pontilhada ao centro da cidade selecionada.
