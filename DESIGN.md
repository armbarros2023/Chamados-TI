---
name: Chamados TI
description: Sistema corporativo claro e eficiente para suporte interno.
colors:
  primary: "#0f766e"
  primary-deep: "#115e59"
  accent: "#b45309"
  canvas: "#f8fafc"
  surface: "#ffffff"
  ink: "#0f172a"
  muted: "#475569"
  border: "#cbd5e1"
  danger: "#b91c1c"
  success: "#15803d"
typography:
  headline:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Chamados TI

## Overview

**Creative North Star: "Central de Operações Serena"**

Uma ferramenta de trabalho clara, estável e direta. A informação conduz a hierarquia; cor sinaliza ação e estado, nunca decoração. Densidade é permitida quando ajuda a comparar chamados, mas formulários e decisões críticas recebem espaço e contexto.

## Colors

Azul-petróleo conduz ações primárias; neutros frios mantêm leitura longa confortável. Âmbar é reservado a atenção, vermelho a erro/perigo e verde a sucesso.

O tema claro é o padrão visual. O tema escuro é uma preferência opcional, com canvas `#0f172a`, superfícies `#1e293b`, texto `#f1f5f9` e bordas `#475569`. A escolha respeita inicialmente o sistema operacional e depois fica persistida no dispositivo.

## Typography

**Display Font:** Aptos (com Segoe UI e system-ui)
**Body Font:** Aptos (com Segoe UI e system-ui)

Uma única família mantém o produto familiar e eficiente. Títulos são firmes, labels têm peso 600 e corpo preserva 1.5 de entrelinha.

## Elevation

Superfícies são definidas por contraste tonal e bordas. Sombras pequenas aparecem apenas em menus e diálogos; cartões comuns permanecem planos.

## Components

Botões primários usam azul-petróleo sólido, sem gradiente. Campos são brancos, borda cinza e foco visível teal. Estados usam texto, ícone e cor. Navegação móvel preserva alvos de 44 px.

## Do's and Don'ts

### Do:
- **Do** usar fundo `#f8fafc`, superfícies brancas e texto `#0f172a`.
- **Do** reservar `#0f766e` para ação primária, foco e seleção.
- **Do** explicar estados vazios, falhas e operações pendentes.
- **Do** oferecer alternância claro/escuro no login e na navegação autenticada.

### Don't:
- **Don't** usar tema escuro dominante com laranja neon.
- **Don't** enviar a preferência de tema ao servidor; ela pertence ao dispositivo.
- **Don't** usar gradientes decorativos, glassmorphism ou sombras dramáticas.
- **Don't** atrasar a tarefa com splash ou animação de entrada.
- **Don't** misturar operações destrutivas com ações rotineiras.

## Decision Log

- **2026-07-06 — Tema do aplicativo:** tema claro permanece padrão; tema escuro opcional usa a mesma identidade azul-petróleo, respeita a preferência do sistema na primeira visita e é salvo localmente. A alternância fica disponível antes e depois do login para não depender da sessão.
