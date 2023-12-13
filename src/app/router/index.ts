import { createRouter, createWebHistory } from 'vue-router';
import GamePage from '@/pages/GamePage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GamePage,
    },
    {
      path: '/multiplayer',
      name: 'MultiplayerPage',
      component: () => import('@/pages/MultiplayerPage.vue'),
    },
  ],
});

export default router;
