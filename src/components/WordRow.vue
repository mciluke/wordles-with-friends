<script setup>
import LetterBox from './LetterBox.vue';
const props = defineProps({
  value: String,
  solution: String,
  submitted: Boolean
})
</script>

<template lang="pug">
div(class="grid max-w-xs grid-cols-5 gap-1 mx-auto mb-1")
  LetterBox(v-for="i in 5", :key="i", :letter="value[i - 1]")
</template>