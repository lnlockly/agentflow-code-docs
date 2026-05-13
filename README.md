# AgentFlow Code Docs

Internal, RAG-style code documentation for the AgentFlow platform. Read by LLM agents (and humans) before making non-trivial changes. Public product docs live at https://docs.agentflow.website — this repo is for **code-level architecture**: subsystems, flows, runbooks.

Live site: https://code.agentflow.website (Cloudflare Pages).

## What lives here

`.mdx` source in the repo root:

| Path | Purpose |
|---|---|
| `index.mdx` | Code map landing page. |
| `architecture/` | Subsystem maps and product architectures. |
| `subsystems/` | Per-subsystem code refs (LLM router, MCPs, frontend, auth). |
| `flows/` | End-to-end request paths through the platform. |
| `runbooks/` | Incident playbooks and how-to guides. |

Agents in long sessions should `WebFetch https://code.agentflow.website/llms-full.txt` once and keep it in working context.

## LLM endpoints

After build, the [`starlight-llms-txt`](https://github.com/delucis/starlight-llms-txt) plugin emits:

| Path | Purpose |
|---|---|
| `/llms.txt` | Top-level TOC with per-page summaries. |
| `/llms-full.txt` | Every page concatenated — single fetch for the entire RAG. |
| `/llms-small.txt` | Compressed variant (titles + body, code blocks dropped). |
| `/_llms-txt/architecture.txt` | Per-set slice — `architecture/**`. |
| `/_llms-txt/subsystems.txt` | Per-set slice — `subsystems/**`. |
| `/_llms-txt/flows.txt` | Per-set slice — `flows/**`. |
| `/_llms-txt/runbooks.txt` | Per-set slice — `runbooks/**`. |

## Local preview

```bash
npm install
npm run dev      # http://localhost:4321
```

To inspect the LLM dump after build:

```bash
npm run build
wc -c dist/llms-full.txt    # should be >= 30KB
```

## Authoring rules

- Every file ref is `repo/path/to/file.ts:lineNumber`. Grep first; never invent line numbers.
- Headers and table columns in English (grep-ability). Russian/English mix in body is fine.
- Use the standard page template (front-matter, TL;DR, Files, Data flow, DB/Env/API, Failure modes, Related). See `runbooks/update-rag-docs.mdx`.
- After a heavy paste edit, run `npm run escape-mdx` once — idempotently escapes `{`, `}`, and `|` inside table-cell inline-code where MDX would otherwise choke.

## Stack

- [Astro](https://astro.build) 5 + [Starlight](https://starlight.astro.build) 0.36
- [`starlight-llms-txt`](https://github.com/delucis/starlight-llms-txt) plugin for `/llms-full.txt`
- Cloudflare Pages for hosting (free tier)
- GitHub Actions for CI/CD (`.github/workflows/deploy-cf-pages.yml`)

## Deploy

Push to `main` -> CI builds -> Cloudflare Pages picks up `dist/`. CI fails the build if `dist/llms-full.txt` is under 30 KB.

### First-time Cloudflare Pages setup (one-time, by repo owner)

The CI workflow assumes a Pages project named `agentflow-code-docs` already exists. To create it:

1. Cloudflare dashboard -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Pick the GitHub repo `lnlockly/agentflow-code-docs`. Authorize the GitHub App if asked.
3. Build settings (override the defaults so they match the workflow):
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: *(leave blank)*
   - Environment variable: `NODE_VERSION=20`
4. Save and deploy. The first build runs from CF's own runner; subsequent deploys come from GitHub Actions.
5. Create two GitHub Actions secrets in the repo (Settings -> Secrets and variables -> Actions):
   - `CLOUDFLARE_API_TOKEN` — Cloudflare dashboard -> My Profile -> API Tokens -> Create token with the **Edit Cloudflare Pages** template.
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard right sidebar of any Pages project.

### Custom domain `code.agentflow.website`

After the Pages project is live:

1. Cloudflare Pages project -> **Custom domains** -> **Set up a custom domain** -> `code.agentflow.website`.
2. CF asks you to add a DNS record. If `agentflow.website` is on the same Cloudflare account, the record is added automatically. If not, add it manually in your DNS provider:
   - Type: **CNAME**
   - Name: `code`
   - Target: `agentflow-code-docs.pages.dev` (or whatever the project's `.pages.dev` host is)
   - Proxy / orange-cloud: enabled if the parent zone is on Cloudflare.
3. Wait for the TLS certificate (usually <5 min).
4. Verify: `curl -I https://code.agentflow.website/llms-full.txt` should return `200`.

## Repo layout

This repo only hosts docs. Code lives elsewhere — see `index.mdx` for the multi-repo map.
