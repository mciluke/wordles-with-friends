<template lang="pug">
Transition
  div(
    v-if="state.toastVisible"
    class="absolute bg-yellow-200 border border-yellow-300 bg-opacity-90 pl-2 pr-2 py-1 text-gray-700 top-20 rounded-sm shadow-lg transform -translate-x-1/2 left-1/2",  
  )
    svg.h-5.w-5.inline(xmlns='http://www.w3.org/2000/svg' viewbox='0 0 20 20' fill='currentColor')
      path(fill-rule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clip-rule='evenodd') 
    span(class="px-1") Invalid word entered.
</template>

<script setup>
import {reactive, onMounted } from 'vue';
const emit = defineEmits(["toastDone"]);

const props = defineProps({
  text: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: ""
  }
});

const state = reactive({
  toastVisible: true
})

onMounted(() => {
  // console.log(state.t)
  setTimeout(() => {
    state.toastVisible = false;
    setTimeout(() => emit("toastDone"), 525);
    return;
  }, 1000)
})

</script>
<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>