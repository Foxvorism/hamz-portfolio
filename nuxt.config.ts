// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],
  app: {
    head: {
      title: 'Irham Maulana Johani — Portfolio',
      meta: [
        { name: 'description', content: 'Portfolio of Irham Maulana Johani — selected digital products and experience.' },
        { name: 'theme-color', content: '#0c0b12' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://api.fontshare.com' },
        { rel: 'preconnect', href: 'https://cdn.fontshare.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=panchang@700&display=swap' },
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap' }
      ]
    }
  }
})
