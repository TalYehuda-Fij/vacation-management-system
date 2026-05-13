import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    {
      path: '/requests',
      component: () => import('../views/RequesterView.vue'),
      meta: { requiresAuth: true, role: 'requester' },
    },
    {
      path: '/dashboard',
      component: () => import('../views/ValidatorView.vue'),
      meta: { requiresAuth: true, role: 'validator' },
    },
    {
      path: '/metrics',
      component: () => import('../views/MetricsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login';

  if (auth.isAuthenticated && !auth.user) await auth.fetchMe();

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return auth.user?.role === 'validator' ? '/dashboard' : '/requests';
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    return auth.user?.role === 'validator' ? '/dashboard' : '/requests';
  }
});

export default router;
