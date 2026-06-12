---
title: 关于我
layout: page
---

# 关于我

<div class="about-container">
  <div class="about-header">
    <div class="avatar-placeholder">
      <span>M</span>
    </div>
    <div class="intro">
      <h2>mu8429</h2>
      <p class="tagline">探索AI工作流的无限可能</p>
      <div class="social-links">
        <a href="https://github.com/mu8429" target="_blank" class="social-link">
          GitHub
        </a>
      </div>
    </div>
  </div>

  <div class="about-content">
    <h3>关于这个博客</h3>
    <p>
      这是我的个人博客，主要分享关于AI工作流、opencode Workflow Studio以及相关技术的文章。
      我致力于探索如何让多个AI Agent协作完成复杂任务，并将这些经验分享给大家。
    </p>

    <h3>技术栈</h3>
    <p>本博客使用以下技术构建：</p>
    <ul>
      <li><strong>VitePress</strong> - 静态站点生成器</li>
      <li><strong>Vue 3</strong> - 前端框架</li>
      <li><strong>GitHub Pages</strong> - 托管服务</li>
      <li><strong>GitHub Actions</strong> - 自动部署</li>
    </ul>

    <h3>联系方式</h3>
    <p>
      如果你有任何问题或建议，欢迎通过以下方式联系我：
    </p>
    <ul>
      <li>GitHub: <a href="https://github.com/mu8429" target="_blank">@mu8429</a></li>
      <li>博客评论：在文章下方留言</li>
    </ul>
  </div>
</div>

<style>
.about-container {
  max-width: 800px;
  margin: 0 auto;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
}

.avatar-placeholder span {
  font-size: 3rem;
  color: white;
  font-weight: 700;
}

.intro h2 {
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2rem;
}

.tagline {
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.about-content {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.about-content h3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.3rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.about-content h3:first-child {
  margin-top: 0;
}

.about-content p {
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.about-content ul {
  list-style: none;
  padding: 0;
}

.about-content li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #4a5568;
}

.about-content li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.about-content a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.about-content a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.dark .about-header {
  background: rgba(102, 126, 234, 0.1);
}

.dark .about-content {
  background: rgba(30, 30, 30, 0.5);
}

.dark .tagline,
.dark .about-content p,
.dark .about-content li {
  color: #e2e8f0;
}

@media (max-width: 768px) {
  .about-header {
    flex-direction: column;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
  
  .intro h2 {
    font-size: 1.5rem;
  }
}
</style>
