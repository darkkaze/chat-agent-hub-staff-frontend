<!--
Delete Staff Dialog

Diálogo de confirmación para borrado lógico de personal
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card>
      <v-card-title class="text-h6">
        Confirmar Desactivación
      </v-card-title>

      <v-card-text>
        ¿Estás seguro de que deseas desactivar a <strong>{{ staff?.name }}</strong>?
        <br><br>
        El personal desactivado no aparecerá en las listas activas, pero su información se conservará.
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="isLoading"
          @click="handleDelete"
        >
          Desactivar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { staffService } from '@/services/staff/staffService'
import type { Staff } from '@/types/staff'

const props = defineProps<{
  modelValue: boolean
  staff: Staff | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': [staffId: string]
}>()

// State
const isLoading = ref(false)

// Methods
const handleDelete = async () => {
  if (!props.staff) return

  isLoading.value = true

  try {
    await staffService.deleteStaff(props.staff.id)
    emit('deleted', props.staff.id)
    emit('update:modelValue', false)
  } catch (error: unknown) {
    console.error('Error deleting staff:', error)
    alert('Error al desactivar el personal')
  } finally {
    isLoading.value = false
  }
}
</script>
