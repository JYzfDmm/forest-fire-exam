import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/practice/sequential',
    name: 'SequentialPractice',
    component: () => import('../views/Practice.vue'),
    props: { mode: 'sequential' }
  },
  {
    path: '/practice/random',
    name: 'RandomPractice',
    component: () => import('../views/Practice.vue'),
    props: { mode: 'random' }
  },
  {
    path: '/practice/category',
    name: 'CategoryPractice',
    component: () => import('../views/CategoryPractice.vue')
  },
  {
    path: '/practice/:category',
    name: 'SingleCategoryPractice',
    component: () => import('../views/Practice.vue')
  },
  {
    path: '/exam',
    name: 'Exam',
    component: () => import('../views/Exam.vue')
  },

  {
    path: '/wrong',
    name: 'WrongQuestions',
    component: () => import('../views/WrongQuestions.vue')
  },
  {
    path: '/wrong/practice',
    name: 'WrongPractice',
    component: () => import('../views/WrongPractice.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue')
  },
  {
    path: '/stats',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
