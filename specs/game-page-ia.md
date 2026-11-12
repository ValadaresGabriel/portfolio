# Arquitetura da página do jogo

## Objetivo
Reorganizar a página do jogo para que um recrutador veja de relance o que ela contém e pule direto para o que interessa: um sumário clicável e as seções em ordem do mais rápido de ver para o mais detalhado.

## Requisitos

### Sumário
- Uma barra "On this page" logo abaixo do cabeçalho do jogo, com um link para cada seção da página.
- Só entram no sumário as seções que o jogo tem.
- Ao rolar, a barra fica presa no topo, abaixo do menu do site, e destaca a seção atual.
- No celular, os links rolam para o lado dentro da barra, sem criar rolagem horizontal na página.
- Clicar num link leva ao início da seção, sem o título ficar escondido atrás da barra.

### Ordem das seções
1. **Overview**: capa, selos das áreas, título, pitch, descrição, tags de skills, links, dados do jogo e time.
2. **Media**: trailer e prints (a galeria).
3. **My role**: um cartão por área preenchida.
4. **Highlights**: os casos com Problem, Solution e Result.
5. **Decisions & challenges**: as seções Decisions e Challenges do estudo de caso.
6. **Under the hood**: Architecture e Code evolution.
7. **Timeline**.
- Uma seção sem conteúdo não aparece, nem na página nem no sumário.
- Seções do estudo de caso fora do formato da skill (editadas à mão) aparecem depois da Timeline, com o próprio título, e também entram no sumário.
- A página continua em coluna única.

### Conteúdo repetido
- Quando o jogo tem estudo de caso, o cartão da área Programming mostra só contribuição, responsabilidades, linguagens, ferramentas e evidências. Destaques, sistemas e desafio técnico não aparecem.
- Sem estudo de caso, o cartão continua completo.
- Nenhum campo sai do CMS nem da importação.

## Fora do escopo
- Mudanças na Home, na lista de jogos, no CMS, no schema ou no formato da skill.
- Menu lateral ou segunda coluna.

## Critérios de aceite
- [x] `npm run build` e `npm test` passam.
- [x] Na página do Action Adventurer, o sumário lista só as seções existentes, na ordem acima.
- [x] Clicar em cada link do sumário leva à seção certa, com o título visível.
- [x] Ao rolar, a barra fica presa no topo e o link da seção atual fica destacado.
- [x] O cartão Programming não mostra destaques, sistemas nem desafio técnico quando há estudo de caso.
- [x] Nenhuma rolagem horizontal na página em 360px de largura.

## Tarefas
- [x] 1. Reagrupar o estudo de caso em Highlights, Decisions & challenges, Under the hood, Timeline e extras.
- [x] 2. Reordenar a página do jogo e mover trailer e galeria para Media.
- [x] 3. Esconder o conteúdo repetido no cartão da área quando há estudo de caso.
- [x] 4. Criar a barra de sumário, presa no topo e com destaque da seção atual.
- [x] 5. Verificar no navegador, no desktop e em 360px.
