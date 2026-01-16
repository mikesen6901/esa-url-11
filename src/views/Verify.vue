<template>
  <div class="verify">
    <Toast :message="toastMessage" :type="toastType" />
    <div class="container">
      <div class="glass-card verify-card">
        <div class="lock-icon">🔒</div>
        <h2>此链接需要密码访问</h2>
        <p class="hint">请输入访问密码以继续</p>

        <form @submit.prevent="verifyPassword" class="form">
          <div class="form-group">
            <input
              v-model="password"
              type="password"
              placeholder="请输入访问密码"
              required
              autofocus
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '验证中...' : '访问链接' }}
          </button>
        </form>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from '../components/Toast.vue'

const route = useRoute()
const router = useRouter()

const password = ref('')
const loading = ref(false)
const error = ref('')
const toastMessage = ref('')
const toastType = ref('success')

const alias = ref('')

onMounted(() => {
  alias.value = route.params.alias
})

async function verifyPassword() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`/api/verify/${alias.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || '验证失败'
      return
    }

    // Password correct, redirect to target URL
    window.location.href = data.longUrl
  } catch (e) {
    error.value = '验证失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verify {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.verify-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.lock-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.verify-card h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.hint {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
