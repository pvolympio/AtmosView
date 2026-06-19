# AtmosView — Plataforma Full-Stack de Inteligência Climatológica e Riscos Ambientais (V5) 🌤️

**AtmosView** é uma plataforma meteorológica de nível profissional e industrial focada em municípios brasileiros. O projeto foi projetado do zero sob os preceitos de **Clean Architecture**, alta performance, segurança robusta e Inteligência Artificial integrada.

O sistema atua unificando e auditando dados climatológicos de múltiplas fontes científicas (satélites e sensores terrestres), cruzando previsões globais com medições reais e gerando predições supervisionadas por IA e relatórios vetoriais para subsidiar decisões de Defesa Civil, Planejamento Urbano e Agronegócio.

---

## 🏗️ Arquitetura e Engenharia do Sistema

O AtmosView é estruturado em três camadas com responsabilidades bem definidas:

1. **Frontend SPA & PWA (React + Vite + Tailwind CSS + PWA)**:
   - Roteamento nativo cobrindo **11 Páginas**: `Home` (nova landing page premium), `Dashboard` (tempo real), `Histórico` (tendências/comparações), `IA` (predições), `Comparação de Fontes`, `Estações`, `Consultas` (histórico de buscas), `Login` (V5 auth), `Perfil` (configurações/alertas), `Relatórios` (gerador PDF) e `Sobre`.
   - **PWA Instalável**: Configurado com Service Worker e Web App Manifest, permitindo a instalação nativa do app em dispositivos móveis e desktop, além de caching local de assets estáticos.
   - **Sistema de Alertas Ativos**: Interceptação em tempo real de limiares climáticos (vento, calor, chuva, umidade e risco) parametrizados pelo usuário logado, disparando banners flutuantes de atenção e persistindo notificações no banco.

2. **Backend Assíncrono (FastAPI + SQLAlchemy + ReportLab)**:
   - Endpoints REST assíncronos não-bloqueantes em Python.
   - **Autenticação JWT Local**: Segurança no controle de sessão com token Bearer, criptografia de senhas baseada no algoritmo portátil `pbkdf2_sha256` e seeding automático de administrador padrão no startup.
   - **Geração de PDF (ReportLab)**: Emissão sob demanda de relatórios vetoriais direto no buffer de memória, evitando gravação em disco no servidor e agilizando downloads via `StreamingResponse`.
   - **Abstração de Provedores (`weather_providers`)**: Camada extensível com polimorfismo contendo `OpenMeteoProvider`, `NasaPowerProvider`, `InmetProvider` (estações terrestres) e `MockProvider` para simulações locais.

3. **Banco de Dados & Cache (PostgreSQL + Redis + SQLite Auto-Healing)**:
   - **PostgreSQL**: Persistência relacional de históricos de busca, séries diárias completas, usuários, cidades favoritas e alertas climáticos.
   - **Redis**: Armazenamento em cache de queries de geolocalização e respostas de dados meteorológicos para otimização de tráfego e latência.
   - **Resiliência e Auto-Healing (SQLite Fallback)**: Em caso de indisponibilidade do PostgreSQL/Redis, o backend ativa a autocura e chaveia de forma transparente para um banco de dados local **SQLite** (`atmosview.db`), recriando todas as tabelas em tempo de execução e continuando a operar sem interrupções.

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
Você pode rodar a suíte de testes unitários e de integração utilizando pytest (com banco de dados SQLite em memória isolado de forma automática):

- **Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH="backend"; python -m pytest backend/tests
  ```
- **Windows (CMD)**:
  ```cmd
  set PYTHONPATH=backend
  python -m pytest backend/tests
  ```
- **Linux / macOS**:
  ```bash
  PYTHONPATH=backend python -m pytest backend/tests
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
