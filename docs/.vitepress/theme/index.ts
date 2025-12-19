import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import PageHeader from './components/PageHeader.vue'
import CommandList from './components/CommandList.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        // グローバルコンポーネントとして登録
        app.component('PageHeader', PageHeader)
        app.component('CommandList', CommandList)
    }
} satisfies Theme
