<template>
  <div class="flex flex-col h-screen bg-black">
    <player-container
      class="max-h-screen overflow-y-hidden"
      :exclude-plugins="['example_ui']"
      full-page
    />
  </div>
</template>

<style lang="css" scoped>
@reference '~/assets/css/main.css';
</style>
