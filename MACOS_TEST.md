# Instalador macOS de teste — Chamados TI 0.1.0

## Artefato

- Arquivo: `artifacts/macos/Chamados-TI-0.1.0-arm64.dmg`
- Plataforma: macOS em Apple Silicon (`arm64`).
- SHA-256: `50ec6fe5211996280295bd61c6c44a7753fc3630c6fb1a52da9e042bac7844a3`.
- API incorporada: `https://chamados-staging.arbtechinfo.com.br/api/v1`.

## Instalação para homologação

1. Abrir o arquivo DMG.
2. Arrastar **Chamados TI** para **Aplicativos**.
3. Na primeira abertura, confirmar o aplicativo nas opções de Privacidade e Segurança do macOS caso o Gatekeeper solicite.
4. Entrar com uma conta de staging e validar consulta, abertura e resposta de chamado.

O pacote possui assinatura ad-hoc completa para teste em Apple Silicon, mas não possui certificado Developer ID nem notarização Apple. Não distribuir publicamente esta versão.

## Segurança implementada

- Frontend React/Vite incorporado localmente ao aplicativo.
- Comunicação somente com a API HTTPS autorizada nas capabilities do Tauri.
- Access token mantido apenas em memória.
- Refresh token rotativo guardado no Keychain do macOS.
- Sem plugin de shell ou acesso genérico ao sistema de arquivos.
- CSP do WebView restrita e service worker desativado dentro do aplicativo.
- Nenhuma credencial do banco, JWT secret ou chave privada encontrada no bundle.

## Verificações realizadas

- `npm run verify`: lint, 13 testes frontend, 36 testes backend, 2 testes operacionais e builds aprovados.
- Teste Rust do formato do refresh token: aprovado.
- API de staging: health, readiness e contrato nativo HTTP 200; CORS externo HTTP 403.
- `hdiutil verify`: checksum interno do DMG válido.
- `codesign --verify --deep --strict`: aplicativo válido e recursos selados.
- DMG montado em modo somente leitura e aplicativo interno validado.
- Aplicativo aberto localmente e processo nativo permaneceu ativo.

## Limitações do piloto

- A inspeção visual automatizada da janela não foi concluída porque o macOS não concedeu ao Codex permissões de Acessibilidade/Gravação de Tela.
- O login completo deve ser confirmado manualmente com uma conta de staging; nenhuma senha foi incluída ou armazenada.
- O pacote atual não é compatível com Macs Intel.
- Operação offline, atualização automática, Developer ID e notarização ficam para uma versão posterior.
