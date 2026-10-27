// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],
  app: {
    head: {
      title: 'Irham Maulana Johani — Portfolio',
      meta: [
        { name: 'description', content: 'Portfolio of Irham Maulana Johani — selected digital products and experience.' },
        { name: 'theme-color', content: '#0c0b12' }
      ]
    }
  }
})
