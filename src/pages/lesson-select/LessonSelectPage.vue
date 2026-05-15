<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchLessonIndex } from '@/entities/lesson-data/api'

const lessons = ref<[string, string][]>([])
const isLoading = ref(true)
const loadError = ref('')

async function loadLessons() {
  isLoading.value = true
  loadError.value = ''

  try {
    const lessonIndex = await fetchLessonIndex()
    lessons.value = Object.entries(lessonIndex)
  } catch {
    loadError.value = 'Could not load lessons.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadLessons()
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10">
    <div class="space-y-2">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/55">
        German
      </p>
      <h1 class="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
        Pick what you want to practice
      </h1>
    </div>

    <div
      v-if="isLoading"
      class="mt-10"
    >
      <span class="loading loading-spinner loading-md text-base-content/60" />
    </div>

    <div
      v-else-if="loadError"
      class="alert alert-error mt-10 max-w-xl"
    >
      <span>{{ loadError }}</span>
    </div>

    <div
      v-else
      class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <RouterLink
        v-for="[lessonId, lesson] in lessons"
        :key="lessonId"
        :to="`/lessons/${lessonId}`"
        class="card card-border bg-base-100 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="card-body p-5">
          <h2 class="card-title text-base">
            {{ lesson }}
          </h2>
        </div>
      </RouterLink>
    </div>
  </main>
</template>
