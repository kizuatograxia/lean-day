# Contexto Operacional
Você deve refatorar a página `src/pages/RaffleDetails.tsx` (que exibe os detalhes de um sorteio/rifa) para que ela imite de forma idêntica o layout, tipografia e UX de uma página de produto do **Mercado Livre (versão desktop e mobile)**.

A aplicação utiliza **React, Tailwind CSS, Lucide React e shadcn/ui**, e possui uma **arquitetura robusta de Dark/Light mode**. Todo o design deve ser feito estritamente com classes do Tailwind respeitando o esquema de cores dinâmico do projeto (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, etc).

# Requisitos de Estilo (Design System ML adaptado ao Tema do Site)
1. **Background da Página**: O background ao redor do card principal deve ser `bg-secondary/30` ou o próprio `bg-background` padrão, dando a sensação de "fundo" em relação ao item.
2. **Container Principal**: O conteúdo do produto deve ficar contido em um container principal branco no light mode e cinza-escuro no dark mode, usando `bg-card rounded-md shadow-sm border border-border`. A largura máxima deve ser similar ao contêiner de produto do ML (ex: `max-w-[1184px] mx-auto`).
3. **Tipografia (Dinâmica)**:
   - Texto principal/títulos: `text-foreground font-semibold`
   - Preços grandes: `text-foreground font-light tracking-tight`
   - Texto secundário (Novo | X vendidos): `text-muted-foreground text-[14px]`
   - Destaques (Frete Grátis/Garantido): No ML é verde forte. Mantenha algo adaptado para o modo dark se o verde estourar, ex: `text-green-600 dark:text-green-500 font-semibold`.
   - Links/Azulão do ML: Utilize `text-blue-600 dark:text-blue-400`.

# Estrutura do Layout (Acima da Dobra)
A seção principal deve usar um grid responsivo que, no desktop, divide-se em duas colunas principais (Galeria à esquerda e Buy Box à direita).

## Coluna Esquerda (Galeria de Imagens com Scroll por Etapas - ~65% da largura)
- **Grid de Imagens Vertical**: Reproduza a galeria lateral exata do ML.
  - À extrema esquerda, uma fileira vertical para as miniaturas (altura fixa com `overflow-y-hidden` ou `scroll-smooth snap-y`).
  - *NOVO REQUISITO:* **Scroll por Etapas**. Deve haver botões de controle direcional (seta para cima e seta para baixo) quando as imagens passarem da altura visual. Ao clicar nas setinhas, o scroll deve descer/subir exatamente a altura das miniaturas mostradas (scroll tracking/snap), exatamente como o carrossel vertical na página do Mercado Livre.
  - Exemplo: As miniaturas têm `w-11 h-11 border border-border rounded-[4px] hover:border-primary cursor-pointer mb-2`. A miniatura ativa ganha borda espessa do Tailwind (`ring-2 ring-primary`).
  - Ao centro-direita dessa coluna, um visualizador de imagem grande e com fundo `bg-card`, alinhado ao topo (`aspect-square object-contain`). Funcionalidade de hover para zoom-in ou clique para abrir modal overlay.

## Coluna Direita (Buy Box e Ações - ~35% da largura, com divider vertical no desktop)
A Buy Box deve ter os seguintes blocos descendo em coluna na exata ordem do ML, separados por margins adequadas e divisórias (`border-t border-border` onde aplicável no ML):
1. **Condição e Vendas**: Em cima do título, um texto pequeno, ex: `Sorteio Ativo  |  +${raffle.participantes} vendidos`.
2. **Título do Produto**: Nome da rifa (`text-[22px] font-semibold text-foreground leading-tight mt-2 mb-2`).
3. **Avaliação (Estrelinhas)**: (Mock) 4.8 estrelas amarelas (ex: `<Star fill="currentColor" className="text-yellow-400" />`) e "(XX)".
4. **Preço (Custo)**: 
   - Apenas `R$ {raffle.custoNFT}` em `text-[36px] font-light text-foreground`.
   - Abaixo, destacado: "em 10x R$ {valor/10} sem juros" em verde (`text-green-600 dark:text-green-500`).
5. **Frete / Entrega**: 
   - Ícone verde de caminhão (`Truck`).
   - Texto: `Sorteio Digital Garantido` e embaixo `Entrega imediata na carteira` ambos na cor verde de destaque.
6. **Informações do Vendedor**:
   - `Vendido por FastShop` (link em `text-blue-600 dark:text-blue-400`).
   - "Distribuidor Autorizado | Mais de 10 mil sorteios entregues".
7. **Seleção de Variantes (NFTs / Ingressos)**:
   - Este bloco mapeará a seleção dos diferentes NFTs que o usuário possui.
   - Botões estilo variantes ML: `border border-border rounded-md hover:border-primary p-2 flex gap-2 items-center cursor-pointer bg-transparent`.
8. **Informações Técnicas Básicas do Produto (Mini-UI)**:
   - *NOVO REQUISITO*: Exiba imediatamente acima ou abaixo do botão de compra as principais tabelas técnicas compactas que tem no ML.
   - Exemplo: 
     - **Prêmio Total:** R$ {raffle.premioValor}
     - **Oportunidade Atual:** {currentChance}%
     - **Data de Encerramento:** {dataFim formatada}
   - Apresente isso numa UI de lista estrita (como no ML "O que você precisa saber sobre este produto", com bullet points ex: `• prêmio de luxo`, `• sorteio auditado pela blockchain`).
9. **Estoque / Quantidade**: `<select>` nativo ou dropdown do shadcn com texto `Quantidade: 1 unidade (X disponíveis)`.
10. **Ações Principais** (Crucial - manter as funções nativas de participar ligadas a estes botões):
   - **Participar Agora (Comprar)**: `bg-blue-600 hover:bg-blue-700 text-white w-full py-4 rounded-[6px] font-semibold text-[16px] transition-colors mb-2`.
   - **Acompanhar ao Vivo (Carrinho)**: Para bater com o ML, um azul bem claro de fundo com texto azul forte. Ajustado ao dark mode: `bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 w-full py-4 rounded-[6px] font-semibold text-[16px] transition-colors`.
11. **Segurança (Compra Garantida)**:
    - Ícone de escudo (ShieldCheck).
    - `Compra Garantida, receba o bilhete que está esperando ou devolvemos suas NFTs.` em texto de apoio `text-muted-foreground text-sm`.

# Abaixo da Dobra (Informações da Rifa / Descrição)
1. Deve ser separada do Buy Box por uma linha larga (ou simplesmente continuação do card branco).
2. **Características Principais**: Uma tabela estrita de Ficha Técnica, exatamente como o ML apresenta tabelas listradas:
   - Coluna de label com background `bg-secondary/50`, texto em `font-semibold`.
   - Coluna de valor com background `bg-card`.
   - Incluir dados do sorteio.
3. Seção **Descrição do anúncio**: Fonte de corpo `text-[20px] text-muted-foreground font-light mt-6`.
4. Área de Perguntas / Atividade: Re-utilize a seção de Activity Feed (`isLiveViewActive`), mas com título "Atividade Recente" ou algo do tipo "Perguntas e respostas", estilizado na mesma estrutura limpa do resto.

# O que manter obrigatoriamente
- O sistema de tema Dark/Light Mode. Não "chumbe" branco absoluto se não houver lógica dark correspondente, use os tokens CSS variables do shadcn.
- Todo o estado do React/integrações da API intactos (funcionalidades conectadas com `executeParticipation` e Web3 Modal de wallet não podem quebrar).
