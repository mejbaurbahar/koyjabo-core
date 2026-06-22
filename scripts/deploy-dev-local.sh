#!/bin/bash
# Manual deploy to dev.koyjabo.com — use when GitHub Actions token is broken
set -e

CORE_DIR="/Users/mejbaurbaharfagun/Desktop/Personal/koyjabo-core"

echo "Building..."
cd "$CORE_DIR"
npm run build

echo "Cloning koyjabo-dev..."
TMP=$(mktemp -d)
git clone https://github.com/mejbaurbahar/koyjabo-dev.git "$TMP/repo"
cd "$TMP/repo"

git ls-files | grep -v '^\.github/workflows/' | xargs rm -f 2>/dev/null || true
find . -not -path './.git*' -not -path './.github/workflows*' -type d -empty -delete 2>/dev/null || true

cp -r "$CORE_DIR/dist/." .
echo "dev.koyjabo.com" > CNAME
touch .nojekyll

git config user.name "deploy-script"
git config user.email "mejbaur@markopolo.ai"
git add -A

if git diff --cached --quiet; then
  echo "Nothing changed — skipping."
else
  git commit -m "deploy(dev): $(date -u '+%Y-%m-%d %H:%M UTC') | local"
  git push origin HEAD:main --force
  echo "Done — dev.koyjabo.com updated"
fi

rm -rf "$TMP"
