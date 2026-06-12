---
title: 归档
layout: page
---

<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { theme } = useData()

// 获取所有文章并按日期分组
const posts = computed(() => {
  // 这里需要从实际数据源获取文章列表
  return [
    {
      title: 'opencode Workflow Studio: 多Agent协作可视化平台',
      date: '2026-06-12',
      path: '/posts/2026-06-12-opencode-workflow-studio'
    }
  ]
})

// 按年份分组
const postsByYear = computed(() => {
  const grouped = {}
  posts.value.forEach(post => {
    const year = post.date.substring(0, 4)
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(post)
  })
  return grouped
})
</script>

# 归档

<div class="archives-container">
  <div v-for="(posts, year) in postsByYear" :key="year" class="year-group">
    <h2 class="year-title">{{ year }}</h2>
    <div class="post-list">
      <a v-for="post in posts" :key="post.path" :href="post.path" class="post-item">
        <span class="post-date">{{ post.date.substring(5) }}</span>
        <span class="post-title">{{ post.title }}</span>
      </a>
    </div>
  </div>
</div>

<style>
.archives-container {
  max-width: 800px;
  margin: 0 auto;
}

.year-group {
  margin-bottom: 2rem;
}

.year-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  text-decoration: none;
  color: #2d3748;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.post-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(10px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.post-date {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
  min-width: 60px;
}

.post-title {
  font-weight: 500;
}

.dark .post-item {
  color: #e2e8f0;
  background: rgba(102, 126, 234, 0.05);
}

.dark .post-item:hover {
  background: rgba(102, 126, 234, 0.1);
}
</style>
