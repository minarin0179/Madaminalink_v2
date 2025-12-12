import DefaultTheme from 'vitepress/theme'
import PageHeader from './components/PageHeader.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    app.component('PageHeader', PageHeader)
  }
}
