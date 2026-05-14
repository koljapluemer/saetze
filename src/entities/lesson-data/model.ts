export type LessonIndex = Record<string, string>

export type LessonSentence = [text: string, credit: string]

export type LessonExercise = {
  eng: LessonSentence
  cloze: string
  answers: [string, string]
  arb?: string
  deu_credit: string
}

export function getLessonSentenceText(sentence: LessonSentence) {
  return sentence[0]
}

export function getLessonSentenceCredit(sentence: LessonSentence) {
  return sentence[1]
}
