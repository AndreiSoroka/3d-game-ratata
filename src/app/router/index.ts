import { createRouter, createWebHashHistory } from 'vue-router';
import GamePage from '@/pages/GamePage.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    {
      path: '/chat',
      name: 'ChatPage',
      component: () => import('@/pages/ChatPage.vue'),
    },
  ],
});

export default router;
