import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
  server: { port: parseInt(process.env.PORT || '4321'), host: '0.0.0.0' },
});
