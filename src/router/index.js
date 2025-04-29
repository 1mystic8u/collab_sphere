import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import { auth } from '../firebase';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Auth/Register.vue')
  },
  { path : '/home',
    name: 'Home',
    component: () => import('../views/Project/userhome.vue')
  },
  {

  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('../views/Project/Discover.vue')
  },
  {
    path: '/project/:id',
    name: 'ProjectDetails',
    component: () => import('../views/Project/Details.vue')
  },
  {
    path: '/create-project',
    name: 'CreateProject',
    component: () => import('../views/Project/Create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = auth.currentUser;

  if (requiresAuth && !currentUser) {
    next('/login');
  } else {
    next();
  }
});

export default router;