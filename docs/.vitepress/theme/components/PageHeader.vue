<!--
  PageHeader - ページのタイトルと説明を表示するコンポーネント

  使用方法:
  1. ページのfrontmatterにtitleとdescriptionを設定
  2. Markdownファイル内で <PageHeader /> を記述

  例:
  ---
  title: /setup
  description: 新規プレイ用のカテゴリ、チャンネル、ロールを一括作成します。
  ---
  <PageHeader />
-->
<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <h1>{{ frontmatter.title }}</h1>
  <p class="description">{{ frontmatter.description }}</p>
</template>

<style scoped>
.description {
  font-size: 1.1em;
  color: var(--vp-c-text-2);
  margin-top: -0.5em;
  margin-bottom: 1.5em;
}
</style>
