# Instalador Windows de teste — Chamados TI 0.1.0

## Artefato

- Arquivo: `artifacts/windows/Chamados-TI-0.1.0-x64-setup.exe`
- Formato: instalador NSIS para Windows x64.
- Aplicativo: Tauri 2 com frontend React incorporado.
- API configurada: `https://chamados-staging.arbtechinfo.com.br/api/v1`.
- SHA-256: `a0068db2111e94dedcdf9fc6275da4687137a4f48f971d92497ef9b5103dd299`.

## Instalação para homologação

1. Copiar o `.exe` para um computador Windows 10 ou 11 de 64 bits.
2. Conferir o SHA-256 antes de executar.
3. Abrir o instalador. O Windows SmartScreen poderá alertar que o editor é desconhecido porque este build de teste não possui certificado Authenticode.
4. Instalar, abrir `Chamados TI` e validar login, criação, consulta e resposta de chamados no staging.
5. Validar também logout, renovação de sessão e desinstalação.

## Segurança implementada

- Comunicação somente com a API HTTPS autorizada.
- Access token mantido somente em memória.
- Refresh token armazenado pelo `keyring` no Windows Credential Manager.
- CSP e permissões Tauri restritas.
- O aplicativo não acessa o PostgreSQL diretamente.
- Inspeção dos binários não encontrou variáveis de segredo ou credenciais persistidas.

## Evidência de build

- Alvo Rust: `x86_64-pc-windows-msvc`.
- Formato da aplicação: COFF x86-64, subsistema Windows GUI.
- Proteções do executável: ASLR, high-entropy VA e DEP/NX habilitados.
- NSIS 3.12 validou e produziu o instalador de 3,4 MB.
- Health e readiness da API de staging: HTTP 200 em 2026-07-07.

## Limite deste artefato

A compilação cruzada do Windows no macOS é marcada como experimental pelo Tauri. O instalador não possui assinatura Authenticode e precisa de validação manual em um Windows real antes de qualquer distribuição. Para publicação profissional, recompilar/assinar em runner Windows com certificado de code signing.
