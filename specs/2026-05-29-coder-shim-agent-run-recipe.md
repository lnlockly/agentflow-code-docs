# Spec — coder-shim `agent_run_recipe` handler (device-recipe runner + scheduler)

Date: 2026-05-29
Repo: agentflow-agents (`src/coder-shim/`, `coder-shim-image/`, `tests/`)
Unblocks: cabinet picker PR #543 (agentflow-landing), device use-cases L1/C2 end-to-end.

## Goal
The coder-shim already handles `task_dispatch{tool:'agent_dev_brief'}` (clone → goose
run → probe → clone-status). Add a SECOND direct-tool: `agent_run_recipe`, which
runs a bundled Goose device-recipe (`recipes/devices/<id>.yaml`) — immediately for
local recipes, or registered with Goose's scheduler when a `cron` is supplied
(cloud recipes like C2). The recipes are the allowlist + injection boundary.

## Dispatch contract (from the picker — fixed, do not change)
```
POST /me/devices/:id/dispatch_task
  { task, tool:'agent_run_recipe', scope:{ recipe:<id>, params:{k:v,...}, cron?:string|null } }
```
- `recipe` — a recipe id that MUST exist in the bundled `recipes/devices/manifest.json`.
- `params` — flat `Record<string,string>`. Picker drops empty optionals; server
  re-validates each key against the recipe's declared params (whitelist).
- `cron` — present only for cloud recipes; may be `null`. Non-empty string → schedule
  instead of run-once.

## Security boundary (the whole point)
1. **recipe-id allowlist** — reject any `recipe` not in `manifest.json`. No path
   traversal, no arbitrary file. The recipe file path is derived ONLY as
   `recipes/devices/<id>.yaml` where `<id>` is a manifest id matching `^[a-z0-9-]+$`.
2. **param-key whitelist** — only keys declared in that recipe's manifest `params`
   are forwarded. Unknown keys dropped (not an error — generic, forward-compatible).
3. **argv as an ARRAY, never a shell string** — `['run','--recipe',file,'--params',
   'k=v', ...]`. No `sh -c`, no interpolation. A param value containing `;`, `$()`,
   backticks, spaces is a single argv element → cannot break out.
4. **cron validation** — only 5- or 6-field cron made of `[0-9*/,-]` and spaces;
   reject anything else (no flags, no shell). Normalize 5-field → 6-field (prepend
   `0` seconds) for Goose's scheduler.

## Files
| Path | Change |
|---|---|
| `src/coder-shim/recipes.ts` (new) | load + cache manifest, `validateRecipeDispatch(scope)`, `buildRecipeRunArgs`, `buildScheduleArgs`, `normalizeCron` — all PURE |
| `src/coder-shim/protocol.ts` | add `RECIPE_TOOL='agent_run_recipe'`, advertise it in `CODER_SHIM_TOOLS`, `isRecipeDispatch` guard |
| `src/coder-shim/goose-runner.ts` | `runGooseArgs(args, …)` thin spawn that takes an explicit argv (reuse the existing spawn for both `goose run --recipe` and `goose schedule add`) |
| `src/coder-shim/bridge.ts` | route `isRecipeDispatch` → `handleRecipeDispatch`: validate → run-once or schedule → stream tail → task_complete/task_error |
| `src/coder-shim/main.ts` | pass `recipesDir` (default `/app/recipes/devices`) into the bridge cfg |
| `coder-shim-image/recipes/devices/*` (vendored) | copy of the fork's `recipes/devices/` (manifest + yaml) so the allowlist + files ship in the image |
| `coder-shim-image/Dockerfile` | `COPY coder-shim-image/recipes /app/recipes` |
| `tests/coder-shim.test.ts` | + recipe allowlist, params→argv, cron→schedule, error tests |

## Data flow
```
picker → /me/devices/:id/dispatch_task {tool:'agent_run_recipe',scope}
  → WS task_dispatch (devices-ws, unchanged)
  → bridge.isRecipeDispatch → handleRecipeDispatch
       validateRecipeDispatch(scope, manifest):
         recipe∈manifest? params∩declared-keys? cron valid?
       if cron:  goose schedule add --schedule-id <dev>-<recipe> --cron <6field> --recipe-source recipes/devices/<id>.yaml
                 → task_complete "scheduled: <id> (<schedule-id>)"
       else:     goose run --no-session --recipe recipes/devices/<id>.yaml --params k=v ... (--max-turns N)
                 → task_complete (tail) / task_error
```
No clone-status here — a recipe run is not a project build; report is purely via
task_complete/task_error on the WS.

## LLM
Recipes inherit the goose provider config (`config.yaml` GOOSE_MODEL=$GOOSE_MODEL,
default `flow`). The handler passes NO `--model` and hardcodes no id (MASTER §5 r9).

## Approval-gated recipes
Recipes that pause for Telegram approval do so INSIDE the recipe (their own
instructions). The handler runs them as-is and does not bypass.

## Edge cases
- Unknown recipe id → task_error `recipe_not_allowed`.
- `recipe` missing/non-string → task_error `recipe_missing`.
- `params` not an object → treat as `{}` (generic; optional recipes have defaults).
- required manifest param absent → NOT enforced here (picker enforces; recipe yaml
  has `requirement`); the handler only whitelists keys, it does not invent values.
- cron present but invalid → task_error `invalid_cron`.
- goose binary missing / non-zero exit → task_error `recipe_run_failed` with tail.
- schedule add non-zero → task_error `recipe_schedule_failed` with tail.
```
```
