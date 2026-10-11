# 🛠️ Assistência Técnica - Sistema de Gestão de Ordens de Serviço (OS)

Um sistema moderno, responsivo e em tempo real para gerenciamento de Ordens de Serviço em assistências técnicas de informática (notebooks, desktops e periféricos). Desenvolvido com **React (Vite)**, **Tailwind CSS** e **Firebase Firestore**.

---

## 🚀 Funcionalidades Principais

- **📊 Dashboard em Tempo Real:** Listagem dinâmica conectada ao Firebase Firestore com atualização instantânea.
- **🏷️ Filtros Rápidos:** Filtragem rápida de OS por status (*Todas*, *Aguardando*, *Em Andamento*, *Orçamento Enviado*).
- **📝 Gestão Completa de OS (CRUD):**
  - Cadastro e edição com número de OS, dados do cliente, tipo de equipamento e defeito relatado.
  - **Serviços Pré-Aprovados Dinâmicos:** Adição em lote de serviços e valores por linha.
  - **Datas e Horários:** Registros precisos de entrada e previsão de entrega (`DD/MM/AAAA - HH:mm`).
- **📱 Máscaras Automáticas:** Formatação e validação inteligente de telefone/WhatsApp `(XX) XXXXX-XXXX`.
- **🎨 UI/UX Refinada:** 
  - Interface Dark Mode em tons de Slate com componentes isolados e modais customizados.
  - Scrollbar moderna e estilizada para formulários.
  - Modal customizado de confirmação para exclusão segura de registros.
- **⚡ Deploy Automático:** Integrado à Vercel com CI/CD a cada merge na branch `main`.

---

## 🛠️ Tech Stack

- **Frontend:** [React.js](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + CSS Modularizado (`@apply`)
- **Backend / Banco de Dados:** [Firebase Firestore](https://firebase.google.com/) (NoSQL Realtime)
- **Hospedagem & Deploy:** [Vercel](https://vercel.com/)
- **Versionamento:** Git & GitHub (Workflows com Feature Branches e Pull Requests)

---

## 📁 Estrutura do Projeto

```text
assistencia-os-system/
├── public/
├── src/
│   ├── components/
│   │   └── Dashboard/
│   │       ├── Dashboard.jsx      # Componente principal do Painel
│   │       └── Dashboard.css      # Estilos customizados e utilitários isolados
│   ├── services/
│   │   └── firebase.js         # Configuração e inicialização do Firebase
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Configuração global do Tailwind CSS
├── .env.example                # Exemplo de variáveis de ambiente
├── tailwind.config.js
└── vite.config.js