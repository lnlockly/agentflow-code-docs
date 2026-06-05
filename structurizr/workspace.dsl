workspace "AgentFlow — KEEP architecture" "C4 model of the 15-page product + its backend spine (connector-core / approval-queue), devices/engines, the flow LLM router and the BEP20 token-launchpad. Built from plans/build/00-MASTER.md + 01-ARCHITECTURE.md, 2026-06-03. Maps ONLY the KEEP scope — soft-deleted features are excluded." {

    !identifiers hierarchical

    model {
        # ---- People ----
        owner = person "Владелец / User" "The person running accounts, projects and devices through AgentFlow. Drafts an action, reviews it, presses «Подтвердить»."

        # ---- The product ----
        agentflow = softwareSystem "AgentFlow" "«AI с руками» — describe a task, an agent brings back a real result. 15 pages over one generic connector-core + approval spine, devices/engines, the flow LLM router and a token launchpad." {

            landing = container "agentflow-landing (Web App)" "The 15 Pencil pages: Лендинг, Авторизация, Онбординг, Чат, Проекты, Workspace, Пульт ×3, MCP, Интеграции, Устройства, Live, Cloud, Автоматизации, Баланс, Аккаунт. Drafts actions and shows the approval feed with «Подтвердить / Изменить / Отклонить»." "React 19, Vite 7, Tailwind 4, TanStack Query"

            agents = container "agentflow-agents (Backend)" "Hono server. Hosts /me/* REST + SSE, runs boot migrations, gates auth (x-api-key / JWT / cookie), owns the connector-core and approval modules, devices dispatch, projects lifecycle and the flow LLM router." "TypeScript, Hono, Drizzle"

            connectorCore = container "connector-core" "One generic Connector interface per platform (listEntities / readEntity / buildAction / executeAction). Thin adapters over existing MCP tools — zero per-platform branching outside the registry. buildAction drafts only; executeAction is the ONLY side-effecting call." "TS module — src/connector-core/"

            approvalQueue = container "approval-queue" "Generic «armed → confirm» spine generalized from the proven Kwork pattern. One entity_approval_queue table; atomic single-use claim (armed→executing) before any send. Every DM / post / gig response / bulk farm action flows through one human-confirm gate." "TS module — src/approval/"

            aiRouter = container "ai-router (flow)" "useModel + provider registry. The `flow` alias never pins one provider — it falls through a health-gated chain (codex.sale → designapi-text → claudecodeapi → claude-oauth) on error/timeout." "TS module — src/ai-router/"

            mcpServers = container "MCP servers" "Existing transport AgentFlow talks through: Telegram (tg-mcp, 33 MTProto tools), kwork-inbox, tg-bot, self, architect. Connectors and tools call them via mcpDirect.callTool(...)." "tg-mcp (Python Telethon) + Node MCP wrappers"

            deviceDaemon = container "Device daemon (computer-mcp → goose)" "Runs on the owner's computer or in a cloud pod. Receives dispatched tasks over WebSocket, streams the Live screen back, runs the per-pod engine (goose et al.)." "computer-mcp daemon + goose engine"

            postgres = container "Postgres" "Single source of truth: accounts, entity_approval_queue, devices/tasks/sessions, projects/events, Telegram pool, credentials. 200+ Drizzle tables, migrations applied on boot." "PostgreSQL 16" "Database"

            launchpad = container "agentflow-api (Token launchpad)" "BEP20 / dPNM token-launchpad service. Kept whole and separate from the agents backend." "TypeScript service"
        }

        # ---- External systems ----
        telegram = softwareSystem "Telegram (MTProto)" "User Telegram accounts + bots. Reached only through the tg-mcp transport." "External"
        kwork = softwareSystem "Kwork" "Freelance exchange — gigs, dialogs, auto-responses. Reached through kwork-inbox." "External"
        llmProviders = softwareSystem "LLM providers" "codex.sale, designapi-text, claudecodeapi, claude-oauth — reached only via the flow router, never pinned." "External"
        chain = softwareSystem "BEP20 chain" "Binance Smart Chain — where the launchpad token lives." "External"
        userDevices = softwareSystem "User devices" "The owner's Mac / Windows / Linux machine or a cloud pod that runs the device daemon." "External"

        # ---- Context relationships ----
        owner -> agentflow "Runs accounts, builds products, drives devices — drafts & confirms actions"
        agentflow -> telegram "Reads dialogs / sends messages (after confirm)" "via tg-mcp"
        agentflow -> kwork "Reads gigs / posts responses (after confirm)" "via kwork-inbox"
        agentflow -> llmProviders "Generates drafts / agent reasoning" "via flow router"
        agentflow -> userDevices "Dispatches tasks, streams Live screen" "WebSocket"
        agentflow -> chain "Launches / manages token" "via agentflow-api"

        # ---- Container relationships ----
        owner -> agentflow.landing "Uses in a browser"
        agentflow.landing -> agentflow.agents "REST + SSE (/me/*), x-api-key / cookie" "HTTPS"
        agentflow.landing -> agentflow.launchpad "Token UI calls" "HTTPS"

        agentflow.agents -> agentflow.connectorCore "Lists entities / drafts actions"
        agentflow.agents -> agentflow.approvalQueue "Arms drafts, confirms, executes"
        agentflow.agents -> agentflow.aiRouter "useModel(...) for command drafting"
        agentflow.agents -> agentflow.postgres "Reads / writes" "SQL"
        agentflow.agents -> agentflow.deviceDaemon "Dispatch / queue tasks, receive Live" "WebSocket"

        agentflow.connectorCore -> agentflow.mcpServers "Wraps tools" "mcpDirect.callTool"
        agentflow.approvalQueue -> agentflow.connectorCore "executeAction() after human confirm"
        agentflow.approvalQueue -> agentflow.postgres "entity_approval_queue claim/write" "SQL"
        agentflow.aiRouter -> agentflow.llmProviders "flow chain (health-gated failover)" "HTTPS"
        agentflow.mcpServers -> agentflow.telegram "MTProto"
        agentflow.mcpServers -> agentflow.kwork "Inbox API"
        agentflow.deviceDaemon -> agentflow.userDevices "Runs on / controls"
        agentflow.launchpad -> agentflow.chain "Token tx" "BEP20"

        # ---- Component view: the connector-core + approval spine ----
        # Platform → Account → EntityKind → Entity → Action → ApprovalQueue
        registry = component "Connector Registry" "PLATFORM_REGISTRY. registerConnector / getConnector / listPlatforms. Adding a platform = one registry row + one connector file — no route, UI or schema change." "src/connector-core/registry.ts"
        platformDef = component "PlatformDef + EntityKind" "Data-driven platform description: id, label, entityKinds (dialogs / channels / my_gigs / exchange …), connect methods. The UI renders whatever is here." "src/connector-core/types.ts"
        connector = component "Connector (per platform)" "Thin adapter: listAccounts / listEntities / readEntity / buildAction(draft) / executeAction. Telegram in Wave 1, Kwork in Wave 2, VK in Wave 5." "src/connector-core/connectors/*.ts"
        meAccounts = component "me-accounts route" "GET /me/accounts, /:id/entities, /:id/entities/:eid/thread; POST /:id/command (SSE). The command handler drafts via the LLM, then arms an approval row." "src/routes/me-accounts.ts"
        meApprovals = component "me-approvals route" "GET /me/approvals?status=armed; POST /me/approvals/:id/{confirm,edit,reject}; confirm-all. The right-rail + General Пульт feed." "src/routes/me-approvals.ts"
        queueSvc = component "Approval queue service" "arm() / listArmed() / edit() / reject() / confirmAll(). Inserts armed rows; lists the cross-account feed." "src/approval/queue.ts"
        executor = component "Approval executor" "Atomic single-use claim: UPDATE … WHERE status='armed' RETURNING *; on claim → connector.executeAction(); writes executed/failed + external_id. Idempotent re-POST no-ops." "src/approval/executor.ts"
        eaqTable = component "entity_approval_queue" "One table for every platform's pending action: user_id, platform, account_ref, action_type, payload(jsonb), status(armed→executing→executed/failed/rejected), scheduled_at." "Postgres table"

        agentflow.landing -> meAccounts "Browse entities + send command (SSE)"
        agentflow.landing -> meApprovals "Render feed + Подтвердить / Изменить / Отклонить"
        meAccounts -> registry "getConnector(platform)"
        registry -> connector "resolves"
        registry -> platformDef "exposes"
        connector -> agentflow.mcpServers "tool calls" "mcpDirect.callTool"
        meAccounts -> queueSvc "buildAction → arm() draft"
        queueSvc -> eaqTable "INSERT status='armed'"
        meApprovals -> executor "confirm → claim + execute"
        executor -> eaqTable "atomic claim armed→executing, then write result"
        executor -> connector "executeAction() (the only send)"
        connector -> agentflow.telegram "send (after confirm)" "via tg-mcp"
    }

    views {
        systemContext agentflow "Context" "Who and what AgentFlow talks to." {
            include *
            autolayout lr
        }

        container agentflow "Containers" "The KEEP containers: the 15-page web app, the Hono backend with its connector-core / approval / flow modules, devices, Postgres and the launchpad." {
            include *
            autolayout lr
        }

        component agents "Spine" "Platform → Account → EntityKind → Entity → Action → ApprovalQueue: draft → human confirm → act." {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                shape person
                background #4cb782
                color #0d0d0f
            }
            element "Software System" {
                background #131316
                color #ededf2
            }
            element "External" {
                background #2a2a30
                color #8a8a95
            }
            element "Container" {
                background #1d4f3d
                color #ededf2
            }
            element "Component" {
                background #18382c
                color #ededf2
            }
            element "Database" {
                shape cylinder
            }
        }
    }
}
