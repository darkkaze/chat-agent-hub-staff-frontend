/**
 * Staff Service - Gestión de personal y horarios
 *
 * Available methods:
 * - getStaff(is_active?): Obtener todo el personal (filtrado por activo opcional)
 * - createStaff(data): Crear nuevo miembro del personal
 * - getStaffById(id): Obtener un miembro del personal específico
 * - updateStaff(id, data): Actualizar miembro del personal existente
 * - deleteStaff(id): Desactivar miembro del personal (soft delete)
 *
 * Note: Todas las operaciones requieren autenticación válida.
 */

import { apiService } from '@/services/api'
import type {
  Staff,
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest
} from '@/types/staff'
import type { ApiMessageResponse } from '@/types/api'

export const staffService = {
  /**
   * Obtener todo el personal (opcional: filtrar por activo)
   */
  async getStaff(is_active?: boolean): Promise<StaffListResponse> {
    const params = is_active !== undefined ? `?is_active=${is_active}` : ''
    return await apiService.get<StaffListResponse>(`/staff/${params}`)
  },

  /**
   * Crear un nuevo miembro del personal
   */
  async createStaff(staffData: CreateStaffRequest): Promise<Staff> {
    return await apiService.post<Staff>('/staff/', staffData)
  },

  /**
   * Obtener información de un miembro del personal específico
   */
  async getStaffById(staffId: string): Promise<Staff> {
    return await apiService.get<Staff>(`/staff/${staffId}`)
  },

  /**
   * Actualizar un miembro del personal existente
   */
  async updateStaff(staffId: string, staffData: UpdateStaffRequest): Promise<Staff> {
    return await apiService.put<Staff>(`/staff/${staffId}`, staffData)
  },

  /**
   * Desactivar miembro del personal (soft delete)
   */
  async deleteStaff(staffId: string): Promise<ApiMessageResponse> {
    return await apiService.delete<ApiMessageResponse>(`/staff/${staffId}`)
  }
}
