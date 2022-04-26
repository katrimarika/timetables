#!/bin/bash

set -e # exit on error

echo -e "Installing dependencies..."
npm ci

echo -e "\n\nRunning tests..."
CI=true npm test

echo -e "\n\nBuilding..."
npm run build

# Re-create the correct branch
deploy_branch="gh-pages"

echo -e "\n\nSwitching branch..."

if [[ $(git branch) =~ $deploy_branch ]]; then
  git branch -D $deploy_branch
fi
git switch --orphan $deploy_branch

# Copy contents from build to top level
cp -R ./build/. ./

echo -e "\n\nCommiting and pushing changes to $deploy_branch..."

git add images/ static/ index.html favicon.ico 404.html manifest.json asset-manifest.json CNAME

git commit -m "Deploy to $deploy_branch"

git push -f origin $deploy_branch

echo -e "\n\n\"Deployment\" done. Cleaning up..."

# Remove staged and working directory changes
git reset --hard

# Switch back to master
git switch master

# Remove untracked files
git clean -f -d

echo -e "\n\nDone."
