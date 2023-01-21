<template lang="pug">
div(class="simple-keyboard")
</template>

<script setup>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  guessedLetters: Object
})

const emit = defineEmits(["onKeyPress"]);

const keyboard = ref(null);

const onKeyPress = (button) => {
  emit("onKeyPress", button);
}

onMounted(() => {
  keyboard.value = new Keyboard("simple-keyboard", {
    layout: {
      default: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{enter} z x c v b n m {bksp}"
      ],
    },
    onKeyPress: onKeyPress
  })
});

watch(
  () => props.guessedLetters,
  (guessedLetters, prevGuessedLetters) => {
    keyboard.value.addButtonTheme(
      guessedLetters.miss.join(" "), "miss"
    );
    keyboard.value.addButtonTheme(
      guessedLetters.found.join(" "), "bg-green-600 text-white"
    );
    keyboard.value.addButtonTheme(
      guessedLetters.hint.join(" "), "bg-yellow-500 text-white"
    )
  },
  {deep: true}
)

</script>
div.miss {
  @apply bg-grey-500 !important;
  @apply text-white;
}
<style></style>