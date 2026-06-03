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
          ],
        },
        {
          label: 'Cabinet & Пульт',
          items: [
            { label: 'Пульт аккаунтов (frontend)', slug: 'subsystems/cabinet-accounts-pult' },
            { label: 'Accounts Control Pult (backend)', slug: 'subsystems/accounts-pult' },
            { label: 'Accounts Pult — Entities', slug: 'subsystems/accounts-pult-entities' },
            { label: 'Connector Core', slug: 'subsystems/connector-core' },
            { label: 'Kwork Connector (reauth)', slug: 'subsystems/kwork-connector' },
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
