# mu8429's Blog

这是我的个人技术博客，基于 Hugo / Hugo-Stack 构建，部署在 GitHub Pages。

## 本地运行

### 安装 Hugo

1. 下载 Hugo Extended 版本：https://gohugo.io/installation/
2. 解压到任意目录
3. 将 Hugo 添加到系统 PATH

### 运行博客

```bash
# 克隆仓库
git clone https://github.com/mu8429/mu8429.github.io.git
cd mu8429.github.io

# 初始化子模块（主题）
git submodule update --init --recursive

# 启动开发服务器
hugo server -D
```

本地预览地址：http://localhost:1313/

## 构建

```bash
hugo --gc --minify
```

构建产物会生成在 `public/` 目录。

## 文章目录

文章放在：

```
content/posts/
├── java/           # Java 后端
├── springboot/     # Spring Boot
├── database/       # 数据库
├── ai-tools/       # AI 工具
├── projects/       # 项目复盘
├── interview/      # 面试总结
├── blog/           # 博客搭建
└── notes/          # 学习笔记
```

## 创建新文章

```bash
hugo new posts/java/my-new-post.md
```

## 部署

推送到 main 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

## 技术栈

- [Hugo](https://gohugo.io/) - 静态网站生成器
- [Hugo Stack](https://github.com/CaiJimmy/hugo-theme-stack) - 博客主题
- [GitHub Pages](https://pages.github.com/) - 托管服务
- [GitHub Actions](https://github.com/features/actions) - 自动部署

## 许可证

[MIT License](LICENSE)
