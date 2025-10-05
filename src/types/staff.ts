/**
 * Staff Types
 *
 * Types for staff and timetable management
 */

export interface TimeSlot {
  start: string  // "HH:MM" format (e.g. "09:00")
  end: string    // "HH:MM" format (e.g. "17:00")
}

export interface Schedule {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface Staff {
  id: string
  name: string
  email?: string
  schedule: string  // JSON string of Schedule
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateStaffRequest {
  name: string
  email?: string
  schedule?: string
}

export interface UpdateStaffRequest {
  name: string
  email?: string
  schedule?: string
}

export interface StaffListResponse {
  staff: Staff[]
}

// Helper functions
export function parseSchedule(scheduleJson: string): Schedule {
  try {
    const parsed = JSON.parse(scheduleJson)
    // Ensure all days exist with default empty arrays
    return {
      monday: parsed.monday || [],
      tuesday: parsed.tuesday || [],
      wednesday: parsed.wednesday || [],
      thursday: parsed.thursday || [],
      friday: parsed.friday || [],
      saturday: parsed.saturday || [],
      sunday: parsed.sunday || [],
    }
  } catch {
    return createEmptySchedule()
  }
}

export function stringifySchedule(schedule: Schedule): string {
  return JSON.stringify(schedule)
}

export function createEmptySchedule(): Schedule {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }
}
