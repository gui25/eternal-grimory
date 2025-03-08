# Grimório Eterno

![Grimório Eterno](./public/preview.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com)

**Grimório Eterno** é uma aplicação web moderna para gerenciamento de campanhas de RPG, construída com Next.js 13, TypeScript e Tailwind CSS.

[Demo](https://grimorio-eterno.vercel.app) · [Reportar Bug](https://github.com/seu-usuario/eternal-grimory/issues) · [Solicitar Feature](https://github.com/seu-usuario/eternal-grimory/issues)

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
  - [Tecnologias](#-tecnologias)
  - [Recursos](#-recursos)
- [Começando](#-começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
- [Uso](#-uso)
  - [Estrutura de Arquivos](#estrutura-de-arquivos)
  - [Criando Conteúdo](#criando-conteúdo)
- [Customização](#-customização)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

## 🎯 Sobre o Projeto

Grimório Eterno é uma aplicação web moderna para mestres e jogadores de RPG gerenciarem suas campanhas. Com uma interface temática e responsiva, o projeto oferece uma experiência única para organizar itens, personagens, NPCs, monstros e relatórios de sessão.

### 🛠 Tecnologias

- [Next.js 13](https://nextjs.org/)
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [MDX](https://mdxjs.com/)

### ✨ Recursos

- **Design Responsivo e Temático**
  - Interface inspirada em fantasia medieval
  - Animações e efeitos visuais imersivos
  - Layout adaptativo para todos os dispositivos

- **Gerenciamento de Campanhas**
  - Suporte a múltiplas campanhas
  - Sistema de troca rápida entre campanhas
  - Organização hierárquica de conteúdo

- **Categorias de Conteúdo**
  - 🗡️ **Itens**: Sistema de raridade com efeitos visuais
  - 👥 **Personagens**: Fichas detalhadas e organizadas
  - 🎭 **NPCs**: Gerenciamento de personagens não-jogáveis
  - 👾 **Monstros**: Catálogo de criaturas e desafios
  - 📜 **Sessões**: Relatórios e acompanhamento

- **Funcionalidades Avançadas**
  - Sistema de busca e filtros
  - Atividade recente por campanha
  - Suporte a Markdown/MDX

## 🚀 Começando

### Pré-requisitos

- Node.js 18.0.0 ou superior
- npm ou yarn
- Git

### Instalação

1. Clone o repositório

   ```sh
   git clone https://github.com/seu-usuario/eternal-grimory.git
   ```

2. Instale as dependências

   ```sh
   cd eternal-grimory
   npm install
   ```

3. Inicie o servidor de desenvolvimento

   ```sh
   npm run dev
   ```

## 📖 Uso

### Estrutura de Arquivos

```readme
eternal-grimory/
├── app/                  # App Router e páginas
├── components/           # Componentes React
├── content/             # Conteúdo das campanhas
│   ├── penumbra-eterna/ # Campanha de exemplo completa
│   └── sessao-teste/    # Campanha para testes
├── lib/                 # Utilitários e configurações
├── public/             # Arquivos estáticos
└── styles/            # Estilos globais
```

### Criando Conteúdo

#### Itens

```markdown
---
name: Espada do Destino
type: Weapon
rarity: Legendary
tags: [sword, magic, destiny]
image: /items/espada-destino.jpg
---

Uma lâmina lendária forjada nos confins do tempo...
```

#### Personagens

```markdown
---
name: Thorin Stormforge
player: João Silva
class: Warrior
race: Dwarf
level: 5
tags: [melee, tank]
image: /characters/thorin.jpg
---

Um valente guerreiro anão...
```

#### Sessões

```markdown
---
session_number: 1
date: "2024-03-08"
players: ["João", "Maria", "Pedro"]
title: "O Início da Jornada"
---

Na primeira sessão, nossos heróis...
```

## 🎨 Customização

### Temas

O projeto utiliza um sistema de temas baseado em CSS Variables e Tailwind CSS. Principais arquivos para customização:

- `app/globals.css`: Variáveis CSS e estilos base
- `tailwind.config.js`: Configuração do Tailwind
- `lib/theme.ts`: Configurações de tema

### Componentes

Todos os componentes são construídos com Tailwind CSS e são facilmente customizáveis. Exemplos:

- `components/ui/`: Componentes base
- `components/layouts/`: Layouts reutilizáveis
- `components/icons/`: Ícones e assets

## 📋 Roadmap

- [x] Sistema de múltiplas campanhas
- [x] Gerenciamento de itens com raridade
- [x] Sistema de busca e filtros
- [ ] Internacionalização (pt-BR/en)
- [ ] Modo offline

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE.md` para mais informações.

## 📧 Contato

Guilherme Bernardo - [Linkedln](https://www.linkedin.com/in/guilhermebernardosilva/)

---

### ⚔️ Feito com paixão por mestres, para mestres ⚔️

[⬆ Voltar ao topo](#grimório-eterno)
