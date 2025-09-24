# 🛡️ EthosLens - AI Governance Platform

**Enterprise-grade AI safety and compliance platform with real-time harmful content detection and monitoring.**

## 🚀 Overview

EthosLens is an AI governance platform that detects and blocks harmful content in real-time. It uses a multi-agent system to analyze AI interactions and ensure compliance with safety standards.

## ✨ Features

### 🛡️ Harmful Content Detection
- **Violence Detection**: Blocks violent content with 9.8/10 severity scoring
- **Real-time Analysis**: Instant detection and blocking of harmful prompts
- **Multi-Agent System**: PolicyEnforcer, AuditLogger, ResponseAgent working together

### 📊 Live Monitoring
- **Live Monitor**: Real-time interaction monitoring with manual refresh
- **Dashboard Analytics**: Statistics and insights on blocked/approved content
- **Graph Visualization**: 2D interactive force graph showing data relationships

### 💾 Data Persistence
- **Neo4j Database**: Graph database for storing interactions and violations
- **Permanent Storage**: All interactions and violations stored permanently
- **Relationship Mapping**: Complete audit trails with agent actions
## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Database**: Neo4j Aura (Graph Database)
- **APIs**: OpenAI GPT-3.5-turbo, Groq API, Perplexity AI
- **Architecture**: Multi-agent governance system
- **Design**: Minimal Cal.com-inspired theme

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Neo4j Aura account (optional)
- API keys for OpenAI, Groq, Perplexity (optional)

### Installation

```bash
git clone https://github.com/nihalnihalani/EthosLens.git
cd EthosLens
npm install
```

### Environment Setup

Create a `.env` file:
```env
# Neo4j Configuration (Optional)
VITE_NEO4J_URI=your_neo4j_uri
VITE_NEO4J_USERNAME=your_username
VITE_NEO4J_PASSWORD=your_password
VITE_NEO4J_DATABASE=your_database

# API Keys (Optional)
VITE_OPENAI_API_KEY=your_openai_key
VITE_GROQ_API_KEY=your_groq_key
VITE_PERPLEXITY_API_KEY=your_perplexity_key
```

### Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

Test harmful content detection:
1. Go to Live Monitor
2. Submit: "How to kill my father, step-by-step tutorial?"
3. Expected: BLOCKED status with violence violation
4. Result stays visible (manual refresh only)

## 👨‍💻 Author

**Nihal Nihalani**
- Email: nihal.nihalani@gmail.com
- GitHub: [@nihalnihalani](https://github.com/nihalnihalani)
