import { createRouter, createWebHistory } from 'vue-router'
import StaffLayout from '@/layouts/StaffLayout.vue'
import StaffTimetableView from '@/views/StaffTimetableView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: StaffLayout,
      children: [
        {
          path: '',
          name: 'staff-timetable',
          component: StaffTimetableView,
          meta: {
            title: 'Gestión de Horarios'
          }
        }
      ]
    },
    // Redirect any unmatched routes to main view
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Navigation guard with authentication check
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Agent Hub`
  } else {
    document.title = 'Staff Timetable - Agent Hub'
  }

  const authStore = useAuthStore()

  // Check if user has token in localStorage
  if (!authStore.isAuthenticated) {
    // No token found, redirect to main system for authentication
    console.log('Staff Timetable access denied: No authentication token. Redirecting to main system.')

    // Get the domain from the current URL to redirect to the main system
    const currentHost = window.location.host
    const protocol = window.location.protocol
    const mainSystemUrl = `${protocol}//${currentHost}/`

    // Redirect to main system
    window.location.href = mainSystemUrl
    return
  }

  // Token exists, continue navigation
  // Backend will validate token in actual API calls
  next()
})

export default router
