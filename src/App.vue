<script setup>
import { reactive, onMounted } from 'vue';
import SimpleKeyboard from './components/SimpleKeyboard.vue';
import WordRow from './components/WordRow.vue';

const state = reactive({
  solution: "books",
  guesses: ["", "", "", "", "", ""],
  currentGuessIndex: 0,
  guessedLetters: {
    miss: [],
    found: [],
    hint: []
  }
})

const handleInput = (key) => {
  if (state.currentGuessIndex >= 6) {
    return;
  }

  const currentGuess = state.guesses[state.currentGuessIndex];

  if (key == "{enter}") {
    if (currentGuess.length == 5) {
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
    }
  }
  else if (key == "{bksp}") {
    state.guesses[state.currentGuessIndex] = currentGuess.slice(0, -1)
  } else if (currentGuess.length < 5 && /^[a-z]{1}$/.test(key)) {
      state.guesses[state.currentGuessIndex] += key;
  }
}

onMounted(() => {
  window.addEventListener('keyup', (e) => {
    e.preventDefault();
    // console.log(e)
    const key = e.key == "Backspace" ? "{bksp}" : e.key == "Enter" ? "{enter}" : e.key.toLowerCase();
    handleInput(key)
  })
})
</script>

<template lang="pug">
div(class="flex flex-col h-screen max-w-md mx-auto justify-evenly")
  div
    WordRow(
      v-for="(guess, i) in state.guesses",
      :key="i", 
      :value="guess",
      :solution="state.solution",
      :submitted="i < state.currentGuessIndex",
    )
  SimpleKeyboard(
    @onKeyPress="handleInput",
    :guessedLetters="state.guessedLetters",
    )
</template>

<style></style>
