import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'

const theme: Theme = {
  extends: DefaultTheme,
  
  enhanceApp({ app }) {
    // 注册自定义组件
  }
}

export default theme
