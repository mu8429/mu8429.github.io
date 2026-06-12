---
title: 标签
layout: page
---

<script setup>
import { computed } from 'vue'

// 文章和标签数据
const posts = [
  {
    title: 'opencode Workflow Studio: 多Agent协作可视化平台',
    date: '2026-06-12',
    path: '/posts/2026-06-12-opencode-workflow-studio',
    tags: ['AI', '工作流', 'opencode', '可视化']
  }
]

// 获取所有标签
const allTags = computed(() => {
  const tagMap = {}
  posts.forEach(post => {
    post.tags.forEach(tag => {
      if (!tagMap[tag]) {
        tagMap[tag] = []
      }
      tagMap[tag].push(post)
    })
  })
  return tagMap
})

// 当前选中的标签
const selectedTag = ref(null)

// 选中的文章
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts
  return posts.filter(post => post.tags.includes(selectedTag.value))
})
</script>

# 标签

<div class="tags-container">
  <div class="tags-cloud">
    <button 
      v-for="(posts, tag) in allTags" 
      :key="tag"
      :class="['tag-btn', { active: selectedTag === tag }]"
      @click="selectedTag = selectedTag === tag ? null : tag"
    >
      {{ tag }}
      <span class="tag-count">{{ posts.length }}</span>
    </button>
  </div>

  <div class="posts-list">
    <a 
      v-for="post in filteredPosts" 
      :key="post.path"
      :href="post.path"
      class="post-card"
    >
      <div class="post-info">
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-meta">
          <span class="post-date">{{ post.date }}</span>
          <div class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </a>
  </div>
</div>

<style>
.tags-container {
  max-width: 800px;
  margin: 0 auto;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.tag-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tag-count {
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  display: block;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  text-decoration: none;
  color: #2d3748;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.post-card:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.post-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-date {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #667eea;
}

.dark .tag-btn {
  background: rgba(102, 126, 234, 0.15);
  color: #818cf8;
}

.dark .tag-btn.active {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}

.dark .post-card {
  color: #e2e8f0;
  background: rgba(102, 126, 234, 0.05);
}

.dark .post-card:hover {
  background: rgba(102, 126, 234, 0.1);
}
</style>
