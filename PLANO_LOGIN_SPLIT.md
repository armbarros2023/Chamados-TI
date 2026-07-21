# Redesign da tela de login

## Decisão aprovada

Adotar a opção visual 1: tela dividida em aproximadamente 58/42 no desktop, inspirada no modelo fornecido pelo usuário, mantendo a identidade, os dados e as funcionalidades atuais do Chamados TI.

## Estrutura

- Painel institucional azul-violeta à esquerda, com logo Arbtech Info, saudação, mensagem sobre a central de atendimento e assinatura institucional.
- Área de autenticação à direita, com título, usuário, senha, opção "Lembrar de mim", ação principal "Entrar" e acesso ao cadastro de usuário.
- Cadastro realizado na mesma área direita, preservando todos os campos, requisitos de senha, mensagens e integração atuais.
- Tema claro/escuro mantido; o painel institucional conserva sua cor e a área do formulário acompanha o tema.
- Em telas menores, o painel institucional se torna um cabeçalho compacto e o formulário ocupa a largura disponível.

## Restrições

- Não adicionar login social nem recuperação de senha sem suporte real na API.
- Não alterar contratos de autenticação, cadastro ou armazenamento de sessão.
- Não carregar fontes, imagens ou scripts externos.
- Preservar acessibilidade WCAG 2.2 AA, navegação por teclado, foco visível e alvos de toque de pelo menos 44 px.
- Publicar primeiro somente no ambiente de staging; produção permanece inalterada até aprovação explícita.

## Validação

- Testes unitários da tela de login e cadastro.
- Teste E2E de login, responsividade e ausência de rolagem horizontal.
- `npm run verify`.
- Inspeção visual em larguras móvel e desktop.
- Lighthouse na URL servida.

## Registro de decisão

- Escolhida a composição dividida 58/42 por ser a alternativa mais próxima do modelo de referência sem criar recursos inexistentes.
- O azul-violeta será usado como superfície institucional comprometida; os controles continuarão coerentes com a identidade funcional do produto.
- O painel móvel será reduzido, e não removido, para preservar marca e contexto sem prejudicar a tarefa principal.
