import DefaultTheme from 'vitepress/theme'
import PageHeader from './components/PageHeader.vue'
import CommandList from './components/CommandList.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    app.component('PageHeader', PageHeader)
    app.component('CommandList', CommandList)
  }
}
