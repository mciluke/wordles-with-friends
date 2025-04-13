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
        @focus="isNameInputFocused = true"
        @blur="isNameInputFocused = false"
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
      :hideEnter="true"
    )
    div(class="mt-8 bg-zinc-700 p-4 rounded-lg")
      p(class="text-white text-sm mb-2") Requirements:
      ul(class="text-sm mb-4")
        li(class="flex items-center gap-2")
          span(class="text-lg" :class="state?.author ? 'text-green-400' : 'text-zinc-400'") ✓
          span(:class="state?.author ? 'text-white' : 'text-zinc-400'") Enter your name
        li(class="flex items-center gap-2")
          span(class="text-lg" :class="state?.word?.length === 5 ? 'text-green-400' : 'text-zinc-400'") ✓
          span(:class="state?.word?.length === 5 ? 'text-white' : 'text-zinc-400'") Enter a 5-letter word
        li(class="flex items-center gap-2" v-if="state?.word?.length === 5")
          span(class="text-lg" :class="isValidWord ? 'text-green-400' : 'text-zinc-400'") ✓
          span(:class="isValidWord ? 'text-white' : 'text-zinc-400'") Word must be valid
        li(class="flex items-center gap-2" v-else)
          span(class="text-lg" :class="isValidWord ? 'text-green-400' : 'text-zinc-400'") ✓
          span(:class="isValidWord ? 'text-white' : 'text-zinc-400'") Word must be valid
      template(v-if="state?.word && state?.author && isValidWord")
        p(class="text-white text-sm mb-2") Share this link with your friends (tap to copy):
        div(
          @click="copyLink" 
          class="bg-zinc-600 p-3 rounded cursor-pointer hover:bg-zinc-500 transition-colors text-white text-sm break-all"
        ) {{ generateLink((state?.word || ''), (state?.author || '')) }}
        p(class="text-green-400 text-xs mt-2" v-if="state?.linkCopied") Link copied to clipboard!
      //- template(v-else)
        div(
          class="bg-zinc-600/50 p-3 rounded text-zinc-400 text-sm break-all cursor-not-allowed"
        ) Complete the requirements above to get your share link
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import aesjs from 'aes-js';
import fiveLetterWords from '../assets/five-letter-words.json';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const validWords = new Set(fiveLetterWords);
const isNameInputFocused = ref(false);

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

const isValidWord = computed(() => {
  return state.word?.length === 5 && validWords.has(state.word.toLowerCase());
});

const resetToast = () => {
  if (!state?.toast) return;
  state.toast.text = '';
  state.toast.color = '';
  state.toast.icon = '';
};

const handleInput = (key) => {
  if (!state || isNameInputFocused.value) return;
  
  if (state.word?.length >= 5 && key !== 'backspace') {
    return;
  }

  if (key === 'backspace') {
    state.word = (state.word || '').slice(0, -1);
  } else if (/^[a-z]{1}$/.test(key)) {
    const newWord = (state.word || '') + key;
    state.word = newWord;
    
    // Show feedback immediately when word length reaches 5
    if (newWord.length === 5) {
      if (validWords.has(newWord.toLowerCase())) {
        if (state.toast) {
          state.toast.text = 'Valid word! Share link is ready below.';
          state.toast.color = 'green';
          state.toast.icon = 'check';
        }
      } else {
        if (state.toast) {
          state.toast.text = 'Please enter a valid 5-letter word.';
          state.toast.color = 'yellow';
          state.toast.icon = 'warning';
        }
      }
    }
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
  if (!state?.word || !state?.author || !isValidWord.value) return;
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
  if (!word || !author || !isValidWord.value) return '';
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
