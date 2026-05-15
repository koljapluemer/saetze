<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { fetchLessonExercises } from '@/entities/lesson-data/api'
import {
  getLessonSentenceCredit,
  getLessonSentenceText,
  type LessonExercise,
} from '@/entities/lesson-data/model'
import { trackExerciseFinished } from '@/pages/lesson-practice/tracking'

type CreditToken =
  | {
      type: 'link'
      href: string
      text: string
    }
  | {
      type: 'text'
      text: string
    }

const route = useRoute()

const lessonExercises = ref<LessonExercise[]>([])
const currentExercise = ref<LessonExercise | null>(null)
const displayedAnswers = ref<string[]>([])
const disabledAnswers = ref<string[]>([])
const revealedAnswer = ref('')
const isLoading = ref(true)
const loadError = ref('')
const currentExerciseStartedAt = ref('')
const wrongAnswerCount = ref(0)

let advanceTimeoutId: number | null = null

const lessonId = computed(() => String(route.params.lessonId ?? ''))

const englishText = computed(() =>
  currentExercise.value ? getLessonSentenceText(currentExercise.value.eng) : '',
)

const englishCreditTokens = computed(() =>
  tokenizeCredit(currentExercise.value ? getLessonSentenceCredit(currentExercise.value.eng) : ''),
)

const germanCreditTokens = computed(() =>
  tokenizeCredit(currentExercise.value?.deu_credit ?? ''),
)

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

function tokenizeCredit(markdown: string): CreditToken[] {
  if (!markdown) {
    return []
  }

  const tokens: CreditToken[] = []
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0

  for (const match of markdown.matchAll(linkPattern)) {
    const [fullMatch, text, href] = match
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      tokens.push({
        text: markdown.slice(lastIndex, matchIndex),
        type: 'text',
      })
    }

    tokens.push({
      href,
      text,
      type: 'link',
    })

    lastIndex = matchIndex + fullMatch.length
  }

  if (lastIndex < markdown.length) {
    tokens.push({
      text: markdown.slice(lastIndex),
      type: 'text',
    })
  }

  return tokens
}

function showRandomExercise() {
  if (lessonExercises.value.length === 0) {
    currentExercise.value = null
    displayedAnswers.value = []
    disabledAnswers.value = []
    revealedAnswer.value = ''
    currentExerciseStartedAt.value = ''
    wrongAnswerCount.value = 0
    return
  }

  const nextExercise = lessonExercises.value[randomIndex(lessonExercises.value.length)]

  currentExercise.value = nextExercise
  displayedAnswers.value = shuffleAnswers(nextExercise.answers)
  disabledAnswers.value = []
  revealedAnswer.value = ''
  currentExerciseStartedAt.value = new Date().toISOString()
  wrongAnswerCount.value = 0
}

function handleAnswer(answer: string) {
  if (!currentExercise.value || revealedAnswer.value) {
    return
  }

  const correctAnswer = currentExercise.value.answers[0]

  if (answer !== correctAnswer) {
    disabledAnswers.value = [...disabledAnswers.value, answer]
    wrongAnswerCount.value += 1
    return
  }

  const timestamp = new Date().toISOString()
  const startedAt = currentExerciseStartedAt.value || timestamp
  const startedAtMs = new Date(startedAt).getTime()
  const completedAtMs = new Date(timestamp).getTime()
  const timeOnExerciseMs =
    Number.isFinite(startedAtMs) && Number.isFinite(completedAtMs)
      ? Math.max(0, completedAtMs - startedAtMs)
      : 0

  trackExerciseFinished({
    completedOnFirstTry: wrongAnswerCount.value === 0,
    correctAnswer,
    germanCloze: currentExercise.value.cloze,
    lessonId: lessonId.value,
    timeOnExerciseMs,
    timestamp,
    wrongAnswer: currentExercise.value.answers[1],
    nativeLanguage: 'eng'
  })

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
  currentExerciseStartedAt.value = ''
  wrongAnswerCount.value = 0

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
  <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10">
    <div class="flex items-center justify-between gap-4">
      <RouterLink
        to="/"
        class="btn btn-ghost btn-sm"
      >
        Back
      </RouterLink>
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
      class="mt-10 space-y-8"
    >
      <section class="space-y-3">
        <p class="badge badge-ghost">
          English
        </p>
        <p class="text-2xl sm:text-3xl">
          {{ englishText }}
        </p>
        <p
          v-if="englishCreditTokens.length > 0"
          class="text-sm text-base-content/70"
        >
          Source:
          <template
            v-for="(token, index) in englishCreditTokens"
            :key="`eng-credit-${index}`"
          >
            <a
              v-if="token.type === 'link'"
              :href="token.href"
              class="link link-hover"
              rel="noreferrer noopener"
              target="_blank"
            >
              {{ token.text }}
            </a>
            <span v-else>{{ token.text }}</span>
          </template>
        </p>
      </section>

      <section class="space-y-3">
        <p class="badge badge-ghost">
          German
        </p>
        <p class="text-3xl font-semibold sm:text-4xl">
          <template v-if="revealedAnswer">
            {{ sentenceParts.before }}
            <span class="rounded-box bg-warning px-1 text-warning-content">
              {{ revealedAnswer }}
            </span>
            {{ sentenceParts.after }}
          </template>
          <template v-else>
            {{ currentExercise.cloze }}
          </template>
        </p>
        <p
          v-if="germanCreditTokens.length > 0"
          class="text-sm text-base-content/70"
        >
          Source:
          <template
            v-for="(token, index) in germanCreditTokens"
            :key="`deu-credit-${index}`"
          >
            <a
              v-if="token.type === 'link'"
              :href="token.href"
              class="link link-hover"
              rel="noreferrer noopener"
              target="_blank"
            >
              {{ token.text }}
            </a>
            <span v-else>{{ token.text }}</span>
          </template>
        </p>
      </section>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="answer in displayedAnswers"
          :key="answer"
          type="button"
          class="btn btn-lg min-h-16 text-lg"
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
