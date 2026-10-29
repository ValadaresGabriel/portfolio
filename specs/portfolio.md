# Portfolio de Game Dev

## Objetivo
Site pessoal de portfólio para game dev que mostra, jogo por jogo, o trabalho em Game Production, Narrative Design e Gameplay Programming. O conteúdo é editado por um painel de CRUD, sem backend, e o único custo é o domínio.

## Requisitos

### Infra
- Site estático em Astro, publicado como Worker de arquivos estáticos na Cloudflare (Workers Builds, configurado em `wrangler.jsonc`) a partir de um repositório no GitHub.
- Cada push na branch principal publica o site automaticamente.
- Painel `/admin` com Sveltia CMS, usando o GitHub como backend. Cada alteração vira um commit no repositório.
- Login no painel com um token de acesso do GitHub (fine-grained, só neste repositório, permissão Contents: read and write), guardado no navegador. Só quem tem o token consegue editar. Sem OAuth app nem worker extra.
- Imagens e PDF ficam no próprio repositório (`public/uploads`).
- Domínio próprio apontando para o Worker.

### Geral
- Textos da interface em inglês, com strings centralizadas para permitir português no futuro.
- Tema escuro, limpo e com cara de games.
- Funciona bem no celular (a partir de 360px de largura).
- Título, descrição e imagem de compartilhamento (Open Graph) em cada página.

### Perfil (um arquivo só, editável no painel)
- Identidade: nome*, título curto*, foto, cidade/país.
- Sobre: bio curta*, About longo (markdown).
- Disponibilidade: open to work (sim/não), tipo de vaga procurada.
- Por área (Production, Narrative, Programming): resumo curto e lista de ferramentas.
- Contato: e-mail*, lista de links (rótulo + URL).
- CV: arquivo PDF.

### Jogo (um arquivo por jogo, CRUD no painel)
- Gerais: título*, capa*, pitch de uma linha*, descrição curta, tipo (estúdio / pessoal / game jam / acadêmico), status (lançado / em desenvolvimento / protótipo), período (ano ou intervalo), cargo*, tamanho do time, gênero, plataformas, engine.
- Links: jogar/loja, trailer (YouTube), repositório.
- Galeria de imagens.
- Destaque na Home (sim/não) e ordem de exibição (número).
- Áreas, todas opcionais. Uma área sem preenchimento não aparece no site.
  - Base comum a todas: contribuição (resumo), responsabilidades (lista), destaques/resultados (lista), ferramentas (lista), evidências (lista de imagem ou link, com legenda).
  - Production, além da base: metodologia, tamanho do time coordenado, documentos (lista de links).
  - Narrative, além da base: estrutura narrativa, trecho de roteiro (texto), link do roteiro.
  - Programming, além da base: sistemas implementados (lista), linguagens, desafio técnico e solução (texto), trecho de código (com linguagem).

### Páginas
- **Home (`/`)**: nome, título, foto, bio curta, selo "open to work" quando ativo, About, um cartão por área (resumo e ferramentas), jogos em destaque, contato e links, botão de download do CV.
- **Jogos (`/games`)**: grade de cards (capa, título, pitch, cargo, selos das áreas presentes) em ordem de exibição, com filtro por área (All / Production / Narrative / Programming).
- **Página do jogo (`/games/<slug>`)**: cabeçalho com capa e dados gerais, links, uma seção por área preenchida, galeria.
- **Admin (`/admin`)**: Sveltia CMS com os formulários do perfil e dos jogos, com os mesmos campos e as mesmas regras de obrigatoriedade do site.

## Fora do escopo
- Blog, versão em português, analytics, formulário de contato (o contato é só por e-mail e links), comentários, mais de um editor, banco de dados ou backend próprio.

## Critérios de aceite
- [x] `npm run build` termina sem erros com o conteúdo de exemplo.
- [x] O build falha com mensagem clara quando falta um campo obrigatório.
- [x] A Home mostra o perfil, os três cartões de área, os jogos em destaque e o link do CV.
- [x] Em `/games`, o filtro de cada área mostra só os jogos que têm aquela área.
- [x] Na página do jogo, só aparecem as seções das áreas preenchidas.
- [x] Nenhuma página tem rolagem horizontal em 360px de largura.
- [x] Criar, editar e excluir um jogo no `/admin` gera commits no GitHub, e o site publicado reflete a mudança.
- [x] O site abre no domínio próprio com HTTPS.

## Tarefas
- [x] 1. Criar o projeto Astro, iniciar o git e adicionar o `.gitignore`.
- [x] 2. Definir os schemas das collections `profile` e `games`, com validação dos obrigatórios.
- [x] 3. Criar o conteúdo de exemplo: um perfil e dois jogos fictícios, marcados como exemplo.
- [x] 4. Fazer o layout base: tema escuro, navegação, rodapé, SEO e strings centralizadas.
- [x] 5. Fazer a Home.
- [x] 6. Fazer a página Jogos com o filtro por área.
- [x] 7. Fazer a página do jogo.
- [x] 8. Configurar o Sveltia CMS em `/admin`, espelhando os schemas.
- [x] 9. Verificar localmente: build, páginas, filtro e celular.
- [x] 10. Criar o repositório no GitHub e ligar ao Cloudflare Workers (com você).
- [x] 11. Criar o token de acesso do GitHub, entrar no `/admin` e testar o CRUD (com você).
- [x] 12. Configurar o domínio (gabrielvaladares.com e www, no Worker).
