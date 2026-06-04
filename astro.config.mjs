// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import mermaid from 'astro-mermaid';

// https://astro.build/config
// `site` + `base` are set for the default GitHub Pages URL so the deploy
// works immediately. When a CNAME for code.agentflow.website is added in
// DNS, drop `base` and bump `site` to the custom domain — single-line edit.
export default defineConfig({
  site: 'https://lnlockly.github.io',
  base: '/agentflow-code-docs',
  integrations: [
    // Render ```mermaid fenced blocks client-side (no build-time browser,
    // no extra server). MUST come before starlight() so it can tell
    // Expressive Code to skip the `mermaid` language and leave the block
    // for the browser-side mermaid runtime. Used by architecture/c4-overview.
    mermaid({
      theme: 'dark',
      autoTheme: true,
    }),
    starlight({
      title: 'AgentFlow Code',
      description:
        'Internal RAG-style code documentation for AgentFlow. Read this and the linked sections to skip codebase grep.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/theme.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/lnlockly/agentflow-code-docs',
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Code Map', slug: 'index' },
            { label: 'Architecture Overview', slug: 'architecture/overview' },
            { label: 'C4 Architecture Map (browsable)', slug: 'architecture/c4-overview' },
            { label: 'Dependency Map (browsable)', slug: 'architecture/dependency-map' },
          ],
        },
        {
          label: 'Products',
          items: [
            { label: 'Visitka — TG Profile', slug: 'architecture/visitka-tg-profile' },
            { label: 'Bot Pool', slug: 'architecture/bot-pool' },
            { label: 'Ferma Sales Funnel', slug: 'architecture/ferma-sales-funnel' },
            { label: 'Kinds', slug: 'architecture/kinds' },
            { label: 'TG Templates', slug: 'architecture/tg-templates' },
            { label: 'Graph Executor', slug: 'architecture/graph-executor' },
            { label: 'Channel Variants', slug: 'architecture/channel-variants' },
          ],
        },
        {
          label: 'Subsystems',
          items: [
            // 'subsystems/projects' slug had no backing .mdx (never tracked) —
            // it silently broke the static build once MDX parsing succeeded.
            // Projects are covered by 'Projects Frontend' + 'Projects Dashboard' below.
            { label: 'Code Exec MCP', slug: 'subsystems/code-exec-mcp' },
            { label: 'Pod Pre-Warm Pool', slug: 'subsystems/pod-prewarm-pool' },
            { label: 'Caddy Preview', slug: 'subsystems/caddy-preview' },
            { label: 'Runtime Supervisor', slug: 'subsystems/runtime-supervisor' },
            { label: 'LLM Router', slug: 'subsystems/llm-router' },
            { label: 'Telegram MCP', slug: 'subsystems/tg-mcp' },
            { label: 'tg_profile_bundle (graph + coder)', slug: 'subsystems/tg-profile-bundle' },
            { label: 'Auth and Access', slug: 'subsystems/auth-and-access' },
            { label: 'Projects Frontend', slug: 'subsystems/projects-frontend' },
            { label: 'Graph Handlers', slug: 'subsystems/graph-handlers' },
            { label: 'Feature Flags', slug: 'subsystems/feature-flags' },
            { label: 'Brief-Fidelity Supervisor', slug: 'subsystems/brief-fidelity-supervisor' },
            { label: 'Deploy Shield', slug: 'subsystems/deploy-shield' },
            { label: 'Funnel Analytics', slug: 'subsystems/funnel-analytics' },
            { label: 'Reminders v2', slug: 'subsystems/reminders-v2' },
            { label: 'Contact Farm', slug: 'subsystems/farm' },
            { label: 'Projects Dashboard', slug: 'subsystems/projects-dashboard' },
            { label: 'Products Hub', slug: 'subsystems/products-hub' },
            { label: 'Onboarding Quests', slug: 'subsystems/onboarding-quests' },
            { label: 'Proxy Pool', slug: 'subsystems/proxy-pool' },
            { label: 'VK Bridge', slug: 'subsystems/vk-bridge' },
            { label: 'Social Network', slug: 'subsystems/social-network' },
            { label: 'Autonomous Goals', slug: 'subsystems/autonomous-goals' },
            { label: 'Install Wizard (unified)', slug: 'subsystems/install-wizard' },
            { label: 'AgentFlow Desktop (Goose fork)', slug: 'subsystems/agentflow-desktop-fork' },
            { label: 'Desktop Auto-Updater', slug: 'subsystems/desktop-auto-updater' },
            { label: 'Desktop Agent LLM', slug: 'subsystems/desktop_agent_llm' },
            { label: 'Desktop Drive — «Взять управление» click', slug: 'subsystems/desktop-drive-click' },
            { label: 'Cabinet Device — Autonomous Tab', slug: 'subsystems/cabinet-device-autonomous-tab' },
            { label: 'Mac Menu-Bar App', slug: 'subsystems/mac-menu-bar-app' },
            { label: 'Recording Jobs', slug: 'subsystems/recording-jobs' },
            { label: 'Activepieces Marketplace', slug: 'subsystems/activepieces-marketplace' },
            { label: 'God-file Splits (barrels)', slug: 'subsystems/god-file-splits' },
          ],
        },
        {
          label: 'Cabinet & Пульт',
          items: [
            { label: 'Пульт аккаунтов (frontend)', slug: 'subsystems/cabinet-accounts-pult' },
            { label: 'Accounts Control Pult (backend)', slug: 'subsystems/accounts-pult' },
            { label: 'Accounts Pult — Entities', slug: 'subsystems/accounts-pult-entities' },
            { label: 'Connector Core', slug: 'subsystems/connector-core' },
            { label: 'Kwork Connector (current HTML + reauth)', slug: 'subsystems/kwork-connector' },
            { label: 'Proxied Cloud-Browser Connect (FE)', slug: 'subsystems/proxied-browser-connect' },
            { label: 'Proxied Browser Login (backend + chromium)', slug: 'subsystems/proxied-browser-login' },
            { label: 'Per-account Proxy Session (NodeMaven)', slug: 'subsystems/per-account-proxy-session' },
            { label: 'Approval Queue', slug: 'subsystems/approval-queue' },
            { label: 'Account Groups (farms)', slug: 'subsystems/account-groups' },
            { label: 'Account Automations', slug: 'subsystems/account-automations' },
            { label: 'Cabinet «Функции»', slug: 'subsystems/cabinet-functions' },
            { label: 'Cabinet Device — Live (Стеклянный кабинет)', slug: 'subsystems/cabinet-device-live' },
          ],
        },
        {
          label: 'Flows',
          items: [
            { label: 'Create Project', slug: 'flows/create-project' },
            { label: 'Auto-Bot Assign', slug: 'flows/auto-bot-assign' },
            { label: 'Marketplace Hire', slug: 'flows/marketplace-hire' },
            { label: 'Preview Deploy', slug: 'flows/preview-deploy' },
            { label: 'Project Lifecycle', slug: 'flows/project-lifecycle' },
            { label: 'Templates Marketplace', slug: 'flows/templates-marketplace' },
            { label: 'Diploma Outreach + Build', slug: 'flows/diploma-outreach-and-build' },
            { label: 'Graph Execution', slug: 'flows/graph-execution' },
            { label: 'Tutorial Recording', slug: 'flows/tutorial-recording' },
          ],
        },
        {
          label: 'Runbooks',
          items: [
            { label: 'Debug Stuck Project', slug: 'runbooks/debug-stuck-project' },
            { label: 'Add a New Kind', slug: 'runbooks/add-new-kind' },
            { label: 'Ship a New Boilerplate', slug: 'runbooks/ship-new-boilerplate' },
            { label: 'Canonical Templates', slug: 'runbooks/canonical-templates' },
            { label: 'Scaffold Hardening', slug: 'runbooks/scaffold-hardening' },
            { label: 'Chat-stack Smoke (Playwright)', slug: 'runbooks/chat-smoke-e2e' },
            { label: 'Verify AgentFlow Desktop', slug: 'runbooks/verify-agentflow-desktop' },
            { label: 'Update the RAG', slug: 'runbooks/update-rag-docs' },
            { label: 'DB hot paths', slug: 'runbooks/db-hot-paths' },
            { label: 'Deploy seeds (auto-applied on rollout)', slug: 'runbooks/deploy-seeds' },
            { label: 'Revolution doctrine (parallel territory capture)', slug: 'runbooks/revolution-doctrine' },
          ],
        },
        {
          label: 'More Subsystems',
          collapsed: true,
          items: [
            { label: 'AgentFlow Academy — структурированный курс', slug: 'subsystems/academy' },
            { label: 'activepieces fork — native AgentFlow auth', slug: 'subsystems/activepieces-fork-auth' },
            { label: 'activepieces fork — engine-level billing/quota hook', slug: 'subsystems/activepieces-fork-billing' },
            { label: 'Session rotation — JWT + refresh', slug: 'subsystems/auth-session-rotation' },
            { label: 'Autonomous wake-loop closure', slug: 'subsystems/autonomous-loop' },
            { label: 'USDT topup + 10-level referrals', slug: 'subsystems/billing-usdt-topup-referrals' },
            { label: 'Builtin templates registry', slug: 'subsystems/builtin-templates' },
            { label: 'Cabinet home (agent-centric, concept §5.1)', slug: 'subsystems/cabinet-home' },
            { label: 'Cabinet navigation IA (core-5 + Ещё disclosure)', slug: 'subsystems/cabinet-nav-ia' },
            { label: 'Cloud device create wizard (hosted/new)', slug: 'subsystems/cloud-device-create-wizard' },
            { label: 'Code-agent backend registry (swappable code-editing CLI)', slug: 'subsystems/code-agents-backend' },
            { label: 'coder-shim — Goose device-bridge', slug: 'subsystems/coder-shim-goose-bridge' },
            { label: 'Daemon image reconciler', slug: 'subsystems/daemon-image-reconciler' },
            { label: 'Desktop daemon self-update', slug: 'subsystems/desktop-agent-self-update' },
            { label: 'Desktop daemon: fast task_cancel (≤2 s)', slug: 'subsystems/desktop-fast-cancel' },
            { label: 'Desktop Firefox driver + per-device memory', slug: 'subsystems/desktop-firefox-and-memory' },
            { label: 'Windows installer wizard (setup_gui.py)', slug: 'subsystems/desktop-installer-wizard' },
            { label: 'Desktop Skills — user-editable intent rules', slug: 'subsystems/desktop-skills' },
            { label: 'Device create wizard + calm manage view', slug: 'subsystems/device-create-wizard' },
            { label: 'Device pause / resume toggle', slug: 'subsystems/device-pause' },
            { label: 'Device setup wizard + calm manage view', slug: 'subsystems/device-setup-wizard' },
            { label: 'Device Shell Scope & Permissions', slug: 'subsystems/device-shell-scope' },
            { label: 'Device Task Lifecycle', slug: 'subsystems/device-task-lifecycle' },
            { label: 'Device use-cases — recipes + cabinet picker', slug: 'subsystems/device-use-cases' },
            { label: 'Device workspace layouts', slug: 'subsystems/device-workspace-layouts' },
            { label: 'Devices — unified routing (local + hosted)', slug: 'subsystems/devices-unified' },
            { label: 'Discord voice deeplink', slug: 'subsystems/discord-voice-deeplink' },
            { label: 'Earnings Dashboard — /earnings', slug: 'subsystems/earnings-dashboard' },
            { label: 'Foundation Bridge', slug: 'subsystems/foundation-bridge' },
            { label: 'Foundation Scout', slug: 'subsystems/foundation-scout' },
            { label: 'Generic integrations — registry-driven cookie + app onboarding', slug: 'subsystems/generic-integrations' },
            { label: 'GitHub template search (scorer)', slug: 'subsystems/github-template-search' },
            { label: 'Hosted Daemon — AI-агент в облаке (kind=daemon)', slug: 'subsystems/hosted-daemon' },
            { label: 'Hosted Device — облачное устройство в vcluster', slug: 'subsystems/hosted-device' },
            { label: 'Hosted-device warm pool', slug: 'subsystems/hosted-device-warm-pool' },
            { label: 'Kwork Integration — cookie_export specialisation of /me/integrations/:provider', slug: 'subsystems/kwork-integration' },
            { label: 'LLM Model Aliases (FLOW pattern)', slug: 'subsystems/llm-aliases' },
            { label: 'LLM Cabinet — /llm-cabinet (frontend)', slug: 'subsystems/llm-cabinet-frontend' },
            { label: 'Marketplace → Hosted Deploy', slug: 'subsystems/marketplace-hosted-deploy' },
            { label: 'Matrix Bridge Wizard (shared TG + IG)', slug: 'subsystems/matrix-bridge-wizard' },
            { label: 'Matrix Calls (hosted Element Call)', slug: 'subsystems/matrix-calls' },
            { label: 'Matrix Casino', slug: 'subsystems/matrix-casino' },
            { label: 'Matrix Instagram Bridge', slug: 'subsystems/matrix-ig-bridge' },
            { label: 'Matrix Discord Bridge', slug: 'subsystems/mautrix-discord-bridge' },
            { label: 'Multi-agent runtime (desktop daemon)', slug: 'subsystems/multi-agent-runtime' },
            { label: 'Multi-node scheduling & cross-node networking', slug: 'subsystems/multi-node-scheduling' },
            { label: 'OpenClaw «Автопостинг» ready-function', slug: 'subsystems/openclaw-autopost' },
            { label: 'OpenClaw /live wrapper: agent stream + approvals over the device SSE', slug: 'subsystems/openclaw-live-wrapper' },
            { label: 'Owner alerts worker', slug: 'subsystems/owner-alerts' },
            { label: 'Postgres tuning', slug: 'subsystems/postgres-tuning' },
            { label: 'Project Preview (wildcard subdomain + Caddy + HMR)', slug: 'subsystems/project-preview' },
            { label: 'Projects (new architecture, 2026-05-25)', slug: 'subsystems/projects' },
            { label: 'Projects create flow (instant-create)', slug: 'subsystems/projects-create-flow' },
            { label: 'Public LLM Facade — /llm/v1/*', slug: 'subsystems/public-llm-facade' },
            { label: 'Showcase Kits', slug: 'subsystems/showcase-kits' },
            { label: 'TG bot admin panel + OWNER_TG_ID injection', slug: 'subsystems/tg-bot-admin-panel' },
          ],
        },
        {
          label: 'Academy',
          items: [
            { label: 'Curriculum Map (модули и уроки)', slug: 'academy/curriculum-map' },
          ],
        },
      ],
      plugins: [
        starlightLlmsTxt({
          projectName: 'AgentFlow Code',
          description:
            'Internal RAG for LLM agents working on AgentFlow. File refs, env vars, failure modes, flows.',
          details:
            'Use /llms-full.txt for the complete concatenated dump. Use the per-set files below when you only need one slice.',
          optionalLinks: [
            {
              label: 'GitHub repo',
              url: 'https://github.com/lnlockly/agentflow-code-docs',
              description: 'Source of the docs — patch here when code changes.',
            },
          ],
          customSets: [
            {
              label: 'Architecture',
              description: 'Subsystem maps and product architectures.',
              paths: ['architecture/**'],
            },
            {
              label: 'Subsystems',
              description: 'Code-level docs per subsystem (LLM router, MCPs, frontend, auth).',
              paths: ['subsystems/**'],
            },
            {
              label: 'Flows',
              description: 'End-to-end request paths through the platform.',
              paths: ['flows/**'],
            },
            {
              label: 'Runbooks',
              description: 'Incident playbooks and how-to guides.',
              paths: ['runbooks/**'],
            },
          ],
        }),
      ],
    }),
  ],
});
