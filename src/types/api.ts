/**
 * API Types
 *
 * Common types for API communication
 */

export interface ApiError {
  detail: string
  type?: string
}

export interface ApiMessageResponse {
  message: string
}
