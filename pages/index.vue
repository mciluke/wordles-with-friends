<template lang="pug">
div
  //- Header
  div(class="flex flex-col h-screen max-w-md mx-auto justify-evenly")
    div
      WordRow(
        v-for="(guess, i) in state.guesses",
        :key="i", 
        :value="guess",
        :solution="state.solution",
        :submitted="i < state.currentGuessIndex",
      )
    //- p(v-if="invalidText" class="text-center") Invalid word entered.
    p(v-if="wonGame" class="text-center") Congrats, you won!
    p(v-else-if="lostGame" class="text-center") You lost.
    SimpleKeyboard(
      @onKeyPress="handleInput",
      :guessedLetters="state.guessedLetters",
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
  }
})

useHead({
  title: 'WWF' + state.solution,
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
  bodyAttrs: {
    class: 'test'
  },
  script: [ { children: 'console.log(\'Hello world\')' } ]
})


const wonGame = computed(() => state.guesses[state.currentGuessIndex - 1] === state.solution)

const lostGame = computed(() => !wonGame.value && state.currentGuessIndex >= 6)

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

const handleInput = (key) => {
  if (state.currentGuessIndex >= 6 || wonGame.value) {
    return;
  }

  const currentGuess = state.guesses[state.currentGuessIndex];

  if (key == "{enter}") {
    if (currentGuess.length == 5) {
      if (validWords.has(currentGuess)) {
        console.log('valid guess')
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
      } else {
        console.log('invalid guess')
      }
    }
  }
  else if (key == "{bksp}") {
    state.guesses[state.currentGuessIndex] = currentGuess.slice(0, -1)
  } else if (currentGuess.length < 5 && /^[a-z]{1}$/.test(key)) {
      state.guesses[state.currentGuessIndex] += key;
  }
}

onMounted(() => {
  

  if (route.fullPath.length > 1) {
    state.cipher = route.fullPath.split('?')[1]
  }
  const plaintextGame = decryptGame(state.cipher);
  loadGame(plaintextGame)
  window.addEventListener('keyup', (e) => {
    e.preventDefault();
    const key = e.key == "Backspace" ? "{bksp}" : e.key == "Enter" ? "{enter}" : e.key.toLowerCase();
    handleInput(key)
  })
})
</script>