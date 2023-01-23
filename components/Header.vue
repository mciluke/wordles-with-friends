<template lang="pug">
.container.mx-auto.flex.flex-wrap.p-5.flex-col.items-center(class='md:flex-row')
  //- a.flex.title-font.font-medium.items-center.text-gray-900.mb-4(class='md:mb-0' href='#' target='_blank')
  //-   svg.w-10.h-10.text-white.p-2.bg-indigo-500.rounded-full(xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewbox='0 0 24 24')
  //-     path(d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5')
  span(class="ml-3 text-white font-semibold text-xl") Wordle with Friends
  nav.flex.flex-wrap.items-center.text-base.justify-center(class='md:ml-auto')
  NuxtLink(to="/create" class="flex items-center bg-zinc-400 border-0 py-1 px-3 rounded text-white text-base mt-4 focus:outline-none hover:bg-zinc-500 md:mt-0") Create a challenge 
    svg.w-4.h-4.ml-1(fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewbox='0 0 24 24')
      path(d='M5 12h14M12 5l7 7-7 7')
</template>