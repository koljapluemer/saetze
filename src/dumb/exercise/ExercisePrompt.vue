<script setup lang="ts">
import { computed } from 'vue'

import type { LessonExercise } from '@/entities/lesson-data/model'

const props = withDefaults(
  defineProps<{
    exercise: LessonExercise
    revealedAnswer?: string
  }>(),
  {
    revealedAnswer: undefined,
  },
)

const clozeParts = computed(() => {
  const [before, ...rest] = props.exercise.cloze.split('＿')

  return {
    after: rest.join('＿'),
    before,
  }
})
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-base-content/55">
      English
    </p>

    <p class="text-lg leading-7 text-base-content/80">
      {{ exercise.eng }}
    </p>

    <p class="text-3xl font-semibold leading-tight tracking-tight text-base-content sm:text-4xl">
      <template v-if="revealedAnswer">
        {{ clozeParts.before }}
        <span
          class="pulse-answer rounded-box bg-warning/20 px-2 py-1 text-warning-content shadow-sm"
        >
          {{ revealedAnswer }}
        </span>
        {{ clozeParts.after }}
      </template>
      <template v-else>
        {{ exercise.cloze }}
      </template>
    </p>
  </div>
</template>
