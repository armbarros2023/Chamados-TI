#!/bin/sh
set -eu

SKILL_DIR="${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"

test -f "$SKILL_DIR/SKILL.md"
test -f "$SKILL_DIR/references/operational-baseline-2026-07-13.md"
grep -q '^name: chamados-ti-operational-baseline$' "$SKILL_DIR/SKILL.md"
grep -q '^description: ' "$SKILL_DIR/SKILL.md"

if grep -Eqi '(password|senha|token|jwt_secret|smtp).*[:=].+' "$SKILL_DIR"/SKILL.md "$SKILL_DIR"/references/*.md; then
  echo "Falha: a skill parece conter uma credencial."
  exit 1
fi

echo "Skill chamados-ti-operational-baseline validada."
