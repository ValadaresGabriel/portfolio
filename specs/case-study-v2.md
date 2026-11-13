# Estudo de caso no formato novo

## Objetivo
Acompanhar o formato novo do PORTFOLIO.md gerado pela skill /game-portfolio: corpo curto, com três seções (Highlights, Decisions e Skills). A importação no /admin aceita o arquivo novo, e a página do jogo mostra só isso. O formato antigo deixa de existir no site.

## Requisitos

### Formato aceito
- **Highlights** (obrigatória): de 1 a 4 itens. Cada item é `### Título` seguido de quatro linhas, nesta ordem: `- **Goal:**`, `- **Process:**`, `- **Why:**` e `- **Result:**`.
- **Decisions** (opcional): de 1 a 4 linhas no formato `- **Decisão:** texto`.
- **Skills** (obrigatória): de 3 a 8 tags, uma por linha, no formato `- Tag`.
- As seções vêm nesta ordem: Highlights, Decisions, Skills.
- Os campos do frontmatter não mudam.

### Importação no /admin
- O arquivo novo é aceito.
- O arquivo é recusado, com uma mensagem clara, se:
  - faltar Highlights ou Skills;
  - houver uma seção que não está no formato, incluindo as antigas (Timeline, Architecture, Challenges, Code evolution);
  - as seções estiverem fora de ordem.
- A dica do campo Case study no CMS lista as três seções novas.

### Página do jogo
- O sumário e as seções ficam: Overview, Media, My role, Highlights, Decisions.
- **Highlights**: cada caso com título e os quatro rótulos (Goal, Process, Why, Result).
- **Decisions**: lista curta, com a decisão em negrito seguida do texto. O título da seção e o link do sumário passam a se chamar "Decisions".
- **Skills**: continuam como tags no topo da página, agora lidas do formato `- Tag`.
- Saem do código: Under the hood, Timeline, Challenges, Code evolution, Architecture e os rótulos antigos (Problem, Solution, What changed, Why, Cause).
- Uma seção escrita à mão no CMS, fora do formato, continua aparecendo depois de Decisions, com o próprio título e no sumário.
- **Cartão Programming**: com estudo de caso, volta a mostrar a lista de sistemas. Destaques e desafio técnico continuam escondidos, porque repetem os Highlights.
- O site continua gerando normalmente sem nenhum jogo cadastrado (o Action Adventurer foi apagado no CMS).

## Fora do escopo
- Arquivos da skill /game-portfolio.
- Reescrever o conteúdo de qualquer jogo: o Action Adventurer volta quando você o criar de novo no /admin e importar o arquivo.
- Mudanças na Home, na lista de jogos e no schema.

## Critérios de aceite
- [x] `npm run build` e `npm test` passam, com e sem jogo cadastrado.
- [x] O teste importa o PORTFOLIO.md novo da skill (fixture) sem erros.
- [x] Os testes recusam: sem Highlights, sem Skills, uma seção antiga, seções fora de ordem e um Highlight sem um dos quatro rótulos.
- [x] Um arquivo sem a seção Decisions é aceito.
- [x] Com um jogo de teste local usando o arquivo novo (não publicado), a página mostra Highlights com os quatro rótulos, Decisions e as tags de Skills, e o sumário lista só as seções existentes.
- [x] O cartão Programming mostra os sistemas e esconde destaques e desafio técnico.
- [x] Nenhuma rolagem horizontal em 360px.

## Tarefas
- [x] 1. Atualizar as seções e as regras na importação (`portfolio-import.js`) e a dica no `config.yml`.
- [x] 2. Trocar a fixture e os testes pelo formato novo.
- [x] 3. Atualizar o leitor do estudo de caso (`case-study.ts`) e os textos em `en.ts`.
- [x] 4. Atualizar a página do jogo, o componente do estudo de caso e o cartão Programming.
- [x] 5. Atualizar `specs/portfolio-import.md` e `specs/game-page-ia.md` para o formato novo.
- [x] 6. Verificar no navegador com um jogo de teste local, no desktop e em 360px, e apagar o jogo de teste.
