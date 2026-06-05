import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Keep .mdx content at the repo root (architecture/, subsystems/, flows/,
// runbooks/, academy/, index.mdx) so agents and humans still read it
// directly via the same paths they always have. Starlight loads it through
// a glob pointed at the repo root. Every served category lives at the root;
// nothing renders out of src/content/docs/ so the served set and the
// on-disk set stay in lockstep.
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
        'academy/**/*.{md,mdx}',
      ],
    }),
    schema: docsSchema(),
  }),
};
