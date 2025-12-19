<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vitepress'

const { Layout } = DefaultTheme
const router = useRouter()

/**
 * mainランドマークを追加する
 * VitePressのデフォルトレイアウトにはmain要素がないため、
 * VPDocまたはVPHomeにrole="main"を追加する（アクセシビリティ改善）
 */
function addMainLandmark() {
  // VPDoc（ドキュメントページ）またはVPHome（ホームページ）にmainロールを追加
  const mainContent = document.querySelector('.VPDoc, .VPHome')
  if (mainContent && !mainContent.hasAttribute('role')) {
    mainContent.setAttribute('role', 'main')
  }
}

onMounted(() => {
  nextTick(addMainLandmark)
})

// ページ遷移時にも適用
router.onAfterRouteChange = () => {
  nextTick(addMainLandmark)
}
</script>

<template>
  <Layout />
</template>
