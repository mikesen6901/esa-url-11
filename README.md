# ⚡ ESA 短链接服务 - Edge URL Shortener

<div align="center">

一个基于阿里云ESA边缘计算的现代化短链接服务，提供快速、安全、可靠的URL缩短功能

[🖥️ 在线演示](http://esa-url-11.0e384ff3.er.aliyun-esa.net) | [📖 GitHub](https://github.com/mikesen6901/esa-url-11)

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
- ✅ **QR码生成**：自动生成二维码，方便移动端分享
- ✅ **一键复制**：快速复制短链接到剪贴板
- ✅ **全球加速**：基于ESA边缘节点，全球访问超快响应

### ✨ 创意卓越 (Creative Excellence)

- 🎨 **现代化UI设计**：清爽简洁的界面设计，蓝色系配色
- 🌊 **流畅动画**：卡片悬停动画、按钮交互动画，提升用户体验
- 📱 **响应式设计**：完美适配桌面、平板、手机等各种设备
- 🎯 **简洁直观**：一键生成短链接，操作简单明了
- 💬 **Toast通知**：优雅的通知提示，替代浏览器原生弹窗
- 📐 **两列布局**：主操作区域采用两列布局，减少滚动，提升操作效率
- 💡 **功能说明**：顶部功能特色卡片，清晰展示所有功能

### 🔥 技术探索 (Technical Exploration)

本项目**完整使用了阿里云ESA的边缘生态产品**，是真正的边缘计算应用：

#### 1. **ESA Pages 静态托管**
   - 使用 `esa.jsonc` 配置自动构建和部署
   - 支持 SPA 单页应用模式
   - 全球 CDN 加速，访问速度快

#### 2. **ESA 边缘函数 (Edge Functions)** ⭐
   - 实现短链接生成、重定向等核心功能
   - 边缘计算，低延迟响应（<50ms）
   - 代码位置：[src/edge-function.js](src/edge-function.js)

#### 3. **ESA Edge KV 存储** ⭐
   - 全球分布式键值存储
   - 数据 20 秒内全球同步
   - 持久化短链接数据和点击统计
   

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

- 🔗 **快速生成短链接** - 输入长URL，一键生成短链接
- 🎯 **自定义短码** - 支持自定义短链接别名
- 📱 **二维码生成** - 自动生成二维码，方便分享
- 📋 **一键复制** - 快速复制短链接到剪贴板，带Toast提示
- 📊 **点击统计** - 自动记录短链接点击次数，实时查询
- ⏰ **过期时间** - 支持设置链接有效期（1小时/1天/7天/30天/永久）
- 🔄 **活码功能** - 使用管理密钥随时修改短链接目标URL，无需重新生成
- 📋 **最近创建** - 本地存储最近创建的5条短链接记录
- 🌍 **全球加速** - 基于ESA边缘节点，全球访问超快

---

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/你的用户名/esa-url-11.git
   cd esa-url-11
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
   git remote add origin https://github.com/你的用户名/esa-url-11.git
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
   - 开始使用短链接服务

---

## 📦 技术栈

- **前端框架**: Vue 3
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **样式**: CSS3 (现代化设计)
- **边缘计算**: 阿里云 ESA Edge Functions ⭐
- **数据存储**: 阿里云 ESA Edge KV ⭐
- **部署平台**: 阿里云 ESA Pages
- **版本控制**: Git

---

## 📁 项目结构

```
esa-url-11/
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
    ├── components/
    │   └── Toast.vue      # Toast 通知组件
    └── views/
        └── Home.vue       # 首页（短链接生成）
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
- 清爽简洁的 UI 设计

### 4. 用户体验优化
- Toast 通知替代原生弹窗
- 现代 Clipboard API 支持，带降级方案
- 优雅的加载状态
- 流畅的动画效果
- 两列布局减少滚动
- 本地存储最近创建记录

---

## 🔧 配置说明

### 边缘函数配置

在 [src/edge-function.js](src/edge-function.js) 中修改 KV 命名空间：

```javascript
const KV_NAMESPACE = 'url_shortener';   // KV 命名空间名称
```

### ESA Pages 配置

[esa.jsonc](esa.jsonc) 文件配置说明：

```jsonc
{
  "name": "esa-url-11",                  // 项目名称
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
4. （可选）选择过期时间
5. 点击"生成短链接"
6. 复制生成的短链接或扫描二维码
7. 保存管理密钥，用于后续修改目标URL（活码功能）

### 查询短链接统计

1. 在右侧"查询统计"卡片中输入短码
2. 点击"查询"按钮
3. 查看点击次数、创建时间、过期时间等信息

### 编辑短链接（活码功能）

1. 在右侧"编辑短链接"卡片中输入短码
2. 输入新的目标URL
3. 输入创建时获得的管理密钥
4. 点击"更新"按钮
5. 短链接的目标URL已更新，无需重新生成

### 查看最近创建

- 页面底部自动显示最近创建的10条短链接记录
- 点击"复制"按钮快速复制短链接

---

## 🌟 项目特色

1. **边缘计算优势**：利用ESA边缘节点，全球访问速度快
2. **实用性强**：部署即用，适合个人和团队使用
3. **技术完整**：完整使用ESA生态（Pages + Functions + KV）
4. **界面美观**：现代化清爽设计
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
