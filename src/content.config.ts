import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Keep .mdx content at the repo root (architecture/, subsystems/, flows/,
// runbooks/, index.mdx) so agents and humans still read it directly via
// the same paths they always have. Starlight loads it through a glob
// pointed at the repo root.
export const collections = {
  docs: defineCollection({
    loader: glob({
      base: '.',
      pattern: [
        'index.mdx',
        'architecture/**/*.{md,mdx}',
        'subsystems/**/*.{md,mdx}',
        'flows/**/*.{md,mdx}',
        'runbooks/**/*.{md,mdx}',
      ],
    }),
    schema: docsSchema(),
  }),
};
