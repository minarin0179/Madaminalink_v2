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
