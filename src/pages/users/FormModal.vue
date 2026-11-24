<script setup lang="ts">
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { minLength } from '@vuelidate/validators'
import {
  FormAvatar,
  FormInput,
  FormPassword,
  FormSelect,
  UiButton,
  UiModal,
} from '@/components/utils'
import { useFormError } from '@/composables'
import { useRoleStore, useUserStore } from '@/stores'

const userStore = useUserStore()
const roleStore = useRoleStore()
const formError = useFormError()
const isVisible = ref(false)
const isEdit = computed(() => !!userStore.form.id)
const currentAvatar = ref<string | null>(null)

const dynamicRules = computed(() => {
  if (isEdit.value) {
    return {
      ...userStore.formRules,
      password: { minLength: minLength(6) },
    }
  }
  return userStore.formRules
})

const v$ = useVuelidate(dynamicRules, userStore.form)

// Roles are cached in the role store: fetched on the first modal open only,
// refetched automatically after a role is created/updated/deleted.
const roleOptions = computed(() =>
  roleStore.lookup.items.map((role) => ({ value: role.id, label: role.name })),
)

async function show(data?: {
  id?: number
  name: string
  email: string
  avatar?: string | null
  roles?: { id: number }[]
}) {
  roleStore.lookup.load() // no request if already cached
  if (data) {
    userStore.form.id = data.id
    userStore.form.name = data.name
    userStore.form.email = data.email
    userStore.form.password = ''
    userStore.form.password_confirmation = ''
    userStore.form.roles = data.roles?.map((r) => r.id) || []
    userStore.form.avatar = null
    currentAvatar.value = data.avatar || null
  } else {
    userStore.resetForm()
    currentAvatar.value = null
  }
  v$.value.$reset()
  formError.clear()
  isVisible.value = true
}

function close() {
  isVisible.value = false
}

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (isEdit.value && userStore.form.id) {
      await userStore.update(userStore.form.id)
    } else {
      await userStore.create()
    }
    close()
  } catch {
    // error already shown by the axios interceptor; keep the modal open
  }
}

defineExpose({ show, close })
</script>

<template>
  <UiModal
    v-model="isVisible"
    :title="isEdit ? 'Edit User' : 'Tambah User'"
    size="2xl"
    @close="close"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <FormAvatar v-model="userStore.form.avatar" :current-avatar="currentAvatar" />

        <FormInput
          v-model="userStore.form.name"
          name="name"
          label="Nama"
          placeholder="John Doe"
          :validation="v$.name"
        />

        <FormInput
          v-model="userStore.form.email"
          name="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          :validation="v$.email"
        />

        <FormPassword
          v-model="userStore.form.password"
          name="password"
          label="Password"
          :placeholder="isEdit ? 'Kosongkan jika tidak ingin mengubah' : 'password123'"
          :validation="v$.password"
        />

        <FormPassword
          v-model="userStore.form.password_confirmation"
          name="password_confirmation"
          label="Konfirmasi Password"
          placeholder="password123"
          :validation="v$.password_confirmation"
        />

        <FormSelect
          v-model="userStore.form.roles"
          name="roles"
          label="Roles"
          :options="roleOptions"
          placeholder="Pilih role..."
          mode="tags"
          :searchable="true"
          :loading="roleStore.lookup.loading"
        />
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-2">
        <UiButton
          type="button"
          variant="secondary"
          :disabled="userStore.loading.Form"
          outline
          @click="close"
        >
          Batal
        </UiButton>
        <UiButton type="submit" :loading="userStore.loading.Form">
          {{ isEdit ? 'Perbarui' : 'Simpan' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
