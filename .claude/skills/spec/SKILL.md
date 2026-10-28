---
name: spec
description: Desenvolvimento guiado por spec. Escreve uma spec curta em specs/, espera aprovação e implementa seguindo ela. Use quando o usuário quiser criar ou mudar uma feature, ou pedir "spec", "escreve a spec", "implementa a spec".
---

A spec é a fonte da verdade: primeiro ela, depois o código.

## 1. Entender
Se a ideia ainda tiver dúvidas que mudam o resultado, use a skill `grill-me` antes.

## 2. Escrever a spec
Crie `specs/<nome-da-feature>.md` (ou atualize se já existir), curta e neste formato:

```markdown
# <Feature>

## Objetivo
Uma ou duas frases: o que é e por quê.

## Requisitos
- O que precisa funcionar, um item por linha.

## Fora do escopo
- O que não vamos fazer agora.

## Critérios de aceite
- [ ] Algo que dá para verificar (ex.: "clicar em X abre Y").

## Tarefas
- [ ] Passos pequenos de implementação, em ordem.
```

Mostre a spec e pergunte: "Aprova?" Não escreva código antes do sim.

## 3. Implementar
- Siga as tarefas em ordem e marque `[x]` na spec ao concluir cada uma.
- Faça só o que a spec pede. Se surgir algo novo ou a spec estiver errada, pare, atualize a spec e confirme com o usuário.

## 4. Verificar
Confira cada critério de aceite (rodando o projeto quando possível), marque os que passaram e diga claramente quais não deu para verificar.
