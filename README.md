# ⚡ ESA 短链接服务 - Edge URL Shortener

<div align="center">

一个基于阿里云ESA边缘计算的现代化短链接服务，提供快速、安全、可靠的URL缩短和分析功能

[🖥️ 在线演示](#) | [📖 文档](#使用说明)

</div>

---

## 📢 项目声明

**本项目由阿里云ESA提供加速、计算和保护**

<a href="https://esa.console.aliyun.com/">
   <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Alibaba Cloud ESA Support" style="max-width: 100%; height: auto;">
</a>

---

## 💡 项目介绍

### 🎯 应用价值 (Application Value)

本项目是一个**高度实用的短链接服务**，充分利用阿里云 ESA 边缘计算能力：

- ✅ **即用型服务**：部署后立即可用，无需任何配置
- ✅ **自定义短码**：支持自定义短链接别名，便于记忆和分享
- ✅ **实时分析**：实时追踪点击数据，了解链接访问情况
- ✅ **QR码生成**：自动生成二维码，方便移动端分享
- ✅ **管理后台**：完整的管理界面，可视化管理所有短链接
- ✅ **全球加速**：基于ESA边缘节点，全球访问超快响应

### ✨ 创意卓越 (Creative Excellence)

- 🎨 **现代化UI设计**：采用毛玻璃效果(Glassmorphism)、渐变色背景
- 🌊 **流畅动画**：卡片悬停动画、按钮交互动画，提升用户体验
- 📱 **响应式设计**：完美适配桌面、平板、手机等各种设备
- 🎯 **简洁直观**：一键生成短链接，操作简单明了
- 📊 **可视化数据**：统计数据以卡片形式展示，一目了然

### 🔥 技术探索 (Technical Exploration)

本项目**完整使用了阿里云ESA的边缘生态产品**，是真正的边缘计算应用：

#### 1. **ESA Pages 静态托管**
   - 使用 `esa.jsonc` 配置自动构建和部署
   - 支持 SPA 单页应用模式
   - 全球 CDN 加速，访问速度快

#### 2. **ESA 边缘函数 (Edge Functions)** ⭐
   - 实现短链接生成、重定向、管理等核心功能
   - 边缘计算，低延迟响应（<50ms）
   - 支持用户认证和权限验证
   - 代码位置：[src/edge-function.js](src/edge-function.js)

#### 3. **ESA Edge KV 存储** ⭐
   - 全球分布式键值存储
   - 数据 20 秒内全球同步
   - 持久化短链接数据和点击统计
   - 支持增删改查操作

#### 4. **Vue 3 + Vite 技术栈**
   - 使用 Vue 3 Composition API
   - Vue Router 实现前端路由
   - Vite 构建工具，开发体验优秀

#### 5. **性能优化**
   - CSS 和 JS 代码压缩
   - 边缘缓存策略
   - 响应式布局优化

---

## ✨ 核心功能

### 前台功能
- 🔗 **快速生成短链接** - 输入长URL，一键生成短链接
- 🎯 **自定义短码** - 支持自定义短链接别名
- 📱 **二维码生成** - 自动生成二维码，方便分享
- 📊 **实时统计** - 显示点击次数等统计信息
- 📋 **一键复制** - 快速复制短链接到剪贴板

### 后台管理功能 ⭐
- 🔐 **管理员登录** - 密码验证保护
- 📊 **统计概览** - 总链接数、总点击数、今日点击数
- 📋 **链接管理** - 查看所有短链接及其详细信息
- 🗑️ **删除链接** - 删除不需要的短链接
- 💾 **数据持久化** - 使用 ESA Edge KV 存储
- 🌍 **全球同步** - 数据 20 秒内全球生效

---

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/你的用户名/esa-url-shortener.git
   cd esa-url-shortener
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

### 部署到 ESA Pages

#### 前置条件
1. 开通阿里云 ESA 边缘安全加速产品
2. 开通"函数和Pages"服务
3. 拥有 GitHub 账号

#### 部署步骤

1. **在 ESA 控制台创建 Edge KV 命名空间**
   - 登录 ESA 控制台
   - 选择 边缘计算 > Edge KV
   - 创建命名空间，名称为：`url_shortener`

2. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/esa-url-shortener.git
   git push -u origin main
   ```

3. **在 ESA Pages 控制台关联 GitHub 仓库**
   - 访问 [ESA Pages 控制台](https://esa.console.aliyun.com/)
   - 选择 边缘计算 > 函数和Pages
   - 点击创建，选择导入 GitHub 仓库
   - 授权并选择你的仓库
   - ESA 会自动读取 `esa.jsonc` 配置并构建部署

4. **访问你的短链接服务**
   - 部署完成后，ESA 会提供访问 URL
   - 访问 `/admin` 路径进入后台管理
   - 默认密码：`admin123`（可在边缘函数中修改）

---

## 📦 技术栈

- **前端框架**: Vue 3
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **样式**: CSS3 (Glassmorphism)
- **边缘计算**: 阿里云 ESA Edge Functions ⭐
- **数据存储**: 阿里云 ESA Edge KV ⭐
- **部署平台**: 阿里云 ESA Pages
- **版本控制**: Git

---

## 📁 项目结构

```
esa-url-shortener/
├── index.html              # 入口 HTML
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
├── esa.jsonc              # ESA Pages 配置（含边缘函数入口）
├── public/
│   └── _redirects         # SPA 路由配置
└── src/
    ├── main.js            # Vue 入口
    ├── App.vue            # 根组件
    ├── style.css          # 全局样式
    ├── edge-function.js   # ⭐ ESA 边缘函数（核心API）
    └── views/
        ├── Home.vue       # 首页（短链接生成）
        └── Admin.vue      # ⭐ 后台管理
```

---

## 🎯 技术亮点

### 1. 完整的边缘计算架构 ⭐⭐⭐
- ✅ 使用 ESA Pages 静态托管
- ✅ 使用 ESA Edge Functions 实现后端 API
- ✅ 使用 ESA Edge KV 实现数据持久化
- ✅ 真正的 Serverless 架构，无需服务器

### 2. 全球分布式部署
- 数据存储在全球边缘节点
- 20 秒内全球同步
- 用户访问就近节点，低延迟（<50ms）

### 3. 现代化开发体验
- Vue 3 Composition API
- Vite 快速构建
- 热模块替换（HMR）
- Glassmorphism UI 设计

### 4. 安全可靠
- 管理员密码验证
- API 权限控制
- 数据持久化存储
- 全球 CDN 加速和保护

---

## 🔧 配置说明

### 边缘函数配置

在 [src/edge-function.js](src/edge-function.js) 中修改管理员密码：

```javascript
const ADMIN_PASSWORD = 'admin123'; // 修改为你的密码
const KV_NAMESPACE = 'url_shortener';   // KV 命名空间名称
```

### ESA Pages 配置

[esa.jsonc](esa.jsonc) 文件配置说明：

```jsonc
{
  "name": "esa-url-shortener",           // 项目名称
  "entry": "./src/edge-function.js",     // ⭐ 边缘函数入口
  "installCommand": "npm install",       // 安装命令
  "buildCommand": "npm run build",       // 构建命令
  "assets": {
    "directory": "./dist",               // 静态资源目录
    "notFoundStrategy": "singlePageApplication" // SPA 模式
  }
}
```

---

## 📖 使用说明

### 生成短链接

1. 访问首页
2. 输入要缩短的长URL
3. （可选）输入自定义短码
4. 点击"生成短链接"
5. 复制生成的短链接或扫描二维码

### 管理短链接

1. 访问 `/admin` 路径
2. 输入管理员密码登录（默认：admin123）
3. 查看统计数据和所有短链接
4. 可以删除不需要的短链接

---

## 🌟 项目特色

1. **边缘计算优势**：利用ESA边缘节点，全球访问速度快
2. **实用性强**：部署即用，适合个人和团队使用
3. **技术完整**：完整使用ESA生态（Pages + Functions + KV）
4. **界面美观**：现代化Glassmorphism设计
5. **开源免费**：MIT协议，可自由使用和修改

---

## 📄 开源协议

MIT License

---

## 🙏 致谢

感谢阿里云 ESA 提供的边缘计算平台支持！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

**🏆 参赛项目：阿里云ESA Pages 边缘开发大赛**

</div>
