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
          </div>
        </div>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
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
const loading = ref(false)
const result = ref(null)
const error = ref('')
const copied = ref(false)
const urlInput = ref(null)
const qrCode = ref(null)
const toastMessage = ref('')
const toastType = ref('success')

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
        customAlias: customAlias.value || undefined
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '生成失败')
    }

    result.value = data

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

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
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
