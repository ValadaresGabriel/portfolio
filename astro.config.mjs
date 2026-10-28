// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL is set on Cloudflare Pages once the custom domain exists;
// CF_PAGES_URL is provided by Cloudflare on every build.
export default defineConfig({
  site: process.env.SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321',
});
