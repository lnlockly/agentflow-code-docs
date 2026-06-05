# Spec — agentflow-coder-shim (Goose device-bridge), v0

Date: 2026-05-29. Track A of master-plan v3 (Goose replaces computer-mcp).
Phase 0 spike is green (`plans/autonomous/_goose-spike.md`): Goose runs the coder
workload against `flow`→codex.sale, writes brief-derived files, serves over HTTP,
~111 MiB peak RSS.

This spec covers **Phase 2 v0**: a thin bridge that speaks AgentFlow's devices-ws
protocol on one side and drives `goose run` on the other, replacing the
opencode/aider subprocess inside the daemon's `agent_dev_brief` coder path.

## Goal (and non-goal)

In scope (coder slice only): clone a template, run Goose to fill the brief, start
the dev-server, probe the port, POST `/internal/projects/:id/clone-status`, and
emit `task_complete`/`task_error` over the WS — the exact contract the backend
already expects.

Out of scope for v0: computer-use, autonomous, integrations, MJPEG live-stream,
multi-agent. Those stay on the existing daemon (master-plan v3 §3 keeps the desktop
product; this bridge is the coder slice only). The live-stream republish is v3 §5.1,
deferred.

## Why a separate module, not a daemon fork

The bridge is generic platform plumbing: WS framing + a goose subprocess driver +
the clone-status callback. It has zero per-OS desktop code, so it does not belong in
the 18.6k-LoC Python daemon. It lands as an in-tree module under
`agentflow-agents/src/coder-shim/` (typechecked + built + tested by the repo's
existing CI) with a thin long-running entrypoint. No new repo, no new self-hosted
runner registration — CI stays green by construction.

## Components

| Component | Responsibility |
|---|---|
| `src/coder-shim/protocol.ts` | Pure types + frame builders mirroring `packages/shared-types/devices.ts` `WsMessage`. `buildHello`, `buildHeartbeat`, `buildTaskComplete`, `buildTaskError`, and `parseFrame`. No I/O — fully unit-testable. |
| `src/coder-shim/scope.ts` | Pure validation + normalisation of the `agent_dev_brief` dispatch scope (`template_repo_full`, `slug`, `project_id`, `brief`, `port`, `kind`, optional `bot_token`/`bot_username`). Rejects missing required fields with a machine code. |
| `src/coder-shim/goose-runner.ts` | Pure command builder + thin spawn wrapper. `buildGooseConfig(gatewayBase, model)` → the `config.yaml` body; `buildGooseArgs({brief, kind, maxTurns})` → argv for `goose run`; `runGoose(...)` spawns and resolves `{ok, exitCode, tail}`. The model alias (`flow`) and gateway base come from env — never hardcoded. |
| `src/coder-shim/pipeline.ts` | Orchestrates one coder task: git clone → write goose config → `runGoose` → start dev-server (per-kind) → probe port → return a `CloneStatusReport`. Pure decision logic split from the spawn/probe side-effects so the report builder is unit-testable. |
| `src/coder-shim/clone-status.ts` | Pure builder for the `/internal/projects/:id/clone-status` POST body (matches `internal.ts` `cloneStatusSchema`) + a `postCloneStatus` thin fetch with the `x-agentflow-secret` header. |
| `src/coder-shim/bridge.ts` | The long-running WS client: connect to `/_devices/connect` with `x-api-key`/`x-device-id`/`x-device-secret`, `hello`, `hello_ack` (store rotated secret), heartbeat 15s, route `task_dispatch{tool:'agent_dev_brief'}` → pipeline → `task_complete`/`task_error`. |
| `src/coder-shim/main.ts` | Entrypoint: read env, construct + run the bridge. `node dist/coder-shim/main.js`. |

## Data flow (coder task)

```
backend project-clone.ts
  dispatchOrQueueDeviceTask({ tool:'agent_dev_brief', scope:{template_repo_full,
    slug, project_id, brief, port, kind, bot_token?} })
   │ WS task_dispatch frame  (UNCHANGED protocol)
   ▼
coder-shim bridge.ts  _onTaskDispatch
   │  scope.ts validates → pipeline.ts runs:
   │    git clone template_repo_full → /workspace/<slug>
   │    write ~/.config/goose/config.yaml (provider=openai, model=$GOOSE_MODEL=flow,
   │       OPENAI_HOST=$AF_API_URL, OPENAI_BASE_PATH=_agents/llm/v1/chat/completions)
   │    goose run --with-builtin developer --no-session --max-turns N -t <brief>
   │    start dev-server per kind (or none for tg_bot) → probe 127.0.0.1:<port>
   │  clone-status.ts POST /internal/projects/:id/clone-status {ok, port,
   │     port_reachable, package_manager, project_dir, pod_ip, dev_pid?}
   ▼  WS task_complete{task_id, answer, iterations:0, tokens_used:0, cost_usd:0}
backend internal.ts clone-status handler → flips projects.status, wires Ingress,
backend devices-ws.ts task_complete → device_action_log
```

## Env (pod side, all already present on the daemon pod)

| Env | Use |
|---|---|
| `AF_API_KEY` | owner/device api key — `x-api-key` on WS + `OPENAI_API_KEY` for goose |
| `AF_API_URL` | gateway base, default `https://agentflow.website`; goose `OPENAI_HOST` + WS host |
| `AF_DEVICE_ID` | `x-device-id` on WS connect |
| `AF_DEVICE_TOKEN` / device_secret | `x-device-secret`; rotated on `hello_ack` |
| `AF_INTERNAL_API_SECRET` | `x-agentflow-secret` on clone-status POST |
| `GOOSE_MODEL` | model alias, default `flow` (never a concrete model id) |
| `GOOSE_DISABLE_KEYRING=1` | headless pod has no keyring |
| `WORKSPACE_ROOT` | clone target, default `/workspace` |

## Edge cases

- `template_repo_full` missing → `task_error` + clone-status `{ok:false, error:'template_repo_full_missing'}`. Never crash.
- goose exits non-zero → `{ok:false, error:'goose_failed', detail:<tail>}`.
- `kind=tg_bot` → no HTTP port; pipeline reports `port:0` + `bot_username` so the
  backend's tg-bot branch flips status without probing a port.
- port never answers within the probe window → `{ok:true, port_reachable:false}`;
  backend keeps `provisioning` (preview-reconciler promotes later) — matches today.
- WS drops mid-task → bridge reconnects (backoff cap 30s, reset on `hello_ack`);
  the task is fire-and-forget like the daemon (backend has the timeout sweeper).
- Generic only: no `if (slug === …)`. Per-kind behaviour keys off `scope.kind`.

## Test plan (TDD, `tests/coder-shim/*.test.ts`, node --test + tsx)

1. `protocol.test.ts` — round-trip every frame builder; `parseFrame` rejects malformed JSON / unknown type.
2. `scope.test.ts` — valid scope passes; each missing required field yields its code; tg_bot scope without port is allowed.
3. `goose-runner.test.ts` — `buildGooseConfig` emits the right provider/model/host/base-path; `buildGooseArgs` includes `--no-session`, `--max-turns`, the brief, and never a concrete model name; reads `GOOSE_MODEL` from env.
4. `clone-status.test.ts` — body matches `cloneStatusSchema` shape for landing (port>0) and tg_bot (port=0 + bot_username); secret goes in the header, never the body.
5. `pipeline.test.ts` — report builder maps goose exit code + probe result to the correct `{ok, error?}` without spawning (inject fakes).

All pure logic is covered without network or a real goose binary. A live e2e
(real clone + real goose + real gateway) stays a manual/nightly check, mirrored on
the verified Phase-0 spike.

## Verification gate

- `npm run typecheck` + `npm run build` clean (the module compiles under the repo tsconfig).
- `npm test` green for `tests/coder-shim/*`.
- Spike doc proves the runtime half end-to-end.
- RAG: this spec + `subsystems/computer-mcp.mdx` + `desktop-coding-tools.mdx` updated in the same PR.
