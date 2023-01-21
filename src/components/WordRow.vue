<script setup>
import LetterBox from './LetterBox.vue';
import { ref, watch } from 'vue';

const colors = ref(["", "", "", "", ""])

const props = defineProps({
  value: String,
  solution: String,
  submitted: Boolean,
});

watch(
  () => props.submitted,
  async (submitted, prevSubmitted) => {
    const temp = ["gray", "gray", "gray", "gray", "gray"];
    const letterPool = [];
    if (props.submitted) {
      for (let i = 0; i < 5; i++) {
        if (props.solution.charAt(i) == props.value.charAt(i)) {
          temp[i] = "green";
        } else {
          letterPool.push(props.solution.charAt(i))
        }
      }
    }
  }
)

</script>

<template lang="pug">
div(class="grid max-w-xs grid-cols-5 gap-1 mx-auto mb-1")
  LetterBox(v-for="i in 5", :key="i", :letter="value[i - 1]")
</template>