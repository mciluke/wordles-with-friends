<template lang="pug">
div(class="text-white bg-zinc-700 min-h-screen") Create a challenge!
  NuxtLink(to="/") (Back to home)
  p Word:
  input(v-model="state.word" class="lock mb-2 text-sm font-medium text-gray-900")
  p Author:
  input(v-model="state.author" class="lock mb-2 text-sm font-medium text-gray-900")
  div(v-if="state.word && state.author" @click="copyLink") Link (click to copy):
    p {{ generateLink(state.word, state.author) }}
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import aesjs from 'aes-js';
const route = useRoute();


const runtimeConfig = useRuntimeConfig();

const state = reactive({
  word: '',
  author: '',
  link: '',
});

const encryptGame = (word, author) => {
  // const text = 'books,Luke McInerney';
  const text = `${word},${author}`;
  const textBytes = aesjs.utils.utf8.toBytes(text);

  const aesCtr = new aesjs.ModeOfOperation.ctr(
    runtimeConfig.public.gameKey,
    new aesjs.Counter(5)
  );
  const encryptedBytes = aesCtr.encrypt(textBytes);

  return aesjs.utils.hex.fromBytes(encryptedBytes);
};

// onMounted(() => console.log(window.origin))

const copyLink = () => {
  const link = generateLink(state.word, state.author);
  return navigator.clipboard.writeText(link)
}

const generateLink = (word, author) => {
  return `${window.origin}/?${encryptGame(word, author)}`;
};
</script>
