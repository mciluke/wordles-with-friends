// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    head: {
      charset: 'utf-16',
      title: 'Wordle with Friends',
      meta: [
        // <meta name="description" content="My amazing site">
        { name: 'description', content: 'Play Wordle with Friends.' }
      ],
    }
  },
  runtimeConfig: {
    public: {
      gameKey: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
    }
  }
})
