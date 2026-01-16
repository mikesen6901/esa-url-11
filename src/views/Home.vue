<template>
  <div class="home">
    <Toast :message="toastMessage" :type="toastType" />
    <div class="container">
      <header class="header">
        <h1 class="title">⚡ ESA 短链接服务</h1>
        <p class="subtitle">基于阿里云边缘计算的快速短链接生成服务</p>
      </header>

      <div class="glass-card main-card">
        <h2>🔗 创建短链接</h2>
        <form @submit.prevent="createShortUrl" class="form">
          <div class="form-group">
            <label>原始链接</label>
            <input
              v-model="longUrl"
              type="url"
              placeholder="https://example.com/very/long/url"
              required
            />
          </div>

          <div class="form-group">
            <label>自定义短码 (可选)</label>
            <input
              v-model="customAlias"
              type="text"
              placeholder="my-link"
              pattern="[a-zA-Z0-9-_]+"
            />
            <small>只能包含字母、数字、横线和下划线</small>
          </div>

          <div class="form-group">
            <label>过期时间</label>
            <select v-model="expiryTime" class="expiry-select">
              <option value="0">永久有效</option>
              <option value="3600">1小时后过期</option>
              <option value="86400">1天后过期</option>
              <option value="604800">7天后过期</option>
              <option value="2592000">30天后过期</option>
            </select>
            <small>过期后短链接将自动失效</small>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '生成中...' : '生成短链接' }}
          </button>
        </form>

        <div v-if="result" class="result">
          <h3>✅ 短链接已生成</h3>
          <div class="short-url-box">
            <input :value="result.shortUrl" readonly class="short-url-input" ref="urlInput" />
            <button @click="copyUrl" class="btn btn-copy">{{ copied ? '已复制' : '复制' }}</button>
          </div>

          <div class="qr-section">
            <h4>📱 二维码</h4>
            <div class="qr-code" ref="qrCode"></div>
            <p class="qr-hint">扫描二维码访问链接</p>
          </div>

          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">原始链接:</span>
              <span class="stat-value">{{ result.longUrl }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">短码:</span>
              <span class="stat-value">{{ result.alias }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">点击次数:</span>
              <span class="stat-value">0</span>
            </div>
            <div class="stat-item highlight">
              <span class="stat-label">🔑 管理密钥:</span>
              <span class="stat-value">{{ result.editToken }}</span>
            </div>
          </div>
          <div class="warning-box">
            ⚠️ 请妥善保管管理密钥，使用它可以修改短链接的目标URL
          </div>
        </div>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>
      </div>

      <div class="glass-card main-card">
        <h2>📊 查询短链接统计</h2>
        <form @submit.prevent="queryStats" class="form">
          <div class="form-group">
            <label>短链接或短码</label>
            <input
              v-model="queryAlias"
              type="text"
              placeholder="输入短码，例如: abc123"
              required
            />
            <small>输入短码或完整短链接查看统计信息</small>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="queryLoading">
            {{ queryLoading ? '查询中...' : '查询统计' }}
          </button>
        </form>

        <div v-if="statsResult" class="result">
          <h3>📈 统计信息</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">短链接:</span>
              <span class="stat-value">{{ statsResult.shortUrl }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">原始链接:</span>
              <span class="stat-value">{{ statsResult.longUrl }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">点击次数:</span>
              <span class="stat-value">{{ statsResult.clicks }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">创建时间:</span>
              <span class="stat-value">{{ formatDate(statsResult.createdAt) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">过期时间:</span>
              <span class="stat-value">{{ statsResult.expiresAt ? formatDate(statsResult.expiresAt) : '永久有效' }}</span>
            </div>
          </div>
        </div>

        <div v-if="queryError" class="error-message">
          ❌ {{ queryError }}
        </div>
      </div>

      <div class="glass-card main-card">
        <h2>✏️ 编辑短链接</h2>
        <form @submit.prevent="updateShortUrl" class="form">
          <div class="form-group">
            <label>短码</label>
            <input
              v-model="editAlias"
              type="text"
              placeholder="输入要编辑的短码"
              required
            />
          </div>

          <div class="form-group">
            <label>新的目标URL</label>
            <input
              v-model="editLongUrl"
              type="url"
              placeholder="https://example.com/new-url"
              required
            />
          </div>

          <div class="form-group">
            <label>管理密钥</label>
            <input
              v-model="editToken"
              type="text"
              placeholder="输入管理密钥"
              required
            />
            <small>创建短链接时获得的管理密钥</small>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="editLoading">
            {{ editLoading ? '更新中...' : '更新短链接' }}
          </button>
        </form>

        <div v-if="editSuccess" class="success-message">
          ✅ 短链接已成功更新！
        </div>

        <div v-if="editError" class="error-message">
          ❌ {{ editError }}
        </div>
      </div>

      <div v-if="recentLinks.length > 0" class="glass-card main-card">
        <h2>📋 最近创建</h2>
        <div class="recent-links">
          <div v-for="link in recentLinks" :key="link.alias" class="recent-link-item">
            <div class="recent-link-info">
              <div class="recent-link-url">{{ link.shortUrl }}</div>
              <div class="recent-link-target">→ {{ link.longUrl }}</div>
              <div class="recent-link-meta">
                <span>{{ formatDate(link.createdAt) }}</span>
                <span v-if="link.expiresAt"> | 过期: {{ formatDate(link.expiresAt) }}</span>
              </div>
            </div>
            <div class="recent-link-actions">
              <button @click="copyToClipboard(link.shortUrl)" class="btn btn-small">复制</button>
            </div>
          </div>
        </div>
      </div>

      <div class="features">
        <div class="feature-card glass-card">
          <div class="feature-icon">⚡</div>
          <h3>边缘加速</h3>
          <p>基于阿里云ESA边缘节点，全球访问超快响应</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">📊</div>
          <h3>实时统计</h3>
          <p>实时追踪点击数据，了解链接访问情况</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">🔒</div>
          <h3>安全可靠</h3>
          <p>ESA边缘安全加速提供全方位保护</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Toast from '../components/Toast.vue'

const longUrl = ref('')
const customAlias = ref('')
const expiryTime = ref('0')
const loading = ref(false)
const result = ref(null)
const error = ref('')
const copied = ref(false)
const urlInput = ref(null)
const qrCode = ref(null)
const toastMessage = ref('')
const toastType = ref('success')

const queryAlias = ref('')
const queryLoading = ref(false)
const statsResult = ref(null)
const queryError = ref('')

const editAlias = ref('')
const editLongUrl = ref('')
const editToken = ref('')
const editLoading = ref(false)
const editSuccess = ref(false)
const editError = ref('')

async function createShortUrl() {
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        longUrl: longUrl.value,
        customAlias: customAlias.value || undefined,
        expiryTime: parseInt(expiryTime.value)
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '生成失败')
    }

    result.value = data

    // Save to localStorage
    saveToRecentLinks(data)

    // Generate QR code
    setTimeout(() => {
      generateQRCode(data.shortUrl)
    }, 100)

  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function copyUrl() {
  if (urlInput.value) {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(urlInput.value.value).then(() => {
        toastMessage.value = '✅ 短链接已复制到剪贴板'
        toastType.value = 'success'
        copied.value = true
        setTimeout(() => {
          copied.value = false
          toastMessage.value = ''
        }, 2000)
      }).catch(() => {
        // Fallback to old method
        fallbackCopy()
      })
    } else {
      // Browser doesn't support clipboard API
      fallbackCopy()
    }
  }
}

function fallbackCopy() {
  try {
    urlInput.value.select()
    document.execCommand('copy')
    toastMessage.value = '✅ 短链接已复制到剪贴板'
    toastType.value = 'success'
    copied.value = true
    setTimeout(() => {
      copied.value = false
      toastMessage.value = ''
    }, 2000)
  } catch (e) {
    toastMessage.value = '❌ 复制失败，请手动复制'
    toastType.value = 'error'
  }
}

function generateQRCode(url) {
  if (!qrCode.value) return

  // Simple QR code generation using API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  qrCode.value.innerHTML = `<img src="${qrApiUrl}" alt="QR Code" />`
}

async function queryStats() {
  queryLoading.value = true
  queryError.value = ''
  statsResult.value = null

  try {
    // Extract alias from full URL or use as-is
    let alias = queryAlias.value.trim()
    if (alias.includes('/')) {
      alias = alias.split('/').pop()
    }

    const response = await fetch(`/api/stats/${alias}`)
    const data = await response.json()

    if (!response.ok) {
      queryError.value = data.error || '查询失败'
      return
    }

    statsResult.value = {
      ...data,
      shortUrl: `${window.location.origin}/${data.alias}`
    }
  } catch (e) {
    queryError.value = '查询失败，请检查网络连接'
  } finally {
    queryLoading.value = false
  }
}

async function updateShortUrl() {
  editLoading.value = true
  editError.value = ''
  editSuccess.value = false

  try {
    const response = await fetch(`/api/update/${editAlias.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        longUrl: editLongUrl.value,
        editToken: editToken.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      editError.value = data.error || '更新失败'
      return
    }

    editSuccess.value = true
    toastMessage.value = '✅ 短链接已成功更新'
    toastType.value = 'success'

    // Clear form after 2 seconds
    setTimeout(() => {
      editSuccess.value = false
      editAlias.value = ''
      editLongUrl.value = ''
      editToken.value = ''
      toastMessage.value = ''
    }, 2000)
  } catch (e) {
    editError.value = '更新失败，请检查网络连接'
  } finally {
    editLoading.value = false
  }
}

// localStorage management functions
const RECENT_LINKS_KEY = 'esa_recent_links'
const MAX_RECENT_LINKS = 10

function saveToRecentLinks(linkData) {
  try {
    const recentLinks = getRecentLinks()
    const newLink = {
      ...linkData,
      createdAt: new Date().toISOString()
    }

    // Add to beginning of array
    recentLinks.unshift(newLink)

    // Keep only the most recent links
    const trimmedLinks = recentLinks.slice(0, MAX_RECENT_LINKS)

    localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(trimmedLinks))

    // Update reactive state
    recentLinks.value = trimmedLinks
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

function getRecentLinks() {
  try {
    const stored = localStorage.getItem(RECENT_LINKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
    return []
  }
}

const recentLinks = ref(getRecentLinks())

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toastMessage.value = '✅ 已复制到剪贴板'
      toastType.value = 'success'
      setTimeout(() => {
        toastMessage.value = ''
      }, 2000)
    }).catch(() => {
      // Fallback to execCommand if clipboard API fails
      fallbackCopyText(text)
    })
  } else {
    // Browser doesn't support clipboard API, use fallback
    fallbackCopyText(text)
  }
}

function fallbackCopyText(text) {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)

    toastMessage.value = '✅ 已复制到剪贴板'
    toastType.value = 'success'
    setTimeout(() => {
      toastMessage.value = ''
    }, 2000)
  } catch (e) {
    toastMessage.value = '❌ 复制失败，请手动复制'
    toastType.value = 'error'
    setTimeout(() => {
      toastMessage.value = ''
    }, 2000)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.admin-link {
  display: inline-block;
  padding: 8px 16px;
  background: var(--card-bg);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  font-size: 14px;
}

.admin-link:hover {
  color: var(--primary);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.main-card {
  max-width: 700px;
  margin: 0 auto 40px;
}

.main-card h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group small {
  display: block;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 6px;
}

.expiry-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.expiry-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.result {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.result h3 {
  color: var(--success);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.short-url-box {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.short-url-input {
  flex: 1;
  font-weight: 600;
  color: var(--primary);
}

.btn-copy {
  background: var(--success);
  color: white;
  white-space: nowrap;
}

.qr-section {
  text-align: center;
  margin: 30px 0;
}

.qr-section h4 {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
}

.qr-code {
  display: inline-block;
  padding: 15px;
  background: white;
  border-radius: 15px;
  margin-bottom: 10px;
}

.qr-code img {
  display: block;
}

.qr-hint {
  color: var(--text-secondary);
  font-size: 13px;
}

.stats {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
}

.stat-value {
  color: var(--text-primary);
  word-break: break-all;
  font-size: 14px;
}

.stat-item.highlight {
  background: #fef3c7;
  padding: 12px;
  margin: 0 -16px;
  border-radius: 8px;
}

.warning-box {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
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

.success-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
  font-weight: 500;
}

.recent-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.2s;
}

.recent-link-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.recent-link-info {
  flex: 1;
  min-width: 0;
}

.recent-link-url {
  font-weight: 600;
  color: var(--primary);
  font-size: 15px;
  margin-bottom: 4px;
}

.recent-link-target {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-link-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.recent-link-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .title {
    font-size: 36px;
  }

  .short-url-box {
    flex-direction: column;
  }
}
</style>
