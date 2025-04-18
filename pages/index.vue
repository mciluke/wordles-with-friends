<template lang="pug">
div(class="min-h-screen bg-zinc-800") 
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
  VictoryBanner(
    v-if="state.wonGame"
    :solution="state.solution"
    :author="state.author"
    :attempts="state.currentGuessIndex"
    @close="state.showVictoryBanner = false"
  )
  div(class="flex flex-col max-w-md mx-auto flex-start min-h-[calc(100vh-64px)] px-4 pb-safe")
    //- Tagline section
    div(class="text-center py-4")
      template(v-if="!state.author")
        p(class="text-white text-lg") Play today's word or 
          NuxtLink(to="/create" class="text-white hover:text-zinc-200 underline") create a challenge
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
        class="mt-4"
      )
</template>

<script setup>
import { reactive, onMounted, computed, watch } from 'vue';
import fiveLetterWords from '../assets/five-letter-words.json';
import aesjs from 'aes-js';

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const validWords = new Set(fiveLetterWords);

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
  showVictoryBanner: false,
});

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
    },
    // Open Graph meta tags for link previews
    {
      property: 'og:title',
      content: route.fullPath.length > 1 ? 'You\'ve been sent a Wordle Challenge' : 'Daily Wordle Challenge'
    },
    {
      property: 'og:description',
      content: route.fullPath.length > 1 
        ? 'Can you guess this 5-letter word in 6 attempts?'
        : 'Play today\'s word or create your own challenge. Can you guess the 5-letter word in 6 attempts?'
    }
  ]
});

// Then define functions that use state
const resetToast = () => {
  if (!state?.toast) return;
  state.toast.text = '';
  state.toast.color = '';
  state.toast.icon = '';
};

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

// Add confetti function
const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Use confetti from window object since we're not using a module
    window.confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    window.confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

// Update the handleInput function to trigger celebration
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
          state.showVictoryBanner = true;
          // Add script tag for confetti
          if (!document.getElementById('confetti-script')) {
            const script = document.createElement('script');
            script.id = 'confetti-script';
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
            script.onload = () => {
              triggerConfetti();
            };
            document.head.appendChild(script);
          } else {
            triggerConfetti();
          }
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

/* Basic touch handling */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent text selection except in inputs */
body {
  -webkit-user-select: none;
  user-select: none;
  overscroll-behavior-x: none;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>
