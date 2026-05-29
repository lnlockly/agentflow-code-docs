// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
// `site` + `base` are set for the default GitHub Pages URL so the deploy
// works immediately. When a CNAME for code.agentflow.website is added in
// DNS, drop `base` and bump `site` to the custom domain — single-line edit.
export default defineConfig({
  site: 'https://lnlockly.github.io',
  base: '/agentflow-code-docs',
  integrations: [
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
            { label: 'Projects (new architecture)', slug: 'subsystems/projects' },
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
            { label: 'Matrix Discord Bridge', slug: 'subsystems/mautrix-discord-bridge' },
            { label: 'Social Network', slug: 'subsystems/social-network' },
            { label: 'Autonomous Goals', slug: 'subsystems/autonomous-goals' },
            { label: 'Install Wizard (unified)', slug: 'subsystems/install-wizard' },
            { label: 'Desktop Auto-Updater', slug: 'subsystems/desktop-auto-updater' },
            { label: 'Desktop Agent LLM', slug: 'subsystems/desktop_agent_llm' },
            { label: 'Cabinet Device — Autonomous Tab', slug: 'subsystems/cabinet-device-autonomous-tab' },
            { label: 'Multi-Agent Runtime (Desktop)', slug: 'subsystems/multi-agent-runtime' },
            { label: 'Mac Menu-Bar App', slug: 'subsystems/mac-menu-bar-app' },
            { label: 'Recording Jobs', slug: 'subsystems/recording-jobs' },
            { label: 'Academy', slug: 'subsystems/academy' },
            { label: 'Showcase Kits', slug: 'subsystems/showcase-kits' },
            { label: 'Owner Alerts Worker', slug: 'subsystems/owner-alerts' },
            { label: 'Activepieces Marketplace', slug: 'subsystems/activepieces-marketplace' },
          ],
        },
        {
          label: 'Academy',
          items: [
            { label: 'Curriculum Map', slug: 'academy/curriculum-map' },
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
            { label: 'Update the RAG', slug: 'runbooks/update-rag-docs' },
            { label: 'Revolution Doctrine', slug: 'runbooks/revolution-doctrine' },
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
