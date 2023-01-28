<template lang="pug">
div(class="flex flex-col items-center w-100 pb-5")
  div(
    v-for="row in keyboard"
    class="flex gap-1 my-0.5 w-fit"
    )
    button(
      v-for="key in row"
      class="h-14 grid items-center rounded font-semibold cursor-pointer bg-zinc-400 text-white hover:bg-zinc-500 uppercase",
      :class="[key.length === 1 ? 'w-7 sm:w-10' : 'p-2 sm:p-4', props.guessedLetters.found.includes(key) ? '!bg-green-600' : props.guessedLetters.hint.includes(key) ? '!bg-yellow-500' : props.guessedLetters.miss.includes(key) ? '!text-gray' : '']"
      @click="onKeyPress(key)"
    ) {{ key == 'backspace' ? '' : key }}
      svg(v-if="key == 'backspace'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6")
        path(stroke-linecap="round" stroke-linejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z")
        
</template>

<script setup>
const emit = defineEmits(['onKeyPress']);
const props = defineProps({
  guessedLetters: Object,
});

const keyboard = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

const onKeyPress = (button) => {
  emit('onKeyPress', button);
};
</script>

<style>
div.miss {
  @apply bg-gray-500 !important;
  @apply text-white;
}
div.found {
  @apply bg-green-600 !important;
  @apply text-white;
}
div.hint:not(.found) {
  @apply bg-yellow-600 !important;
  @apply text-white;
}
</style>
