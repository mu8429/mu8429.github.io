import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "mu8429's Blog",
  description: '探索AI工作流的无限可能',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '主页', link: '/' },
      { text: '归档', link: '/archives' },
      { text: '标签', link: '/tags' },
      { text: '关于', link: '/about' }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/mu8429' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2015-${new Date().getFullYear()} mu8429`
    },
    
    search: {
      provider: 'local'
    },
    
    outline: {
      level: [2, 3],
      label: '目录'
    },
    
    lastUpdated: {
      text: '最后更新于'
    },
    
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  },
  
  markdown: {
    lineNumbers: true,
    toc: { level: [1, 2, 3] }
  }
})
