---
name: perguntar-grill
description: Antes de começar qualquer pedido de tarefa do usuário, pergunta se ele quer rodar o grill-me primeiro. Use no início de todo pedido para criar, mudar ou corrigir algo.
---

Antes de fazer qualquer coisa no pedido, pergunte uma vez, com a ferramenta AskUserQuestion:

"Quer rodar o grill-me antes?"
- **Sim**: rode a skill `grill-me` sobre o pedido.
- **Não, pode fazer**: siga direto com o pedido.

Não pergunte quando:
- a mensagem for resposta a uma pergunta sua (do grill-me, da spec ou desta skill);
- o usuário já disser na mensagem se quer ou não o grill-me (ex.: "/grill-me", "sem grill");
- for só uma pergunta ou conversa, sem tarefa para executar.
