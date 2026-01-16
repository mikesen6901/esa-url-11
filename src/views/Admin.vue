<template>
  <div class="admin">
    <Toast :message="toastMessage" :type="toastType" />
    <div class="container">
      <header class="header">
        <h1 class="title">🔧 管理后台</h1>
        <router-link to="/" class="back-link">返回首页</router-link>
      </header>

      <div v-if="!isLoggedIn" class="glass-card login-card">
        <h2>管理员登录</h2>
        <form @submit.prevent="login">
          <input
            v-model="password"
            type="password"
            placeholder="请输入管理员密码"
            required
          />
          <button type="submit" class="btn btn-primary">登录</button>
        </form>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>

      <div v-else class="admin-content">
        <div class="glass-card stats-card">
          <h2>📊 统计概览</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-number">{{ links.length }}</div>
              <div class="stat-label">总链接数</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ totalClicks }}</div>
              <div class="stat-label">总点击数</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ todayClicks }}</div>
              <div class="stat-label">今日点击</div>
            </div>
          </div>
        </div>

        <div class="glass-card links-card">
          <h2>🔗 链接管理</h2>
          <div class="links-table">
            <table>
              <thead>
                <tr>
                  <th>短码</th>
                  <th>原始链接</th>
                  <th>点击数</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="link in links" :key="link.alias">
                  <td class="alias-cell">
                    <a :href="`/${link.alias}`" target="_blank">{{ link.alias }}</a>
                  </td>
                  <td class="url-cell">{{ link.longUrl }}</td>
                  <td>{{ link.clicks || 0 }}</td>
                  <td>{{ formatDate(link.createdAt) }}</td>
                  <td>
                    <button @click="deleteLink(link.alias)" class="btn-delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="links.length === 0" class="empty-state">暂无链接数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Toast from '../components/Toast.vue'

const isLoggedIn = ref(false)
const password = ref('')
const loginError = ref('')
const links = ref([])
const token = ref('')
const toastMessage = ref('')
const toastType = ref('success')

const totalClicks = computed(() => {
  return links.value.reduce((sum, link) => sum + (link.clicks || 0), 0)
})

const todayClicks = computed(() => {
  const today = new Date().toDateString()
  return links.value
    .filter(link => new Date(link.createdAt).toDateString() === today)
    .reduce((sum, link) => sum + (link.clicks || 0), 0)
})

onMounted(() => {
  const savedToken = localStorage.getItem('admin_token')
  if (savedToken) {
    token.value = savedToken
    isLoggedIn.value = true
    loadLinks()
  }
})

async function login() {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '登录失败')
    }

    token.value = data.token
    localStorage.setItem('admin_token', data.token)
    isLoggedIn.value = true
    loginError.value = ''
    loadLinks()
  } catch (e) {
    loginError.value = e.message
  }
}

async function loadLinks() {
  try {
    const response = await fetch('/api/admin/links', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '加载失败')
    }

    links.value = data.links || []
  } catch (e) {
    console.error('Failed to load links:', e)
  }
}

async function deleteLink(alias) {
  // 简单确认：直接删除并显示 Toast
  try {
    const response = await fetch(`/api/admin/links/${alias}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })

    if (!response.ok) {
      throw new Error('删除失败')
    }

    links.value = links.value.filter(link => link.alias !== alias)
    toastMessage.value = `短链接 "${alias}" 已删除`
    toastType.value = 'success'
  } catch (e) {
    toastMessage.value = e.message
    toastType.value = 'error'
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
}

.back-link {
  padding: 8px 16px;
  background: var(--card-bg);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  font-size: 14px;
}

.back-link:hover {
  color: var(--primary);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.login-card {
  max-width: 400px;
  margin: 0 auto;
}

.login-card h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

.login-card form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error {
  color: var(--danger);
  margin-top: 10px;
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-card {
  margin-bottom: 30px;
}

.stats-card h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-box {
  background: #f1f5f9;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.links-card h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

.links-card h2 {
  color: white;
  margin-bottom: 20px;
}

.links-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: rgba(255, 255, 255, 0.1);
}

th {
  padding: 15px;
  text-align: left;
  color: var(--text-primary);
  font-weight: 600;
  background: #f8fafc;
}

td {
  padding: 15px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

.alias-cell a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.alias-cell a:hover {
  text-decoration: underline;
}

.url-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-delete {
  padding: 6px 12px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 14px;
  }

  th, td {
    padding: 10px;
  }
}
</style>
