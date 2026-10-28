// @ts-check
import { defineConfig } from 'astro/config';

// Public URL used for canonical links and share images.
// Change it to the custom domain once it is set up (task 12).
export default defineConfig({
  site: process.env.SITE_URL || 'https://portfolio.gabriu10.workers.dev',
});
