# Instalador de teste — macOS com Tauri 2

## Entendimento aprovado

- Criar primeiro um instalador interno para macOS (`.dmg`).
- Reaproveitar a aplicação React/Vite existente dentro do Tauri 2.
- Conectar automaticamente a `https://chamados-staging.arbtechinfo.com.br/api/v1`.
- Não embutir senha, token permanente, segredo da API ou credencial do PostgreSQL.
- Manter a mesma conta e as mesmas autorizações aplicadas pela API.
- Tratar o primeiro pacote como homologação sem assinatura/notarização Apple.
- Prosseguir depois para Android com Capacitor e Windows com Tauri.

## Premissas e limites

- Uso inicial interno, por poucos usuários, no Mac de homologação.
- Desempenho esperado equivalente à PWA, com assets carregados localmente.
- Operações de chamados continuam dependentes do staging HTTPS nesta primeira versão.
- O aplicativo não implementará ainda cache de chamados, fila offline ou atualização automática.
- Um pacote não assinado pode exigir confirmação manual do Gatekeeper e não deve ser distribuído publicamente.
- A manutenção permanece no mesmo projeto TypeScript; o código Rust será mínimo e restrito à integração segura com o sistema operacional.

## Abordagens consideradas

1. **Tauri com frontend local e API remota — escolhida.** Pacote menor, assets locais e base reutilizável para Windows.
2. **Tauri carregando o site remoto.** Mais simples, mas transforma o instalador em um navegador dedicado e depende da entrega web até para abrir a interface.
3. **Electron.** Ecossistema amplo, porém instalador e consumo de memória maiores sem benefício material para este piloto.

## Desenho final

O Vite gera `dist/`, que será incorporado ao bundle Tauri. Em produção desktop, `VITE_API_BASE_URL` aponta para a API v1 do staging. O aplicativo terá somente a janela principal e permissões explicitamente necessárias; shell, execução de comandos e acesso genérico ao sistema de arquivos permanecem desabilitados.

O frontend web atual renova sessão por cookie `HttpOnly`. O WebView empacotado usa um protocolo interno, no qual cookies seguros de outro domínio não são uma base confiável para sessão. Por isso, o cliente desktop usará um fluxo público nativo: login e rotação continuam no servidor, o access token permanece apenas em memória e o refresh token rotativo é guardado no Keychain do macOS. A API aceitará esse transporte somente sem origem web e com identificação explícita de cliente nativo; navegadores continuam usando exclusivamente o cookie `HttpOnly`.

O banco nunca será acessado diretamente. Todas as validações, perfis, autorização por recurso, rate limits e auditoria continuam na API. Falhas de conexão serão apresentadas pela interface existente sem gravar credenciais em logs.

## Estratégia de teste

- Testes unitários do contrato de sessão nativa, incluindo rotação, logout e rejeição de origem web.
- Testes do seletor de transporte web/desktop e ausência de persistência do access token.
- `npm run verify` para regressão completa.
- `cargo check` e build Tauri em modo release.
- Inspeção do bundle para confirmar ausência de segredos.
- Instalação do `.dmg`, abertura da aplicação e validação de login/API no staging.

## Registro de decisões

| Decisão | Alternativas | Motivo |
|---|---|---|
| macOS antes de Android e Windows | Android ou Windows primeiro | Ordem explicitamente aprovada pelo usuário e compatível com o computador atual. |
| Tauri 2 com frontend local | site remoto ou Electron | Reaproveita React, reduz tamanho e mantém uma base desktop comum. |
| Refresh token no Keychain | cookie entre origens ou armazenamento web | O protocolo interno do WebView não oferece garantia adequada para o cookie seguro da API; armazenamento web exporia o token a JavaScript comum. |
| Access token somente em memória | `localStorage` | Reduz persistência e impacto de extração local. |
| Pacote interno não assinado | assinatura Apple imediata | Permite homologação sem custo; assinatura/notarização fica obrigatória antes de distribuição externa. |
| Permissões mínimas | plugins genéricos de shell/arquivos | Reduz superfície de ataque do aplicativo instalado. |

## Riscos reconhecidos

- Gatekeeper poderá alertar sobre desenvolvedor não identificado.
- A indisponibilidade do staging impede operações online.
- O fluxo nativo aumenta o contrato da API e exige regressão de autenticação web.
- Windows deve ser compilado e testado em Windows; Android exigirá JDK, Android Studio/SDK e assinatura própria.
