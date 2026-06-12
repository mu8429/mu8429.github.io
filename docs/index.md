---
layout: home

hero:
  name: "mu8429's Blog"
  text: "探索AI工作流的无限可能"
  tagline: opencode Workflow Studio - 多Agent协作可视化平台
  image:
    src: /logo.svg
    alt: logo
  actions:
    - theme: brand
      text: 开始阅读
      link: /posts/2026-06-12-opencode-workflow-studio
    - theme: alt
      text: GitHub
      link: https://github.com/mu8429

features:
  - icon: 🎨
    title: 可视化工作流
    details: 7种节点类型，拖拽编排，AI自然语言生成工作流
  - icon: 🤖
    title: 多Agent协作
    details: 编排、监控和管理多个opencode Agent协作完成复杂任务
  - icon: 📦
    title: 13个内置模板
    details: 代码审查、Bug修复、文档生成、安全审计等场景
  - icon: 🚀
    title: 实时流式输出
    details: WebSocket实时推送，50ms合流缓冲，实时观察执行过程
  - icon: 💾
    title: 断点续传
    details: 节点级检查点，崩溃或暂停后从断点恢复
  - icon: 🧠
    title: 记忆系统
    details: 按工作区隔离存储，支持跨工作流传递、共享数据池
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 一言API
  fetch('https://v1.hitokoto.cn')
    .then(response => response.json())
    .then(data => {
      const el = document.getElementById('hitokoto')
      if (el) el.textContent = data.hitokoto
    })
    .catch(console.error)
})
</script>

<div class="hitokoto-container">
  <p id="hitokoto" class="hitokoto">加载中...</p>
</div>

<style>
.hitokoto-container {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  text-align: center;
}

.hitokoto {
  color: #4a5568;
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
}
</style>
