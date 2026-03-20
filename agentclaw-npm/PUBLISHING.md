# Publishing AgentTrace to npm

## First-Time Setup

### 1. Create an npm account
Go to https://npmjs.com and create a free account.

### 2. Add NPM_TOKEN to GitHub Secrets
1. Go to npmjs.com ? your account ? Access Tokens
2. Generate a new token ? type: "Automation"
3. Copy the token
4. Go to your GitHub repo ? Settings ? Secrets and variables ? Actions
5. Click "New repository secret"
6. Name: NPM_TOKEN
7. Value: paste your token
8. Click "Add secret"

### 3. Push your code to GitHub
git init
git remote add origin https://github.com/RavaniRoshan/agentclaw.git
git add .
git commit -m "feat: initial release v0.1.0"
git push -u origin main

## Publishing a New Version

### Step 1: Update the version
In package.json, change "version" to the new version.
In bin/agentclaw.js, update the VERSION constant to match.
In src/server.js, update the version in /api/health response.
In src/commands/ui.js, update the startup banner version to match.

### Step 2: Commit the version bump
git add package.json bin/agentclaw.js src/server.js src/commands/ui.js
git commit -m "chore: bump version to X.X.X"
git push

### Step 3: Create and push a tag
git tag vX.X.X
git push --tags

This triggers the publish.yml GitHub Action automatically.
The package is live on npm within 2-3 minutes.

### Step 4: Verify it published
npm info agentclaw
npx agentclaw --version

## Manual Publish (if GitHub Actions is not set up yet)
npm login
npm publish --access public

## Verify After Publishing
npm info agentclaw version          ? shows current published version
npm info agentclaw dist-tags        ? shows latest tag
npx agentclaw --version             ? tests the published package end-to-end

---

## Version History
v0.1.0 - Initial release
         - npx agentclaw (UI viewer)
         - npx agentclaw traces (terminal list)
         - npx agentclaw clear (delete traces)
         - Reads ~/.agentclaw/traces/ written by pip install agentclaw
