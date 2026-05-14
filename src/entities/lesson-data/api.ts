import type { LessonExercise, LessonIndex } from '@/entities/lesson-data/model'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`)
  }

  return (await response.json()) as T
}

export function fetchLessonIndex() {
  return fetchJson<LessonIndex>('/saetze-data/out/index.json')
}

export function fetchLessonExercises(lessonId: string) {
  return fetchJson<LessonExercise[]>(`/saetze-data/out/data/${lessonId}.json`)
}
