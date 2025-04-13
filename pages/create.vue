<template lang="pug">
div(class="min-h-screen bg-zinc-800")
  Header
  Toast(
    v-if="state?.toast?.text", 
    :toastText="state?.toast?.text || ''",
    :toastColor="state?.toast?.color || ''",
    :toastIcon="state?.toast?.icon || ''"
    @toastDone="resetToast"
  )
  div(class="flex flex-col max-w-md mx-auto flex-start p-5")
    h1(class="text-2xl font-bold text-white mb-6 text-center") Create a Wordle Challenge
    div(class="mb-6")
      label(class="block text-white text-sm font-bold mb-2") Your Name:
      input(
        :value="state?.author || ''"
        @input="e => state && (state.author = e.target.value)"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your name"
      )
    div(class="mb-8")
      label(class="block text-white text-sm font-bold mb-2") Enter your 5-letter word:
      WordRow(
        :value="(state?.word || '').toLowerCase()",
        :solution="(state?.word || '').toLowerCase()",
        :submitted="false"
      )
    Keyboard(
      @onKeyPress="handleInput",
      :guessedLetters="{miss: [], found: [], hint: []}"
    )
    div(v-if="state?.word && state?.author" class="mt-8 bg-zinc-700 p-4 rounded-lg")
      p(class="text-white text-sm mb-2") Share this link with your friends:
      div(
        @click="copyLink" 
        class="bg-zinc-600 p-3 rounded cursor-pointer hover:bg-zinc-500 transition-colors text-white text-sm break-all"
      ) {{ generateLink((state?.word || ''), (state?.author || '')) }}
      p(class="text-green-400 text-xs mt-2" v-if="state?.linkCopied") Link copied to clipboard!
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import aesjs from 'aes-js';
import fiveLetterWords from '../assets/five-letter-words.json';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const validWords = new Set(fiveLetterWords);

const state = reactive({
  word: '',
  author: '',
  link: '',
  linkCopied: false,
  toast: {
    text: '',
    color: '',
    icon: '',
  }
});

const resetToast = () => {
  if (state?.toast) {
    state.toast.text = '';
    state.toast.color = '';
    state.toast.icon = '';
  }
};

const handleInput = (key) => {
  if (!state) return;
  
  if (state.word?.length >= 5 && key !== 'backspace' && key !== 'enter') {
    return;
  }

  if (key === 'backspace') {
    state.word = (state.word || '').slice(0, -1);
  } else if (key === 'enter') {
    if (state.word?.length === 5) {
      if (!validWords.has((state.word || '').toLowerCase())) {
        if (state.toast) {
          state.toast.text = 'Invalid word entered.';
          state.toast.color = 'yellow';
          state.toast.icon = 'warning';
        }
      }
    }
  } else if (/^[a-z]{1}$/.test(key)) {
    state.word = (state.word || '') + key;
  }
};

const encryptGame = (word, author) => {
  if (!word || !author) return '';
  try {
    const text = `${word},${author}`;
    const textBytes = aesjs.utils.utf8.toBytes(text);

    const aesCtr = new aesjs.ModeOfOperation.ctr(
      runtimeConfig.public.gameKey,
      new aesjs.Counter(5)
    );
    const encryptedBytes = aesCtr.encrypt(textBytes);

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

const copyLink = () => {
  if (!state?.word || !state?.author) return;
  try {
    const link = generateLink(state.word, state.author);
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        if (state) {
          state.linkCopied = true;
          setTimeout(() => {
            if (state) state.linkCopied = false;
          }, 2000);
        }
      }).catch(console.error);
    }
  } catch (error) {
    console.error('Copy link error:', error);
  }
};

const generateLink = (word, author) => {
  if (!word || !author) return '';
  try {
    return `${window.origin}/?${encryptGame(word || '', author || '')}`;
  } catch (error) {
    console.error('Generate link error:', error);
    return '';
  }
};

onMounted(() => {
  window.addEventListener('keyup', (e) => {
    e.preventDefault();
    handleInput(e.key.toLowerCase());
  });
});
</script>
