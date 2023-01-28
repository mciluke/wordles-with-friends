<template lang="pug">
div(class="container mx-auto flex flex-col flex-wrap p-5 items-center md:flex-row")
  span(class="ml-3 text-white font-semibold text-xl") Wordle with Friends
  nav.flex.flex-wrap.items-center.text-base.justify-center(class='md:ml-auto')
    NuxtLink(to="/create" class="flex items-center bg-zinc-400 border-0 py-1 px-3 mx-1 rounded text-white text-base mt-4 focus:outline-none hover:bg-zinc-500 md:mt-0") Instructions
    NuxtLink(to="/create" class="flex items-center bg-zinc-400 border-0 py-1 px-3 mx-1 rounded text-white text-base mt-4 focus:outline-none hover:bg-zinc-500 md:mt-0") Create a Wordle
  //- div(class="text-white") Instructions
  //- div(class="text-white") Create a Wordle
    //- svg.w-4.h-4.ml-1(fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewbox='0 0 24 24')
      path(d='M5 12h14M12 5l7 7-7 7')
</template>
