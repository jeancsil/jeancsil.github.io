// @ts-check
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog post collection definition
 *
 * This collection stores all blog posts as markdown files in src/content/blog/
 * Each post must include frontmatter with metadata.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

/**
 * Content collections export
 *
 * All collections are defined here and used throughout the site
 */
export const collections = {
  blog,
};
