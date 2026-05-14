export type LessonIndexEntry = {
  name: string
}

export type LessonIndex = Record<string, LessonIndexEntry>

export type LessonExercise = {
  eng: string
  cloze: string
  answers: [string, string]
  arb?: string
}
