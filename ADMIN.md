# Sistema de Administração Local

Este projeto inclui um sistema de administração que permite criar e editar conteúdo através de uma interface web, mas que **só funciona em ambiente de desenvolvimento local**.

## 🔒 Segurança

- **Produção**: As rotas `/admin` e `/api/admin` são automaticamente bloqueadas em produção
- **Desenvolvimento**: Só funciona quando `NODE_ENV=development` e `hostname=localhost`
- **Arquivos**: Todas as alterações ficam apenas nos arquivos locais do seu computador

## 🚀 Como Usar

### 1. Acesso ao Painel

Em desenvolvimento local, você verá:
- **Página inicial**: Seção "Modo Desenvolvimento" com link para o painel
- **Páginas de listagem**: Botões "Criar [Tipo]" no topo
- **Botões flutuantes**: Ícone "+" no canto inferior direito
- **URL direta**: `http://localhost:3000/admin`

### 2. Criação de Conteúdo

O sistema permite criar:
- **Monstros**: `/admin/create/monster`
- **NPCs**: `/admin/create/npc`
- **Itens**: `/admin/create/item`
- **Sessões**: `/admin/create/session`

### 3. Fluxo de Trabalho

1. **Criar**: Use a interface web para criar novos arquivos
2. **Editar**: Os arquivos são salvos em Markdown, você pode editá-los diretamente
3. **Testar**: Visualize as mudanças localmente
4. **Commit**: Use Git para versionar as mudanças
5. **Deploy**: Faça push para produção quando estiver satisfeito

## 📁 Estrutura de Arquivos

Os arquivos são criados na campanha atualmente ativa:

```
content/
├── [campanha]/
│   ├── characters/
│   │   ├── monster/
│   │   │   └── [slug].md
│   │   ├── npc/
│   │   │   └── [slug].md
│   │   └── player/
│   │       └── [slug].md
│   ├── items/
│   │   └── [slug].md
│   └── sessions/
│       └── [slug].md
```

## 🛠️ Funcionalidades

### Geração Automática de Slug
- O slug é gerado automaticamente baseado no nome
- Remove acentos e caracteres especiais
- Converte para lowercase com hífens

### Frontmatter Automático
Cada tipo de conteúdo tem seu frontmatter específico:

**Monstros:**
```yaml
---
name: "Nome do Monstro"
slug: "nome-do-monstro"
type: "Tipo"
challenge: "1"
tags: ["tag1", "tag2"]
image: "url-da-imagem"
---
```

**NPCs:**
```yaml
---
name: "Nome do NPC"
slug: "nome-do-npc"
type: "Tipo"
affiliation: "Afiliação"
tags: ["tag1", "tag2"]
image: "url-da-imagem"
---
```

**Itens:**
```yaml
---
name: "Nome do Item"
slug: "nome-do-item"
type: "Tipo"
rarity: "Raridade"
tags: ["tag1", "tag2"]
image: "url-da-imagem"
---
```

**Sessões:**
```yaml
---
title: "Título da Sessão"
slug: "titulo-da-sessao"
date: "2024-01-01"
session: 1
tags: ["tag1", "tag2"]
image: "url-da-imagem"
---
```

## 🔧 Implementação Técnica

### Componentes Principais

- `AdminButton`: Botão que só aparece em desenvolvimento
- `AdminFloatingButton`: Botão flutuante para criação rápida
- `AdminSection`: Seção destacada para funcionalidades de admin

### APIs

- `POST /api/admin/create`: Cria novos arquivos de conteúdo
- Validação de ambiente de desenvolvimento
- Criação automática de diretórios
- Verificação de arquivos duplicados

### Middleware

- Bloqueia rotas `/admin` em produção
- Redireciona para página inicial se não estiver em desenvolvimento

## 🎯 Casos de Uso

### Para o Mestre (DM)
- Criar rapidamente novos NPCs durante a sessão
- Documentar itens encontrados pelos jogadores
- Registrar eventos importantes da sessão
- Adicionar monstros personalizados

### Para Desenvolvimento
- Testar novos conteúdos localmente
- Iterar rapidamente no design de personagens
- Manter histórico de mudanças com Git
- Colaborar com outros mestres

## ⚠️ Limitações

- **Apenas desenvolvimento**: Não funciona em produção
- **Arquivos locais**: Mudanças ficam apenas no seu computador
- **Sem edição**: Não permite editar arquivos existentes (apenas criar)
- **Sem upload**: Não faz upload de imagens (apenas URLs)

## 🔄 Workflow Recomendado

1. **Desenvolvimento Local**:
   ```bash
   npm run dev
   # Acesse http://localhost:3000/admin
   ```

2. **Criar Conteúdo**:
   - Use a interface web para criar arquivos
   - Teste localmente para verificar se está correto

3. **Versionamento**:
   ```bash
   git add content/
   git commit -m "feat: adicionar novo monstro X"
   ```

4. **Deploy**:
   ```bash
   git push origin main
   # O conteúdo aparecerá em produção
   ```

## 🐛 Troubleshooting

### Botões não aparecem
- Verifique se está em `localhost`
- Confirme que `NODE_ENV=development`
- Recarregue a página

### Erro ao criar arquivo
- Verifique se o slug não está duplicado
- Confirme que todos os campos obrigatórios estão preenchidos
- Verifique as permissões de escrita no diretório

### Arquivo não aparece no site
- Confirme que o arquivo foi criado corretamente
- Verifique o frontmatter YAML
- Recarregue a página ou reinicie o servidor

## 📝 Contribuindo

Para adicionar novos tipos de conteúdo:

1. Adicione o tipo em `/api/admin/create/route.ts`
2. Crie uma nova página em `/admin/create/[tipo]/page.tsx`
3. Adicione o botão nas páginas de listagem correspondentes
4. Atualize esta documentação 