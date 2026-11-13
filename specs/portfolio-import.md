# Importação de PORTFOLIO.md

> O formato do corpo mudou: veja [case-study-v2.md](case-study-v2.md). Highlights, Decisions (opcional) e Skills substituem as sete seções descritas abaixo.

## Objetivo
Importar no `/admin` o `PORTFOLIO.md` gerado pela skill `/game-portfolio` para um jogo que já existe no site. A importação preenche a área Programming, os créditos e o estudo de caso, e a página do jogo passa a mostrar os créditos e o estudo de caso.

## Requisitos

### Formato
- O formato é o da skill (`~/.claude/skills/game-portfolio/templates/PORTFOLIO.md`). O site se adapta a ele e não altera os arquivos da skill.

### Armazenamento
- Os arquivos dos jogos passam de `.yml` para `.md`: os campos ficam no frontmatter e o estudo de caso no corpo. Os dois jogos de exemplo são convertidos.
- Campo novo `credits` no schema: lista de `{ name*, role }`.
- No CMS, a coleção de jogos usa `format: frontmatter` e ganha os campos "Credits" (lista) e "Case study" (markdown, o corpo). Os dois podem ser editados à mão.

### Importação no `/admin`
- No topo do formulário do jogo, um campo "Import PORTFOLIO.md" para escolher o arquivo ou colar o texto.
- Ao receber o texto, o campo mostra um resumo: o que vai ser substituído, o que vai ser preenchido e um aviso se o título do .md for diferente do título do jogo.
- Um arquivo fora do formato é recusado com mensagem de erro. Isso inclui YAML inválido, um campo obrigatório ou uma seção faltando, seções fora de ordem e `type`, `status` ou `codeLanguage` fora dos enums do site. O Save fica bloqueado enquanto o erro existir.
- Ao salvar, os dados entram nos campos e o campo de importação fica vazio. Tudo vira um commit só.
- **Substitui:** a área Programming (menos `evidence`), `credits` e o corpo (estudo de caso).
- **Preenche só se estiver vazio:** `pitch`, `description`, `type`, `status`, `period`, `role`, `teamSize`, `genre`, `platforms` e `engine`.
- **Nunca altera:** `title`, `cover`, `gallery`, `links`, `featured`, `order`, `production`, `narrative` e `programming.evidence`.

### Página do jogo
- Um bloco "Team" logo abaixo dos dados do jogo, com um item `nome · função` por colega. Sem créditos, o bloco não aparece.
- Uma seção "Case study" depois das áreas e antes da galeria, quando o corpo tiver conteúdo:
  - leitura única em coluna única, com tudo aberto na página e em bullet points;
  - os Highlights primeiro, depois a Timeline, Architecture, Decisions, Challenges e Code evolution, com os rótulos (Problem, What changed, Why, Cause, Solution, Result) destacados;
  - as Skills não aparecem no estudo de caso: os nomes viram tags no bloco do topo, abaixo da descrição.
- A página do jogo é em coluna única (capa, depois o texto), e a área Programming não mostra o Code sample. O campo continua no CMS e na importação, só não é exibido.
- Uma seção que não segue o formato (por ter sido editada à mão) aparece como markdown comum, sem quebrar o build.
- Os textos novos da interface ficam em `src/i18n/en.ts`.

## Fora do escopo
- Criar um jogo novo a partir do .md, ou seja, importar sem o jogo já existir no CMS.
- Importar as áreas Production e Narrative.
- Importar por script npm ou fora do `/admin`.
- Mudanças no formato ou nos arquivos da skill.

## Critérios de aceite
- [x] `npm run build` termina sem erros com os jogos de exemplo convertidos para `.md`.
- [x] O parser aceita o PORTFOLIO.md do RPG e recusa, com mensagem clara, cópias quebradas: sem uma seção, com `status` inválido e com YAML inválido.
- [x] No `/admin`, importar o PORTFOLIO.md do RPG num jogo criado no CMS e salvar gera um commit em que Programming, `credits` e o corpo estão preenchidos, e capa, galeria, links e as demais áreas ficam iguais.
- [x] Reimportar o mesmo arquivo depois de editar `pitch` no CMS mantém o `pitch` editado.
- [x] A página do RPG mostra os dados do jogo, a área Programming com o code snippet, o bloco Team com os 3 colegas e o estudo de caso, com Highlights em cartões, a Timeline aberta e as outras seções recolhidas.
- [x] Um jogo sem créditos e sem corpo não mostra o bloco Team nem a seção Case study.
- [x] Nenhuma página tem rolagem horizontal em 360px de largura.

## Tarefas
- [x] 1. Trazer do GitHub os commits feitos pelo CMS (`git pull`).
- [x] 2. Converter os jogos para `.md`: loader, schema com `credits` e config do CMS (frontmatter, Credits, Case study).
- [x] 3. Escrever o parser e o merge do PORTFOLIO.md como módulo JS puro em `public/admin/`, com um teste em Node usando o exemplo do RPG e as cópias quebradas.
- [x] 4. Registrar no Sveltia CMS o campo de importação (arquivo ou texto colado, resumo, validação) e o gancho `preSave` que aplica o merge.
- [x] 5. Exibir o bloco Team na página do jogo.
- [x] 6. Exibir a seção Case study (Highlights, Timeline, seções recolhidas e markdown comum como reserva).
- [x] 7. Verificar localmente: build e a página do RPG gerada pelo merge, no desktop e em 360px.
- [x] 8. Testar a importação no `/admin` publicado e conferir o commit e a página (com você).
