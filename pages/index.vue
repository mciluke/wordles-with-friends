<template lang="pug">
div(class="min-h-screen bg-zinc-800 overflow-hidden touch-none select-none") 
  Header
  //- Header
  //- div(class="text-white flex flex-row justify-center bg-zinc-600") ello
  Toast(
    v-if="state?.toast?.text", 
    :toastText="state?.toast?.text || ''",
    :toastColor="state?.toast?.color || ''",
    :toastIcon="state?.toast?.icon || ''"
    @toastDone="resetToast",
  )
  div(class="flex flex-col max-w-md mx-auto flex-start min-h-[calc(100vh-64px)] px-4")
    //- Tagline section
    div(class="text-center py-4")
      template(v-if="!state.author")
        p(class="text-white text-lg mb-2") Welcome to Wordle with Friends!
        p(class="text-zinc-400 text-sm")
          | Play today's wordle or 
          NuxtLink(to="/create" class="text-white hover:text-zinc-200") create and share your own &gt;
      template(v-else)
        p(class="text-white text-lg") Guess the 5-letter word from 
          span(class="font-bold") {{ state.author }}
        p(class="text-zinc-400 text-sm mt-1") 
          | You have 6 attempts to find the word. 
          NuxtLink(to="/create" class="text-white hover:text-zinc-200") Create your own &gt;
    div(class="flex-grow flex flex-col justify-between")
      div(class="space-y-1")
        WordRow(    
          v-for="(guess, i) in state.guesses",
          :key="i", 
          :value="guess",
          :solution="state.solution",
          :submitted="i < state.currentGuessIndex",
        )
      Keyboard(
        @onKeyPress="handleInput",
        :guessedLetters="state.guessedLetters"
        class="pb-safe mt-4"
      )
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import fiveLetterWords from '../assets/five-letter-words.json';
import aesjs from 'aes-js';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const validWords = new Set(fiveLetterWords);

// Add meta for mobile viewport and disable zooming
useHead({
  meta: [
    { 
      name: 'viewport', 
      content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' 
    },
    {
      name: 'HandheldFriendly',
      content: 'true'
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    }
  ],
  htmlAttrs: {
    class: 'touch-none'
  }
});

// Initialize state first
const state = reactive({
  solution: 'books',
  author: '',
  isLoading: false,
  guesses: ['', '', '', '', '', ''],
  currentGuessIndex: 0,
  guessedLetters: {
    miss: [],
    found: [],
    hint: [],
  },
  toast: {
    text: '',
    color: '',
    icon: '',
  },
  wonGame: false,
});

// Then define functions that use state
const resetToast = () => {
  if (!state?.toast) return;
  state.toast.text = '';
  state.toast.color = '';
  state.toast.icon = '';
};

// Prevent zoom on double tap and pinch
let lastTap = 0;
onMounted(() => {
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
    }
    lastTap = now;
  }, { passive: false });
});

const decryptGame = (encryptedHex) => {
  try {
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    const aesCtr = new aesjs.ModeOfOperation.ctr(
      runtimeConfig.public.gameKey,
      new aesjs.Counter(5)
    );
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

const loadGame = (plaintextWordAndAuthor) => {
  const delimiter = plaintextWordAndAuthor.indexOf(',');
  if (delimiter === -1) {
    console.error('Error in game cipher: no delimiter found');
    return { solution: 'books', author: '' };
  }
  return {
    solution: plaintextWordAndAuthor.substring(0, delimiter),
    author: plaintextWordAndAuthor.substring(delimiter + 1)
  }
  // state.solution = plaintextWordAndAuthor.substring(0, delimiter);
  // state.author = plaintextWordAndAuthor.substring(delimiter + 1);
  // console.log(state.solution, state.author);
};

const handleInput = (key) => {
  if (state.currentGuessIndex >= 6 || state.wonGame) {
    return;
  }

  const currentGuess = state.guesses[state.currentGuessIndex];

  if (key === 'enter') {
    if (currentGuess.length === 5) {
      if (validWords.has(currentGuess)) {
        state.currentGuessIndex++;
        for (let i = 0; i < currentGuess.length; i++) {
          const currentChar = currentGuess.charAt(i);
          if (currentChar === state.solution.charAt(i)) {
            state.guessedLetters.found.push(currentChar);
          } else if (state.solution.indexOf(currentChar) !== -1) {
            state.guessedLetters.hint.push(currentChar);
          } else {
            state.guessedLetters.miss.push(currentChar);
          }
        }
        if (currentGuess === state.solution) {
          state.wonGame = true;
          state.toast.text = 'You win!';
          state.toast.color = 'green';
        }
      } else {
        state.toast.text = 'Invalid word entered.';
        state.toast.color = 'yellow';
        state.toast.icon = 'warning';
      }
    }
  } else if (key === 'backspace') {
    state.guesses[state.currentGuessIndex] = currentGuess.slice(0, -1);
  } else if (currentGuess.length < 5 && /^[a-z]{1}$/.test(key)) {
    state.guesses[state.currentGuessIndex] += key;
  }
};

onMounted(async () => {
  if (route.fullPath.length > 1) {
    state.isLoading = true;
    try {
      const cipher = route.fullPath.split('?')[1];
      const plaintextGame = decryptGame(cipher);
      const { solution, author } = loadGame(plaintextGame);
      state.solution = solution;
      state.author = author;
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      state.isLoading = false;
    }
  }

  window.addEventListener('keyup', (e) => {
    e.preventDefault();
    handleInput(e.key.toLowerCase());
  });
});
</script>

<style>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Additional zoom prevention */
* {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>
