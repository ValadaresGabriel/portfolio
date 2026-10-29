// @ts-check
import { defineConfig } from 'astro/config';

// Public URL used for canonical links and share images.
export default defineConfig({
  site: process.env.SITE_URL || 'https://gabrielvaladares.com',
});
