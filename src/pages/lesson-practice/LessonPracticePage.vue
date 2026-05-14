<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { fetchLessonExercises } from '@/entities/lesson-data/api'
import type { LessonExercise } from '@/entities/lesson-data/model'

const route = useRoute()

const lessonExercises = ref<LessonExercise[]>([])
const currentExercise = ref<LessonExercise | null>(null)
const displayedAnswers = ref<string[]>([])
const disabledAnswers = ref<string[]>([])
const revealedAnswer = ref('')
const isLoading = ref(true)
const loadError = ref('')

let advanceTimeoutId: number | null = null

const lessonId = computed(() => String(route.params.lessonId ?? ''))

const sentenceParts = computed(() => {
  if (!currentExercise.value) {
    return {
      after: '',
      before: '',
    }
  }

  const [before, ...rest] = currentExercise.value.cloze.split('＿')

  return {
    after: rest.join('＿'),
    before,
  }
})

function randomIndex(length: number) {
  return Math.floor(Math.random() * length)
}

function shuffleAnswers(answers: [string, string]) {
  return Math.random() < 0.5 ? [...answers] : [answers[1], answers[0]]
}

function clearAdvanceTimeout() {
  if (advanceTimeoutId !== null) {
    window.clearTimeout(advanceTimeoutId)
    advanceTimeoutId = null
  }
}

function showRandomExercise() {
  if (lessonExercises.value.length === 0) {
    currentExercise.value = null
    displayedAnswers.value = []
    disabledAnswers.value = []
    revealedAnswer.value = ''
    return
  }

  const nextExercise = lessonExercises.value[randomIndex(lessonExercises.value.length)]

  currentExercise.value = nextExercise
  displayedAnswers.value = shuffleAnswers(nextExercise.answers)
  disabledAnswers.value = []
  revealedAnswer.value = ''
}

function handleAnswer(answer: string) {
  if (!currentExercise.value || revealedAnswer.value) {
    return
  }

  const correctAnswer = currentExercise.value.answers[0]

  if (answer !== correctAnswer) {
    disabledAnswers.value = [...disabledAnswers.value, answer]
    return
  }

  revealedAnswer.value = correctAnswer
  clearAdvanceTimeout()
  advanceTimeoutId = window.setTimeout(() => {
    showRandomExercise()
    advanceTimeoutId = null
  }, 700)
}

async function loadLesson() {
  clearAdvanceTimeout()
  isLoading.value = true
  loadError.value = ''
  lessonExercises.value = []
  currentExercise.value = null
  displayedAnswers.value = []
  disabledAnswers.value = []
  revealedAnswer.value = ''

  try {
    const exercises = await fetchLessonExercises(lessonId.value)

    if (exercises.length === 0) {
      loadError.value = 'This lesson is empty.'
      return
    }

    lessonExercises.value = exercises
    showRandomExercise()
  } catch {
    loadError.value = 'Could not load this lesson.'
  } finally {
    isLoading.value = false
  }
}

watch(
  lessonId,
  () => {
    void loadLesson()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearAdvanceTimeout()
})
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-10">
    <div class="flex items-center justify-between gap-4">
      <RouterLink
        to="/"
        class="btn btn-ghost btn-sm px-0 text-base-content/70 hover:bg-transparent hover:text-base-content"
      >
        Back
      </RouterLink>
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/50">
        {{ lessonId }}
      </p>
    </div>

    <div
      v-if="isLoading"
      class="mt-16"
    >
      <span class="loading loading-spinner loading-lg text-base-content/60" />
    </div>

    <div
      v-else-if="loadError"
      class="alert alert-error mt-10 max-w-xl"
    >
      <span>{{ loadError }}</span>
    </div>

    <div
      v-else-if="currentExercise"
      class="mt-10 space-y-10"
    >
      <div class="space-y-4">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/55">
          English
        </p>
        <p class="text-2xl font-medium leading-tight text-base-content sm:text-3xl">
          {{ currentExercise.eng }}
        </p>
      </div>

      <div class="space-y-4">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/55">
          German
        </p>
        <p class="text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-5xl">
          <template v-if="revealedAnswer">
            {{ sentenceParts.before }}
            <span
              class="pulse-answer rounded-box bg-warning/20 px-2 py-1 text-warning-content shadow-sm"
            >
              {{ revealedAnswer }}
            </span>
            {{ sentenceParts.after }}
          </template>
          <template v-else>
            {{ currentExercise.cloze }}
          </template>
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="answer in displayedAnswers"
          :key="answer"
          type="button"
          class="btn btn-lg h-16 rounded-box text-lg font-semibold normal-case"
          :class="revealedAnswer === answer ? 'btn-success' : 'btn-neutral'"
          :disabled="disabledAnswers.includes(answer) || revealedAnswer.length > 0"
          @click="handleAnswer(answer)"
        >
          {{ answer }}
        </button>
      </div>
    </div>
  </main>
</template>
