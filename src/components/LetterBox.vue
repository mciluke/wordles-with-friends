<script setup>
const props = defineProps({
  letter: {
    type: String,
    default: ""
  }
})
</script>
<template lang="pug">
div(class="uppercase border-2 border-gray-200 col-span-1 flex items-center justify-center h-16") {{ letter }} 
</template>