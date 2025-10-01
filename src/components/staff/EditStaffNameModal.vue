<!--
Edit Staff Name Modal

Modal para editar solo el nombre de un miembro del personal
El horario se edita en el componente principal
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h6">Editar Nombre</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSave">
          <v-text-field
            v-model="name"
            label="Nombre"
            :rules="[rules.required]"
            variant="outlined"
            density="compact"
            autofocus
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isLoading"
          @click="handleSave"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { staffService } from '@/services/staff/staffService'
import type { Staff } from '@/types/staff'

const props = defineProps<{
  modelValue: boolean
  staff: Staff | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': [staff: Staff]
}>()

// State
const name = ref('')
const isLoading = ref(false)

// Watch for staff changes to initialize name
watch(() => props.staff, (newStaff) => {
  if (newStaff) {
    name.value = newStaff.name
  }
}, { immediate: true })

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Campo requerido'
}

// Methods
const handleCancel = () => {
  if (props.staff) {
    name.value = props.staff.name
  }
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!props.staff || !name.value.trim()) return

  isLoading.value = true

  try {
    const updatedStaff = await staffService.updateStaff(props.staff.id, {
      name: name.value.trim(),
      schedule: props.staff.schedule  // Keep existing schedule
    })

    emit('updated', updatedStaff)
    emit('update:modelValue', false)
  } catch (error: unknown) {
    console.error('Error updating staff name:', error)
    alert('Error al actualizar el nombre')
  } finally {
    isLoading.value = false
  }
}
</script>
