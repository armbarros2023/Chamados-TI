# APK Android de teste — Chamados TI 0.1.0

## Artefato

- Arquivo: `artifacts/android/Chamados-TI-0.1.0-debug.apk`
- Aplicativo: `Chamados TI`
- Identificador: `com.arbtechinfo.chamadosti`
- Compatibilidade: Android 7.0 ou superior, API 24–36.
- API configurada: `https://chamados-staging.arbtechinfo.com.br/api/v1`.
- SHA-256: `d07e0cc219f44963c2048e3b6296ef97051b753d585d443d4f633a2d36b047a5`.

## Instalação para homologação

1. Copiar o APK para o aparelho Android.
2. Abrir o arquivo e permitir temporariamente a instalação por essa origem quando o Android solicitar.
3. Instalar e abrir `Chamados TI`.
4. Entrar com um usuário válido do staging e validar criação, consulta e resposta de chamados.

## Segurança implementada

- Comunicação somente por HTTPS; tráfego HTTP em texto claro está bloqueado.
- Access token mantido somente em memória.
- Refresh token criptografado com AES-GCM e chave não exportável do Android Keystore.
- Backup de dados do aplicativo desativado.
- Service worker da PWA desativado dentro do aplicativo nativo.
- O aplicativo não acessa o PostgreSQL diretamente; todas as operações passam pela API `/api/v1`.

## Evidência de build

- Gradle: `BUILD SUCCESSFUL`, 102 tarefas.
- Teste unitário Java do formato do refresh token: aprovado.
- Assinatura APK Signature Scheme v2: válida.
- `compileSdk` e `targetSdk`: 36; `minSdk`: 24.
- Inspeção do pacote: nenhuma credencial persistida encontrada.
- Health e readiness da API de staging: HTTP 200 em 2026-07-07.

## Limite deste artefato

Este APK usa a chave Android Debug e serve somente para teste direto. A publicação na Google Play exige chave de release própria, Android App Bundle e conta de desenvolvedor. O teste de login em aparelho físico permanece necessário.
