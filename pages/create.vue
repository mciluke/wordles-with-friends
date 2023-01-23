<template lang="pug">
div Create a challenge!
  NuxtLink(to="/") (Back to home)
  p Word:
  input(v-model="state.word")
  p Author:
  input(v-model="state.author")
  div(v-if="state.word && state.author") Link:
    p {{ generateLink(state.word, state.author) }}
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import aesjs from 'aes-js';
const runtimeConfig = useRuntimeConfig()


const state = reactive({
  word: "",
  author: "",
  link: ""
})

const encryptGame = (word, author) => {
  // const text = 'books,Luke McInerney';
  const text = `${word},${author}`
  const textBytes = aesjs.utils.utf8.toBytes(text);

  const aesCtr = new aesjs.ModeOfOperation.ctr(runtimeConfig.public.gameKey, new aesjs.Counter(5));
  const encryptedBytes = aesCtr.encrypt(textBytes);

  return aesjs.utils.hex.fromBytes(encryptedBytes);

}

const generateLink = (word, author) => {
  return encryptGame(word, author)
}



</script>