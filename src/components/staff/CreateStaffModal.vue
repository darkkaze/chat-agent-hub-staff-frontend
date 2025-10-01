<!--
Create Staff Modal

Modal para crear un nuevo miembro del personal
- Input de nombre
- Schedule se inicia vacío (sin horarios)
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h6">Crear Personal</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleCreate">
          <v-text-field
            v-model="name"
            label="Nombre"
            placeholder="Ej: Juan Pérez"
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
          @click="handleCreate"
        >
          Crear
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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': [staff: Staff]
}>()

// State
const name = ref('')
const isLoading = ref(false)

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Campo requerido'
}

// Methods
const handleCancel = () => {
  name.value = ''
  emit('update:modelValue', false)
}

const handleCreate = async () => {
  if (!name.value.trim()) return

  isLoading.value = true

  try {
    const newStaff = await staffService.createStaff({
      name: name.value.trim(),
      schedule: JSON.stringify({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      })
    })

    emit('created', newStaff)
    name.value = ''
    emit('update:modelValue', false)
  } catch (error: unknown) {
    console.error('Error creating staff:', error)
    alert('Error al crear el personal')
  } finally {
    isLoading.value = false
  }
}
</script>
