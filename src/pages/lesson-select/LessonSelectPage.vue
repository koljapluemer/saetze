<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchLessonIndex } from '@/entities/lesson-data/api'
import type { LessonIndex } from '@/entities/lesson-data/model'

const lessons = ref<[string, LessonIndex[string]][]>([])
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
  <main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-10">
    <div class="space-y-2">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/55">
        German
      </p>
      <h1 class="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
        Pick a lesson
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
      class="mt-10 space-y-3"
    >
      <RouterLink
        v-for="[lessonId, lesson] in lessons"
        :key="lessonId"
        :to="`/lessons/${lessonId}`"
        class="btn btn-lg h-auto justify-start rounded-box border-base-300 bg-base-100 px-5 py-4 text-left normal-case shadow-sm hover:-translate-y-0.5 hover:border-base-content/15 hover:bg-base-100"
      >
        <span class="block text-base font-semibold text-base-content">
          {{ lesson.name }}
        </span>
      </RouterLink>
    </div>
  </main>
</template>
