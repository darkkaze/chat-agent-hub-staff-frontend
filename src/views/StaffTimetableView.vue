<!--
Staff Timetable View

Vista principal para gestión de horarios del personal
- Lista de personal a la izquierda
- Editor de horarios a la derecha
- CRUD completo de personal
-->

<template>
  <div class="staff-timetable-view">
    <!-- Header -->
    <div class="header px-4 py-3 border-b">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h5 font-weight-medium">
            Gestión de Horarios de Personal
          </h1>
          <p class="text-caption text-on-surface-variant">
            Administra los horarios semanales del personal
          </p>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openCreateModal"
        >
          Crear Personal
        </v-btn>
      </div>
    </div>

    <!-- Main content -->
    <div class="content-wrapper">
      <!-- Staff List (Left side) -->
      <div class="staff-list">
        <div class="px-4 py-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar personal..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="mb-3"
          />

          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="Todos"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Staff Items -->
        <div v-else-if="filteredStaff.length" class="staff-items">
          <div
            v-for="item in filteredStaff"
            :key="item.id"
            :class="['staff-item', { 'staff-item-selected': selectedStaff?.id === item.id }]"
            @click="selectStaff(item)"
          >
            <div class="d-flex align-center">
              <v-avatar color="secondary" size="40" class="me-3">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
              <div class="flex-1-1">
                <div class="font-weight-medium">{{ item.name }}</div>
                <div v-if="item.email" class="text-caption text-grey">{{ item.email }}</div>
                <v-chip
                  :color="item.is_active ? 'success' : 'grey'"
                  size="x-small"
                  variant="tonal"
                  class="mt-1"
                >
                  {{ item.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>
            </div>

            <div class="staff-item-actions">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="primary"
                @click.stop="openEditModal(item)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click.stop="openDeleteDialog(item)"
              />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-account-off-outline</v-icon>
          <p class="text-body-2 text-grey mt-2">No se encontró personal</p>
        </div>
      </div>

      <!-- Timetable Editor (Right side) -->
      <div class="timetable-section">
        <StaffTimetableEditor
          :staff="selectedStaff"
          @updated="handleStaffUpdated"
        />
      </div>
    </div>

    <!-- Modals -->
    <CreateStaffModal
      v-model="showCreateModal"
      @created="handleStaffCreated"
    />

    <EditStaffNameModal
      v-model="showEditModal"
      :staff="editingStaff"
      @updated="handleStaffUpdated"
    />

    <DeleteStaffDialog
      v-model="showDeleteDialog"
      :staff="deletingStaff"
      @deleted="handleStaffDeleted"
    />

    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { staffService } from '@/services/staff/staffService'
import type { Staff } from '@/types/staff'
import StaffTimetableEditor from '@/components/staff/StaffTimetableEditor.vue'
import CreateStaffModal from '@/components/staff/CreateStaffModal.vue'
import EditStaffNameModal from '@/components/staff/EditStaffNameModal.vue'
import DeleteStaffDialog from '@/components/staff/DeleteStaffDialog.vue'

// State
const staff = ref<Staff[]>([])
const selectedStaff = ref<Staff | null>(null)
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const editingStaff = ref<Staff | null>(null)
const deletingStaff = ref<Staff | null>(null)

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Options
const statusOptions = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false }
]

// Computed
const filteredStaff = computed(() => {
  if (!staff.value || !Array.isArray(staff.value)) {
    return []
  }

  let filtered = [...staff.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => s.name.toLowerCase().includes(query))
  }

  // Status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter(s => s.is_active === statusFilter.value)
  }

  return filtered
})

// Methods
const loadStaff = async () => {
  isLoading.value = true

  try {
    const response = await staffService.getStaff()
    staff.value = response.staff

    // Select first staff by default if available
    if (staff.value.length > 0 && !selectedStaff.value) {
      selectedStaff.value = staff.value[0] || null
    }
  } catch (error: unknown) {
    console.error('Error loading staff:', error)
    showNotification('Error al cargar el personal', 'error')
  } finally {
    isLoading.value = false
  }
}

const selectStaff = (item: Staff) => {
  selectedStaff.value = item
}

const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Modal handlers
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (item: Staff) => {
  editingStaff.value = item
  showEditModal.value = true
}

const openDeleteDialog = (item: Staff) => {
  deletingStaff.value = item
  showDeleteDialog.value = true
}

// Event handlers
const handleStaffCreated = (newStaff: Staff) => {
  staff.value.unshift(newStaff)
  selectedStaff.value = newStaff
  showNotification(`Personal "${newStaff.name}" creado exitosamente`)
}

const handleStaffUpdated = (updatedStaff: Staff) => {
  const index = staff.value.findIndex(s => s.id === updatedStaff.id)
  if (index !== -1) {
    staff.value[index] = updatedStaff
  }

  // Update selected staff if it's the same one
  if (selectedStaff.value?.id === updatedStaff.id) {
    selectedStaff.value = updatedStaff
  }

  showNotification(`Personal "${updatedStaff.name}" actualizado exitosamente`)
}

const handleStaffDeleted = (staffId: string) => {
  const deletedStaff = staff.value.find(s => s.id === staffId)
  staff.value = staff.value.filter(s => s.id !== staffId)

  // Deselect if deleted staff was selected
  if (selectedStaff.value?.id === staffId) {
    selectedStaff.value = staff.value.length > 0 ? (staff.value[0] || null) : null
  }

  showNotification(`Personal "${deletedStaff?.name}" desactivado exitosamente`)
}

// Lifecycle
onMounted(() => {
  loadStaff()
})
</script>

<style scoped>
.staff-timetable-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

.header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.staff-list {
  width: 350px;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  overflow-y: auto;
}

.staff-items {
  display: flex;
  flex-direction: column;
}

.staff-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.staff-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.staff-item-selected {
  background: rgba(var(--v-theme-primary), 0.12);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.staff-item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.staff-item:hover .staff-item-actions {
  opacity: 1;
}

.timetable-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>
