<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition
          name="route-fade"
          mode="out-in"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="mx-auto w-full max-w-5xl px-5 pb-5 pt-3 sm:px-8 sm:pb-6">
      <p class="text-center text-sm text-base-content/60">
        Made by
        <a
          href="https://koljasam.com/"
          class="link link-hover font-medium text-base-content/80"
        >Kolja Sam</a>. Free, no ads. I track page views and pseudonymous learning data.
      </p>
    </footer>
  </div>
</template>
