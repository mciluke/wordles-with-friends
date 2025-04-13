<!-- Create a beautiful victory banner with game stats -->
<template lang="pug">
div(class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4")
  div(class="bg-zinc-800 rounded-xl p-6 max-w-md w-full text-center relative overflow-hidden")
    //- Decorative elements
    div(class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600")
    div(class="absolute -left-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl")
    div(class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl")
    
    //- Content
    h2(class="text-3xl font-bold text-white mb-2") Victory!
    p(class="text-green-400 text-lg mb-6") You solved the challenge!
    
    //- Stats
    div(class="bg-zinc-900/50 rounded-lg p-4 mb-6")
      div(class="grid grid-cols-2 gap-4")
        div(class="text-center")
          p(class="text-zinc-400 text-sm") Word
          p(class="text-white text-xl mt-1") {{ solution.toUpperCase() }}
        div(class="text-center")
          p(class="text-zinc-400 text-sm") Created by
          p(class="text-white text-lg mt-1") {{ author }}
    
    //- Share button
    button(
      @click="copyToClipboard"
      class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
    )
      span(v-if="!copied") Share Victory 🎉
      span(v-else) Copied! 🎈
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  solution: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    required: true
  }
})

const copied = ref(false)

const copyToClipboard = async () => {
  const message = `🎉 I solved ${props.author}'s Wordle Challenge!\n\nWord: ${props.solution.toUpperCase()}\nAttempts: ${props.attempts}/6\n\nCreate your own at: ${window.location.origin}`
  
  try {
    await navigator.clipboard.writeText(message)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script> 