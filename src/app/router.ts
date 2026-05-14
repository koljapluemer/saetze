import { createRouter, createWebHistory } from 'vue-router'

import LessonPracticePage from '@/pages/lesson-practice/LessonPracticePage.vue'
import LessonSelectPage from '@/pages/lesson-select/LessonSelectPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: LessonSelectPage,
    },
    {
      path: '/lessons/:lessonId',
      component: LessonPracticePage,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
