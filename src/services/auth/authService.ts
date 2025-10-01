/**
 * Auth Service - Staff Timetable System
 *
 * Servicio simple para verificación de autenticación
 * - Verifica presencia de token del sistema principal en localStorage
 * - Confía en el backend para validar tokens en cada request
 * - No hace peticiones adicionales de validación
 *
 * Métodos disponibles:
 * - isAuthenticated(): Verifica si hay token en localStorage
 * - getToken(): Obtiene token actual
 *
 * Nota: La seguridad real está en el backend - si el token es inválido,
 * el backend retornará 401 en las peticiones normales.
 */

export class AuthService {
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const authService = new AuthService()
