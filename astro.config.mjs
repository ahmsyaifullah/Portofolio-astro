// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://ahmadsyaifullah.my.id',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false }
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});