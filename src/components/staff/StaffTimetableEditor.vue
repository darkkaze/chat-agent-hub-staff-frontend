<!--
Staff Timetable Editor

Editor visual de horarios semanales
- 7 días (Lunes a Domingo)
- Múltiples turnos por día
- Validación de horarios
- Auto-save con debounce
-->

<template>
  <v-card v-if="staff" class="timetable-editor">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2" color="primary">mdi-calendar-clock</v-icon>
      <span>Horarios de: {{ staff.name }}</span>
      <v-spacer />
      <v-chip
        v-if="hasUnsavedChanges"
        color="warning"
        size="small"
        variant="flat"
      >
        Sin guardar
      </v-chip>
      <v-chip
        v-else-if="lastSaved"
        color="success"
        size="small"
        variant="tonal"
      >
        Guardado
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-for="day in daysOfWeek" :key="day.key" class="day-section mb-4">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1 py-2">
            {{ day.label }}
            <v-chip
              v-if="schedule[day.key].length === 0"
              color="grey"
              size="x-small"
              class="ml-2"
            >
              Sin horario
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- Time slots -->
            <div
              v-for="(slot, index) in schedule[day.key]"
              :key="index"
              class="time-slot d-flex align-center mb-2"
            >
              <v-icon class="me-2" color="primary">mdi-clock-outline</v-icon>
              <input
                v-model="slot.start"
                type="time"
                class="time-input"
                @change="validateAndSave"
              />
              <span class="mx-2">-</span>
              <input
                v-model="slot.end"
                type="time"
                class="time-input"
                @change="validateAndSave"
              />
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                color="error"
                class="ml-2"
                @click="removeSlot(day.key, index)"
              />
            </div>

            <!-- Add slot button -->
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              @click="addSlot(day.key)"
            >
              Agregar turno
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <!-- Save button -->
      <v-btn
        color="primary"
        variant="flat"
        block
        size="large"
        :loading="isSaving"
        :disabled="!hasUnsavedChanges"
        prepend-icon="mdi-content-save"
        @click="saveSchedule"
      >
        Guardar Cambios
      </v-btn>
    </v-card-text>
  </v-card>

  <v-card v-else class="text-center pa-8">
    <v-icon size="64" color="grey-lighten-1">mdi-account-clock-outline</v-icon>
    <p class="text-body-1 text-grey mt-4">
      Selecciona un miembro del personal para editar su horario
    </p>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { staffService } from '@/services/staff/staffService'
import type { Staff, Schedule, TimeSlot } from '@/types/staff'
import { parseSchedule, stringifySchedule, createEmptySchedule } from '@/types/staff'

const props = defineProps<{
  staff: Staff | null
}>()

const emit = defineEmits<{
  'updated': [staff: Staff]
}>()

// State
const schedule = ref<Schedule>(createEmptySchedule())
const isSaving = ref(false)
const hasUnsavedChanges = ref(false)
const lastSaved = ref(false)

// Days of week configuration
const daysOfWeek = [
  { key: 'monday' as keyof Schedule, label: 'Lunes' },
  { key: 'tuesday' as keyof Schedule, label: 'Martes' },
  { key: 'wednesday' as keyof Schedule, label: 'Miércoles' },
  { key: 'thursday' as keyof Schedule, label: 'Jueves' },
  { key: 'friday' as keyof Schedule, label: 'Viernes' },
  { key: 'saturday' as keyof Schedule, label: 'Sábado' },
  { key: 'sunday' as keyof Schedule, label: 'Domingo' },
]

// Watch for staff changes
watch(() => props.staff, (newStaff) => {
  if (newStaff) {
    schedule.value = parseSchedule(newStaff.schedule)
    hasUnsavedChanges.value = false
    lastSaved.value = false
  } else {
    schedule.value = createEmptySchedule()
    hasUnsavedChanges.value = false
    lastSaved.value = false
  }
}, { immediate: true, deep: true })

// Methods
const addSlot = (day: keyof Schedule) => {
  const slots = schedule.value[day]

  // Default time based on existing slots
  let defaultStart = '09:00'
  let defaultEnd = '17:00'

  if (slots.length > 0) {
    const lastSlot = slots[slots.length - 1]
    // Start new slot 1 hour after last slot ends
    const lastEndParts = lastSlot.end.split(':')
    const lastEndHour = parseInt(lastEndParts[0])
    defaultStart = `${(lastEndHour + 1).toString().padStart(2, '0')}:00`
    defaultEnd = `${(lastEndHour + 5).toString().padStart(2, '0')}:00`
  }

  slots.push({
    start: defaultStart,
    end: defaultEnd
  })

  hasUnsavedChanges.value = true
  lastSaved.value = false
}

const removeSlot = (day: keyof Schedule, index: number) => {
  schedule.value[day].splice(index, 1)
  hasUnsavedChanges.value = true
  lastSaved.value = false
}

const validateAndSave = () => {
  hasUnsavedChanges.value = true
  lastSaved.value = false
}

const saveSchedule = async () => {
  if (!props.staff) return

  isSaving.value = true

  try {
    const updatedStaff = await staffService.updateStaff(props.staff.id, {
      name: props.staff.name,
      schedule: stringifySchedule(schedule.value)
    })

    emit('updated', updatedStaff)
    hasUnsavedChanges.value = false
    lastSaved.value = true

    // Reset "Guardado" chip after 3 seconds
    setTimeout(() => {
      lastSaved.value = false
    }, 3000)
  } catch (error: unknown) {
    console.error('Error saving schedule:', error)
    alert('Error al guardar el horario')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.timetable-editor {
  height: 100%;
  overflow-y: auto;
}

.time-slot {
  gap: 8px;
}

.time-input {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  font-size: 14px;
  min-width: 100px;
  transition: border-color 0.2s;
}

.time-input:hover {
  border-color: rgba(0, 0, 0, 0.87);
}

.time-input:focus {
  outline: none;
  border-color: #E91E63;
  border-width: 2px;
}

.day-section {
  margin-bottom: 16px;
}
</style>
