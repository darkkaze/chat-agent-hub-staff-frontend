/**
 * Staff Timetable Application Configuration
 *
 * Configuración para el sistema de gestión de horarios del personal
 * - APIs en /staff-timetable/api
 * - Autenticación compartida con sistema principal
 */

const MODE = import.meta.env.MODE || 'localhost'

const configs = {
  localhost: {
    apiBaseUrl: 'http://localhost:8002/staff-timetable/api',
    debug: true,
    environment: 'local',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  development: {
    get apiBaseUrl() {
      return `${location.protocol}//${location.host}/staff-timetable/api`
    },
    debug: true,
    environment: 'development',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  production: {
    get apiBaseUrl() {
      return `${location.protocol}//${location.host}/staff-timetable/api`
    },
    debug: false,
    environment: 'production',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
}

export const config = configs[MODE as keyof typeof configs] || configs.localhost
