<template lang="pug">
div(class="h-screen")
  Header
  //- Header
  Toast(
    v-if="state.toast.text", 
    :toastText="state.toast.text",
    :toastColor="state.toast.color",
    :toastIcon="state.toast.icon"
    @toastDone="resetToast",
  )
  div(class="flex flex-col max-w-md mx-auto flex-start")
    div(class="p-5")
      WordRow(
        v-for="(guess, i) in state.guesses",
        :key="i", 
        :value="guess",
        :solution="state.solution",
        :submitted="i < state.currentGuessIndex",
      )
    //- p(v-if="wonGame" class="text-center") Congrats, you won!
    //- p(v-else-if="lostGame" class="text-center") You lost.
    Keyboard(
      @onKeyPress="handleInput",
      :guessedLetters="state.guessedLetters"
    )
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import fiveLetterWords from '../assets/five-letter-words.json'

import aesjs from 'aes-js';

const runtimeConfig = useRuntimeConfig()
const route = useRoute();

const validWords = new Set(fiveLetterWords);

const state = reactive({
  solution: "books",
  author: "Himothy",
  guesses: ["", "", "", "", "", ""],
  currentGuessIndex: 0,
  guessedLetters: {
    miss: [],
    found: [],
    hint: []
  },
  toast: {
    text: "",
    color: "",
    icon: ""
  },
  wonGame: false,
})

useHead({
  title: `Wordle from ${state.author}`,
  meta: [
    { name: 'description', content: `Wordle challenge from ${state.author}`}
  ],
})


// const wonGame = computed(() => state.guesses[state.currentGuessIndex - 1] === state.solution)

// const lostGame = computed(() => !wonGame.value && state.currentGuessIndex >= 6)

const decryptGame = (encryptedHex) => {
  // When ready to decrypt the hex string, convert it back to bytes
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  // The counter mode of operation maintains internal state, so to
  // decrypt a new instance must be instantiated.
  const aesCtr = new aesjs.ModeOfOperation.ctr(runtimeConfig.public.gameKey, new aesjs.Counter(5));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  // Convert our bytes back into text
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

const loadGame = (plaintextWordAndAuthor) => {
  const delimiter = plaintextWordAndAuthor.indexOf(',');
  if (delimiter == -1) console.log('error in game cipher');
  state.solution = plaintextWordAndAuthor.substring(0, delimiter);
  state.author = plaintextWordAndAuthor.substring(delimiter + 1)
  console.log(state.solution, state.author)
}

const resetToast = () => {
  state.toast.text = "";
}

const handleInput = (key) => {
  if (state.currentGuessIndex >= 6 || state.wonGame) {
    return;
  }

  const currentGuess = state.guesses[state.currentGuessIndex];

  if (key == "enter") {
    if (currentGuess.length == 5) {
      if (validWords.has(currentGuess)) {
        state.currentGuessIndex++;
        for (let i = 0; i < currentGuess.length; i++) {
          const currentChar = currentGuess.charAt(i);
          if (currentChar == state.solution.charAt(i)) {
            state.guessedLetters.found.push(currentChar);
          } else if (state.solution.indexOf(currentChar) != -1) {
            state.guessedLetters.hint.push(currentChar)
          } else {
            state.guessedLetters.miss.push(currentChar)
          }
        }
        if(currentGuess === state.solution) {
          state.wonGame = true;
          state.toast.text = "You win!";
          state.toast.color = "green";
        }
      } else {
        state.toast.text = "Invalid word entered.";
        state.toast.color = "yellow"
        state.toast.icon = "warning"
      }
    }
  }
  else if (key == "backspace") {
    state.guesses[state.currentGuessIndex] = currentGuess.slice(0, -1)
  } else if (currentGuess.length < 5 && /^[a-z]{1}$/.test(key)) {
      state.guesses[state.currentGuessIndex] += key;
  }
}

onMounted(() => {
  if (route.fullPath.length > 1) {
    state.cipher = route.fullPath.split('?')[1];
    const plaintextGame = decryptGame(state.cipher);
  loadGame(plaintextGame)
  }
  console.log(state.solution)

  window.addEventListener('keyup', (e) => {
    e.preventDefault();
    const key = e.key == "Backspace" ? "{bksp}" : e.key == "Enter" ? "{enter}" : e.key.toLowerCase();
    handleInput(key)
  })
})
</script>