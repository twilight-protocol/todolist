# 待办事项 · Todo

一个轻量、流畅的待办事项管理工具，纯前端实现，支持拖拽排序与本地持久化。

![Todo App 界面预览](https://twilight-protocol.github.io/todolist/)

## ✨ 功能特性

- ➕ 添加新待办（自动去空格，长度限制200字符）
- ✅ 勾选/取消勾选完成状态
- 🗑️ 删除单条待办
- ↕️ 上移 / 下移调整顺序
- 🖱️ 拖拽排序（支持鼠标与触摸屏）
- 📋 筛选视图：全部 / 未完成 / 已完成
- 💾 数据自动保存至浏览器 `localStorage`
- 📱 响应式设计，适配移动端与桌面端

## 🛠️ 技术实现

- **HTML5** 语义化结构
- **CSS3** 自定义样式（无外部UI库）
- **原生 JavaScript (ES Module)** 模块化开发
  - `app.js` —— 主逻辑、渲染、事件处理
  - `filter.js` —— 筛选条件与UI联动
  - `storage.js` —— 本地存储读写与容错

## 📁 项目结构

├── index.html # 入口页面
├── styles.css # 全局样式
├── js/
│ ├── app.js # 应用核心逻辑
│ ├── filter.js # 筛选工具函数
│ └── storage.js # localStorage 封装
└── README.md

## 🚀 快速开始

1. 克隆或下载本项目到本地
2. 使用任意静态服务器打开 `index.html`（例如 VS Code Live Server）
3. 或直接双击 `index.html` 在浏览器中运行（需支持 ES Module）

> 推荐使用本地服务器运行，以确保模块正常加载。

## 📦 浏览器兼容性

- Chrome / Edge / Firefox / Safari 最新版
- 支持 ES6 模块与 `localStorage` 的现代浏览器
- 移动端 Safari / Chrome 完美支持触摸拖拽

## 📝 本地存储说明

- 数据保存在 `localStorage` 中，键名为 `todos`
- 存储格式为 JSON 数组，包含 `id`、`text`、`completed` 字段
- 当存储空间异常时，数据将仅保留在当前会话内存中，并给出提示

## 📄 许可

MIT License

---

_欢迎 Fork 和改进，让这个小工具更好用！_
