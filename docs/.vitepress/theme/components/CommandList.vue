<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { data as commandsData } from '../../commands.data.mts'

const { theme } = useData()

// サイドバーからコマンドカテゴリを取得
const categories = computed(() => {
  const sidebar = theme.value.sidebar?.['/commands/']
  if (!Array.isArray(sidebar)) return []
  return sidebar
})
</script>

<template>
  <div class="command-list">
    <div v-for="category in categories" :key="category.text" class="category">
      <h2 :id="category.text">{{ category.text }}</h2>
      <table>
        <thead>
          <tr>
            <th>コマンド</th>
            <th>説明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in category.items" :key="item.link">
            <td>
              <a :href="item.link">{{ commandsData[item.link]?.title || item.text }}</a>
            </td>
            <td>{{ commandsData[item.link]?.description || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.command-list h2 {
  border-top: none;
  margin-top: 2rem;
  padding-top: 0;
}

.command-list h2:first-child {
  margin-top: 0;
}

.command-list table {
  width: 100%;
  border-collapse: collapse;
}

.command-list th,
.command-list td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px 12px;
  text-align: left;
}

.command-list th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

.command-list td:first-child {
  white-space: nowrap;
}

.command-list a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.command-list a:hover {
  text-decoration: underline;
}
</style>
