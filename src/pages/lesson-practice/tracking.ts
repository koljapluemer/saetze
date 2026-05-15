import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore } from 'firebase/firestore/lite'

const TRACKING_COLLECTION = 'saetze-data'
const USER_ID_STORAGE_KEY = 'saetze:user-id'

const firebaseConfig = {
  apiKey: 'AIzaSyBZkv2DoGbp1kk0sxdg9T3o9Z22b0cIPg0',
  authDomain: 'tpr-game.firebaseapp.com',
  projectId: 'tpr-game',
  storageBucket: 'tpr-game.firebasestorage.app',
  messagingSenderId: '213328104326',
  appId: '1:213328104326:web:bf6defc7e291d5fe267a07',
}

const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)

let userIdPromise: Promise<string> | null = null

export interface ExerciseFinishedEvent {
  completedOnFirstTry: boolean
  correctAnswer: string
  germanCloze: string
  lessonId: string
  timeOnExerciseMs: number
  timestamp: string
  wrongAnswer: string
  nativeLanguage: string
}

export function trackExerciseFinished(event: ExerciseFinishedEvent): void {
  void writeTrackingEvent(event)
}

async function writeTrackingEvent(event: ExerciseFinishedEvent): Promise<void> {
  try {
    const userId = await getOrCreateUserId()
    await addDoc(collection(firestore, TRACKING_COLLECTION), {
      ...event,
      userId,
    })
  } catch (error) {
    console.warn('Could not record tracking event.', error)
  }
}

function getOrCreateUserId(): Promise<string> {
  if (!userIdPromise) {
    userIdPromise = readOrCreateUserId()
  }

  return userIdPromise
}

async function readOrCreateUserId(): Promise<string> {
  const storage = getLocalStorage()
  if (!storage) {
    throw new Error('localStorage is required to persist the analytics user id.')
  }

  const storedUserId = storage.getItem(USER_ID_STORAGE_KEY)
  if (storedUserId) {
    return storedUserId
  }

  const generatedUserId = await createHashedUserId()
  storage.setItem(USER_ID_STORAGE_KEY, generatedUserId)
  return generatedUserId
}

async function createHashedUserId(): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error('Web Crypto is required to create a hashed analytics user id.')
  }

  const randomBytes = new Uint8Array(32)
  window.crypto.getRandomValues(randomBytes)
  const digest = await window.crypto.subtle.digest('SHA-256', randomBytes)
  return bytesToHex(new Uint8Array(digest))
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
