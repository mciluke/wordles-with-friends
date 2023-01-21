<script setup>
const props = defineProps({
  letter: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: ""
  }
})
</script>
<template lang="pug">
div(
  class="uppercase border-2 border-gray-200 col-span-1 flex items-center justify-center h-16 transition-all duration-300",
  :class="{'border-gray-500 bg-gray-500 text-white' : color == 'gray', 'border-green-600 bg-green-600 text-white' : color == 'green','border-yellow-500 bg-yellow-500 text-white' : color == 'yellow'}"
) {{ letter }} 
</template>