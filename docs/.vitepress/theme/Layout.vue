<script setup lang="ts">
import { useRouter } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, onMounted, onUnmounted } from "vue";

const { Layout } = DefaultTheme;
const router = useRouter();

/**
 * mainランドマークを追加する
 * VitePressのデフォルトレイアウトにはmain要素がないため、
 * VPDocまたはVPHomeにrole="main"を追加する（アクセシビリティ改善）
 * 注: VitePressでは.VPDocと.VPHomeは排他的に存在するため、最初にマッチした要素を使用
 */
function addMainLandmark() {
    const mainContent = document.querySelector(".VPDoc, .VPHome");
    if (mainContent && mainContent.getAttribute("role") !== "main") {
        mainContent.setAttribute("role", "main");
    }
}

// 元のハンドラを保存
const originalHandler = router.onAfterRouteChange;

onMounted(() => {
    nextTick(addMainLandmark);
});

// ページ遷移時にも適用
router.onAfterRouteChange = to => {
    originalHandler?.(to);
    nextTick(addMainLandmark);
};

// クリーンアップ
onUnmounted(() => {
    router.onAfterRouteChange = originalHandler;
});
</script>

<template>
  <Layout />
</template>
