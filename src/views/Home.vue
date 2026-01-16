<template>
  <div class="home">
    <Toast :message="toastMessage" :type="toastType" />
    <div class="container">
      <header class="header">
        <h1 class="title">⚡ ESA 短链接服务</h1>
        <p class="subtitle">基于阿里云边缘计算的快速短链接生成服务</p>
      </header>

      <!-- 功能说明卡片 -->
      <div class="info-card glass-card">
        <h3>💡 功能特色</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-icon">🔗</span>
            <div>
              <strong>短链接生成</strong>
              <p>快速将长URL转换为简短易记的短链接</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🔄</span>
            <div>
              <strong>活码功能</strong>
              <p>使用管理密钥随时修改短链接的目标URL，无需重新生成</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">⏰</span>
            <div>
              <strong>过期时间</strong>
              <p>设置链接有效期，过期后自动失效</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📊</span>
            <div>
              <strong>访问统计</strong>
              <p>实时查看短链接的点击次数和详细信息</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 主操作区域 - 两列布局 -->
      <div class="main-grid">
        <!-- 左侧：创建短链接 -->
        <div class="glass-card">
          <h2>🔗 创建短链接</h2>
          <form @submit.prevent="createShortUrl" class="form">
            <div class="form-row">
              <div class="form-group">
                <label>原始链接</label>
                <input
                  v-model="longUrl"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>自定义短码 (可选)</label>
                <input
                  v-model="customAlias"
                  type="text"
                  placeholder="my-link"
                  pattern="[a-zA-Z0-9-_]+"
                />
              </div>
              <div class="form-group">
                <label>过期时间</label>
                <select v-model="expiryTime" class="expiry-select">
                  <option value="0">永久有效</option>
                  <option value="3600">1小时</option>
                  <option value="86400">1天</option>
                  <option value="604800">7天</option>
                  <option value="2592000">30天</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '生成中...' : '生成短链接' }}
            </button>
          </form>

          <div v-if="result" class="result">
            <h3>✅ 短链接已生成</h3>
            <div class="short-url-box">
              <input :value="result.shortUrl" readonly class="short-url-input" />
              <button @click="copyToClipboard(result.shortUrl)" class="btn btn-copy">复制</button>
            </div>

            <div class="result-grid">
              <div class="qr-section">
                <h4>📱 二维码</h4>
                <div class="qr-code" ref="qrCode"></div>
                <button @click="downloadQRCode" class="btn btn-small btn-download-qr">下载二维码</button>
              </div>

              <div class="stats">
                <div class="stat-item">
                  <span class="stat-label">短码:</span>
                  <span class="stat-value">{{ result.alias }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">管理密钥:</span>
                  <span class="stat-value">{{ result.editToken }}</span>
                </div>
                <div class="warning-box">
                  ⚠️ 保管好管理密钥，可用于修改目标URL（活码功能）
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            ❌ {{ error }}
          </div>
        </div>

        <!-- 右侧：查询和编辑 -->
        <div class="side-panel">
          <!-- 查询统计 -->
          <div class="glass-card compact-card">
            <h2>📊 查询统计</h2>
            <form @submit.prevent="queryStats" class="form">
              <div class="form-group">
                <input
                  v-model="queryAlias"
                  type="text"
                  placeholder="输入短码查询"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary btn-small" :disabled="queryLoading">
                {{ queryLoading ? '查询中...' : '查询' }}
              </button>
            </form>

            <div v-if="statsResult" class="result">
              <div class="stats compact">
                <div class="stat-item">
                  <span class="stat-label">点击:</span>
                  <span class="stat-value">{{ statsResult.clicks }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">创建:</span>
                  <span class="stat-value">{{ formatDate(statsResult.createdAt) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">过期:</span>
                  <span class="stat-value">{{ statsResult.expiresAt ? formatDate(statsResult.expiresAt) : '永久' }}</span>
                </div>
              </div>
            </div>

            <div v-if="queryError" class="error-message">
              ❌ {{ queryError }}
            </div>
          </div>

          <!-- 编辑短链接 -->
          <div class="glass-card compact-card">
            <h2>✏️ 编辑短链接</h2>
            <form @submit.prevent="updateShortUrl" class="form">
              <div class="form-group">
                <input
                  v-model="editAlias"
                  type="text"
                  placeholder="短码"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="editLongUrl"
                  type="url"
                  placeholder="新的目标URL"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="editToken"
                  type="text"
                  placeholder="管理密钥"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary btn-small" :disabled="editLoading">
                {{ editLoading ? '更新中...' : '更新' }}
              </button>
            </form>

            <div v-if="editSuccess" class="success-message">
              ✅ 更新成功！
            </div>

            <div v-if="editError" class="error-message">
              ❌ {{ editError }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最近创建 -->
      <div v-if="recentLinks.length > 0" class="glass-card">
        <h2>📋 最近创建</h2>
        <div class="recent-links">
          <div v-for="link in recentLinks" :key="link.alias" class="recent-link-item">
            <div class="recent-link-info">
              <div class="recent-link-url">{{ link.shortUrl }}</div>
              <div class="recent-link-meta">
                <span>{{ formatDate(link.createdAt) }}</span>
                <span v-if="link.expiresAt"> | 过期: {{ formatDate(link.expiresAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <p class="footer-text">
            ⚡ 本服务由 <a href="https://www.alibabacloud.com/product/dcdn/esa" target="_blank" rel="noopener">阿里云 ESA</a> 提供边缘计算、加速和安全防护
          </p>
          <p class="footer-links">
            <a href="https://esa.console.aliyun.com/" target="_blank" rel="noopener">ESA 控制台</a>
            <span class="separator">|</span>
            <a href="https://github.com/mikesen6901/esa-url-11" target="_blank" rel="noopener">GitHub</a>
          </p>
        </div>
      </footer>
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

function generateQRCode(url) {
  if (!qrCode.value) return

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`

  qrCode.value.style.display = 'none'

  const img = new Image()
  img.onload = () => {
    qrCode.value.innerHTML = ''
    qrCode.value.appendChild(img)
    qrCode.value.style.display = 'flex'
  }
  img.src = qrApiUrl
  img.alt = 'QR Code'
}

function downloadQRCode() {
  if (!result.value) return

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(result.value.shortUrl)}`
  const link = document.createElement('a')
  link.href = qrApiUrl
  link.download = `qrcode-${result.value.alias}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toastMessage.value = '✅ 二维码已下载'
  toastType.value = 'success'
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
const MAX_RECENT_LINKS = 5

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
      toastMessage.value = ''
      setTimeout(() => {
        toastMessage.value = '✅ 已复制到剪贴板'
        toastType.value = 'success'
      }, 10)
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

    toastMessage.value = ''
    setTimeout(() => {
      toastMessage.value = '✅ 已复制到剪贴板'
      toastType.value = 'success'
    }, 10)
  } catch (e) {
    toastMessage.value = ''
    setTimeout(() => {
      toastMessage.value = '❌ 复制失败，请手动复制'
      toastType.value = 'error'
    }, 10)
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
  margin-bottom: 40px;
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
}

/* 功能说明卡片 */
.info-card {
  margin-bottom: 30px;
}

.info-card h3 {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.info-item strong {
  display: block;
  color: var(--text-primary);
  font-size: 15px;
  margin-bottom: 4px;
}

.info-item p {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

/* 主网格布局 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

/* 右侧面板 */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 紧凑卡片 - 完全重构 */
.compact-card {
  min-height: 550px;
  display: flex;
  flex-direction: column;
}

.compact-card h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.compact-card .form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.compact-card .form-group {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.compact-card .form .btn {
  margin-top: auto;
  width: 100%;
  flex-shrink: 0;
}

.compact-card .result,
.compact-card .success-message,
.compact-card .error-message {
  flex-shrink: 0;
}

.glass-card {
  min-height: 200px;
  overflow: hidden;
}

.glass-card h2 {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* 表单样式 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row:has(.form-group:only-child) {
  grid-template-columns: 1fr;
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
  margin-bottom: 0;
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
  margin-top: 24px;
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
  margin-bottom: 20px;
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

.result-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: start;
}

.qr-section {
  text-align: center;
}

.qr-section h4 {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.qr-code {
  display: inline-block;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border);
  min-height: 136px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code img {
  display: block;
  width: 120px;
  height: 120px;
}

.stats {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border);
}

.stats.compact {
  padding: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 13px;
}

.stat-value {
  color: var(--text-primary);
  word-break: break-all;
  font-size: 13px;
}

.warning-box {
  margin-top: 10px;
  padding: 8px 10px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
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
  word-break: break-all;
}

.recent-link-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-download-qr {
  margin-top: 10px;
  width: 100%;
  background: var(--primary);
  color: white;
}

/* Footer */
.footer {
  margin-top: 60px;
  padding: 30px 0;
  border-top: 1px solid var(--border);
  text-align: center;
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
}

.footer-text {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.footer-text a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}

.footer-links {
  color: var(--text-secondary);
  font-size: 13px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary);
}

.separator {
  margin: 0 12px;
  color: var(--border);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .side-panel {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 36px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .side-panel {
    flex-direction: column;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

  .short-url-box {
    flex-direction: column;
  }

  .footer {
    margin-top: 40px;
    padding: 20px 0;
  }
}
</style>
