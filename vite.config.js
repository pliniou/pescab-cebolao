import fs from 'node:fs';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { corDoToken } from './pipeline/tokens.mjs';

// Cor da barra (tema claro) lida do design system: manifesto do PWA e theme-color inicial do index.html
const BARRA = corDoToken(fs.readFileSync(new URL('./src/style.css', import.meta.url), 'utf8'), 'barra').hex;
// Se node_modules for um link para fora do projeto, o Vite serve pelo caminho real, e o servidor de desenvolvimento precisa
// liberá-lo (sem isso as fontes do CSS respondem 403). Numa instalação comum, é a própria pasta do projeto.
const MODULOS = fs.realpathSync(new URL('./node_modules', import.meta.url));

export default defineConfig({
  // caminhos relativos: o mesmo build funciona na raiz de um domínio e num subcaminho (GitHub Pages: /pescab-cebolao/)
  base: './',
  build: {
    target: 'es2022',
    // O chunk do three.js (~660 kB minificado) é o motor 3D, necessário desde a primeira tela: não há o que
    // carregar sob demanda. O limite cobre só ele; o código do app fica bem abaixo (~150 kB).
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // three.js em chunk próprio: uma atualização do app não invalida a biblioteca no cache do service worker
        codeSplitting: { groups: [{ name: 'three', test: /node_modules[\\/]three[\\/]/ }] },
      },
    },
  },
  server: { host: true, fs: { allow: [searchForWorkspaceRoot(process.cwd()), MODULOS] } },
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.js'],
    setupFiles: ['test/setup.js'], // tokens do CSS no documento (o 3D lê cores deles)
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js', 'pipeline/obj.mjs', 'pipeline/config.mjs', 'pipeline/tokens.mjs', 'pipeline/catalogo.mjs'],
      // main.js é a composição da página (top-level await, WebGL e service worker): verificado no navegador
      exclude: ['src/main.js'],
      reporter: ['text', 'html'],
    },
  },
  preview: { host: true },
  plugins: [
    // %BARRA% no index.html vira a cor do token (o main.js atualiza ao trocar de tema)
    { name: 'cor-da-barra-no-html', transformIndexHtml: (html) => html.replaceAll('%BARRA%', BARRA) },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registrado em src/main.js
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Atlas Cabeça e Pescoço',
        short_name: 'Atlas C&P',
        description: 'Atlas 3D interativo de cabeça e pescoço para estudo de Odontologia (funciona offline).',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: BARRA,
        theme_color: BARRA,
        categories: ['education', 'medical'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // tudo no cache na primeira visita (modelos GLB incluídos) → 100% offline depois
        globPatterns: ['**/*.{html,js,css,json,glb,png,svg,ico,webmanifest,woff2}'],
        // meta.json documenta o pipeline (o app não lê); atlas.ico é do atalho local da área de trabalho
        globIgnores: ['models/meta.json', 'icons/atlas.ico'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
});
