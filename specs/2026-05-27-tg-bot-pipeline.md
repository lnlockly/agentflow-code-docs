---
title: "Telegram-bot project pipeline (BotFather auto-registration)"
description: "When brief implies kind=tg_bot, platform registers the bot via @BotFather using the owner's TG account, captures BOT_TOKEN, wires it as a project secret, and dispatches the daemon to run python bot.py."
date: 2026-05-27
status: shipped
---

# Telegram-bot project pipeline

## TL;DR

`kind=tg_bot` projects need a `BOT_TOKEN` before `python bot.py` can run.
Owner asks: do not put humans in the loop. Use the owner's already-linked
TG account (id 1361064246, @avsee4) to chat with @BotFather, parse the
token out of the reply, persist it in `project_secrets`, then pass it
through the existing daemon dispatch so the bot starts inside the user's
hosted pod.

## Components

| Path | Role |
|---|---|
| `agentflow-agents/src/services/tg-bot-creator.ts` | NEW. Orchestrator. `createBotViaBotFather` runs the 6-step BotFather convo via tg-mcp (`mcpDirect.callTool('telegram', …)`), retries on username collision, returns `{botToken, botUsername}` or typed error. |
| `agentflow-agents/src/services/project-clone.ts` | Extended. When `kind='tg_bot'`, call `createBotViaBotFather` BEFORE the daemon dispatch. On success seal+store `BOT_TOKEN` in `project_secrets` + thread it into the agent_dev_brief `scope`. On `no_tg_account`, write a `tg_account_required` event and short-circuit. |
| `agentflow-agents/src/routes/projects.ts` | Adds `POST /me/projects/:id/connect-telegram` for retry after the owner links their TG account. |
| `agentflow-agents/src/services/builtin-templates.ts` | Already returns `tg-bot-aiogram → lnlockly/agentflow-tg-bot-starter` for the classifier; we just verify the repo exists. |
| `agentflow-landing/src/pages/ProjectApprovePrompt.tsx` | Detect `kind=tg_bot && error=no_tg_account` → CTA "Подключи Телеграм". |
| `agentflow-landing/src/.../ProjectWorkspace` preview slot | For tg_bot, render `https://t.me/<bot_username>` card instead of iframe. |
| `agentflow-computer-mcp/.../agent_brief.py` | Daemon brief extension (separate PR): when `scope.bot_token` present, write `.env` + `nohup python bot.py …` then `pgrep -f`. |

## Data flow

```
POST /me/projects/:id/approve  (kind=tg_bot, templateRepoFull set)
        ↓
triggerProjectClone(id)
        ↓
project.kind === 'tg_bot' ?
  ├── yes → createBotViaBotFather(owner, project)
  │          ├── tg-mcp list_accounts → pick active
  │          │      └── none → return {error:'no_tg_account'}
  │          │                     ↓
  │          │              appendProjectEvent('tg_account_required')
  │          │                     ↓
  │          │              triggerProjectClone returns error
  │          │                     ↓
  │          │              /approve returns 409 + message
  │          │                     ↓
  │          │              FE ProjectApprovePrompt shows "Подключи Телеграм"
  │          │                     ↓
  │          │              owner links → POST /me/projects/:id/connect-telegram
  │          │
  │          ├── send_message('@BotFather', '/newbot')
  │          ├── poll get_messages → "How are we going to call it?"
  │          ├── send name (sanitised, ≤64 chars)
  │          ├── poll get_messages → "Now let's choose a username"
  │          ├── send `af_<slug>_bot` (≤32 chars), retry +nn on collision
  │          ├── poll get_messages → parse token + @username
  │          └── return {botToken, botUsername}
  │                ↓
  │          UPSERT project_secrets (BOT_TOKEN, sealed)
  │                ↓
  │          appendProjectEvent('bot_created', {bot_username})
  │                ↓
  │          dispatch agent_dev_brief w/ scope.bot_token + scope.bot_username
  │                ↓
  │          daemon: clone repo → write .env → `nohup python bot.py`
  │
  └── no  → existing path (no token wiring)
```

## DB / Env / API

- Tables: `project_secrets`, `project_events`, `projects` (cols `kind`, `templateRepoFull`, `slug`, `ownerUserId`).
- Env: `TG_MCP_URL` (default `http://127.0.0.1:4500/sse/`), `TG_MCP_TOKEN`, `AGENTS_MASTER_KEY` (for sealing).
- Routes: `POST /me/projects/:id/approve`, NEW `POST /me/projects/:id/connect-telegram`.
- MCP tools (telegram): `list_accounts(owner_user_id)`, `send_message(owner_user_id, account_id, peer, text)`, `get_messages(owner_user_id, account_id, peer, limit)`.

## Failure modes

| Symptom | Log signature for grep | Where to fix |
|---|---|---|
| Approve returns 409 + `no_tg_account` | `[tg-bot-creator] no active tg account for owner` | Owner needs to link TG via `/cabinet/integrations/telegram`, then POST `/me/projects/:id/connect-telegram`. |
| Approve returns 502 + `botfather_no_reply` | `[tg-bot-creator] poll timeout waiting for BotFather` | tg-mcp down / account banned. Check `TG_MCP_URL` + `list_accounts`. |
| Approve returns 502 + `username_unavailable` | `[tg-bot-creator] giving up on username after 5 retries` | All collision attempts taken — owner brief implies a generic name. Retry creates new candidates. |
| Bot username is a long transliterated sentence (e.g. `bot_dlya_zapisi_na_strizhku_bot`) | LLM `validateProposedUsername` returns null → fallback to `af_<slug>_bot` | LLM router ignored the prompt cap. The validator now rejects stems >16 chars or >1 underscore (`tg-bot-creator.ts:135-170`). Tighten the prompt examples if a vertical keeps falling through. |
| Approve returns 502 + `botfather_flood_wait` | `[tg-bot-creator] flood_wait, sleeping` | Telegram rate-limited the owner account; we sleep+retry 2x then give up. |
| Bot created but `python bot.py` never starts | `pgrep -f 'python bot.py'` empty in pod | Daemon brief amendment not deployed; verify computer-mcp PR landed. |
| Re-running connect-telegram on a project that already has BOT_TOKEN | (none — idempotent no-op) | Returns existing `bot_username`. |

## Idempotency

- `createBotViaBotFather` is called at most once per project: `project_clone.ts` checks `project_secrets WHERE key='BOT_TOKEN' AND is_set=true` before invoking. Re-runs of `/connect-telegram` on a project that already has a BOT_TOKEN return `{ok:true, bot_username}` without poking BotFather.
- `appendProjectEvent('bot_created', …)` is one-shot guarded by the secret check.

## Related

- `agentflow-code-docs/src/content/docs/subsystems/project-clone-pipeline.mdx` (existing — describes daemon dispatch)
- `agentflow-code-docs/src/content/docs/subsystems/tg-mcp.mdx` (existing — describes tg-mcp tools)
