# Team Setup: koyjabo-core → koyjabo.com

## Architecture

```
koyjabo-core (PRIVATE)          Dhaka-Commute (PUBLIC)
┌─────────────────────┐         ┌──────────────────────────┐
│  Full source code   │ ──CI/CD─▶│  Deployed dist files only │
│  .github/workflows/ │         │  .github/workflows/       │
│    deploy.yml       │         │    auth.yml    ← stays    │
│    pr-check.yml     │         │    cleanup-auth.yml        │
│  src/, components/  │         │    delete-test-users.yml   │
│  services/, hooks/  │         │  index.html, assets/       │
│  .env (never commit)│         │  CNAME → koyjabo.com       │
└─────────────────────┘         └──────────────────────────┘
         ↑                                  ↓
    Dev work here              GitHub Pages serves this
                                 koyjabo.com (public)
```

**Why this split:**
- Source code is private → no competitors can clone your logic
- Auth workflows stay in `Dhaka-Commute` because the frontend calls them via `workflow_dispatch` API targeting that repo
- Domain (`CNAME`) and static files live in the public repo as before

---

## One-Time Setup (owner only)

### 1. Create `koyjabo-core` private repo

```
GitHub → New repository
Name: koyjabo-core
Visibility: Private
README: No (we'll push existing code)
```

### 2. Push all current code to koyjabo-core

```bash
# From your local Dhaka-Commute directory
git remote add core https://github.com/mejbaurbahar/koyjabo-core.git
git push core main
```

### 3. Create a Fine-Grained PAT (DEPLOY_TOKEN)

```
GitHub → Settings → Developer Settings
→ Personal access tokens → Fine-grained tokens → Generate new token

Name: koyjabo-core-deploy
Expiration: 1 year
Repository access: Only selected → mejbaurbahar/Dhaka-Commute
Permissions:
  Contents: Read and write
  Metadata: Read-only (auto-selected)
```

Copy the token.

### 4. Add DEPLOY_TOKEN to koyjabo-core

```
koyjabo-core repo → Settings → Secrets and variables → Actions
→ New repository secret
Name: DEPLOY_TOKEN
Value: (paste token from step 3)
```

### 5. Copy ALL existing secrets to koyjabo-core

Add these secrets to `koyjabo-core` (same values as in `Dhaka-Commute`):

| Secret name | Where used |
|---|---|
| `VITE_GITHUB_TOKEN` | Build step (Vite env var) |

The auth secrets (`DATA_GITHUB_TOKEN`, `JWT_SECRET`, `ENCRYPTION_KEY`, `SMTP_EMAIL`, etc.)
stay ONLY in `Dhaka-Commute` — they are used by the auth workflows that run there.

### 6. Change Dhaka-Commute GitHub Pages source

```
Dhaka-Commute repo → Settings → Pages
→ Source: Deploy from a branch
→ Branch: main / (root)
→ Save
```

This is needed because deploy.yml in koyjabo-core pushes files directly
to the Dhaka-Commute main branch (not using GitHub Actions artifact upload).

### 7. Remove deploy.yml from Dhaka-Commute

Since koyjabo-core now owns deployment, the old deploy.yml in Dhaka-Commute
is no longer needed. Delete it from the Dhaka-Commute repo:

```bash
# In a clone of Dhaka-Commute
git rm .github/workflows/deploy.yml
git commit -m "chore: remove old deploy workflow (now handled by koyjabo-core)"
git push origin main
```

---

## Daily Dev Workflow

```
1. Clone koyjabo-core (NOT Dhaka-Commute)
   git clone https://github.com/mejbaurbahar/koyjabo-core.git

2. Create a branch for your work
   git checkout -b feat/your-feature-name

3. Develop and test locally
   npm install
   npm run dev
   # Test at localhost:5173

4. Push your branch
   git push origin feat/your-feature-name

5. Open a Pull Request → main
   - pr-check.yml runs automatically (build validation)
   - PR must pass before merge

6. After PR is merged to main:
   - deploy.yml triggers automatically
   - Builds and pushes to Dhaka-Commute
   - koyjabo.com updates within ~2 minutes
```

---

## Branch Protection (set this up)

```
koyjabo-core → Settings → Branches → Add rule
Branch name pattern: main

✅ Require a pull request before merging
✅ Require status checks to pass before merging
   → Required check: "Build validation" (from pr-check.yml)
✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
```

This enforces: **no one can push to main directly** (including the owner).

---

## Local .env setup

Create `.env` in project root (never commit this):

```env
VITE_GITHUB_TOKEN=ghp_yourtoken
```

`.env` is already in `.gitignore`.

---

## What stays where

| Item | koyjabo-core | Dhaka-Commute | koyjabo |
|---|---|---|---|
| Source code | ✅ | ❌ | ❌ |
| CI/CD deploy workflow | ✅ | ❌ | ❌ |
| Auth workflows | ❌ | ✅ | ❌ |
| Built dist files | ❌ | ✅ | ❌ |
| User data (JSON) | ❌ | ❌ | ✅ |
| Secrets (build) | ✅ | ❌ | ❌ |
| Secrets (auth) | ❌ | ✅ | ❌ |
| CNAME | ❌ | ✅ | ❌ |

---

## Troubleshooting

**Deploy failed: "Permission denied" or 403**
→ DEPLOY_TOKEN expired or has wrong permissions
→ Regenerate the fine-grained PAT (Step 3) and update the secret (Step 4)

**Site not updating after deploy succeeded**
→ Check Dhaka-Commute → Settings → Pages → Source is set to "branch: main"
→ GitHub Pages cache can take 2–5 minutes

**Build fails in CI but works locally**
→ Check if VITE_GITHUB_TOKEN is added to koyjabo-core secrets
→ Run `npm ci` locally (not `npm install`) to match CI exactly

**Auth (login/signup) not working**
→ Auth workflows run in Dhaka-Commute, not koyjabo-core
→ Check Dhaka-Commute → Actions for auth workflow errors
→ Verify auth-related secrets are in Dhaka-Commute, not koyjabo-core
